/* jshint asi: true */
if (typeof ko.extensions === 'undefined') ko.extensions = {}
if (typeof ko.extensions.AI === 'undefined') ko.extensions.AI = {version : '0.0.1'}
const editor = require("ko/editor")

this.onerror = alert

const FunctionAttribs = ko.extensions.AI.FunctionAttribs

function Ide(editor, ko) {
    // Register the attributes for this class
    const Description = this.attribs.description
    const ExposeToAi = this.attribs.exposeToAi
    const f = this.attribs.add // including the special call for defining the function

    Description("Gets the language of the currently edited file")
    ExposeToAi(true)
    this[f('getCodeLanguage')] = function () {
        return editor.getLanguage()
    }

    Description("Gets the currently source code from the currently editing open file")
    ExposeToAi(true)
    this[f('getValue')] = function () {
        return editor.getValue()
    }

    Description("Gets the current time and the date from the user's computer")
    ExposeToAi(true)
    this[f('getDateTime')] = function () {
        return (new Date()).toString()
    }

    Description("Gets the version string of this version of Komodo IDE")
    ExposeToAi(true)
    this[f('getKomodoIdeVersion')] = function () {
        return ko.version
    }
}; Ide.prototype.attribs = new FunctionAttribs(Ide)

function Tools(ide) {
    var tools = null

    function build() {
        tools = []

        Object.keys(Ide.attributes.exposeToAi).forEach(function (name) {
            if (!Ide.attributes.exposeToAi[name]) {
                return null
            }

            if (!Ide.attributes.description[name]) {
                return null
            }

            if (!ide[name]) {
                return null
            }

            tools.push({
                'type': 'function',
                'function': {
                    'name': 'Ide_' + name,
                    'description': Ide.attributes.description[name]
                }
            })
        })
    }

    this.get = function() {
        if (tools === null) {
            build()
        }

        return tools
    }
}

ko.extensions.AI.hisory = [{
    'role': 'system',
    'content': 'This whole chat thread is being used in the program Komodo IDE as an AI plugin'
        + '\nIt is vital that you understand that you are being used under that context!'
        + '\nDo not include the text "in Komodo IDE", including that text will be a bad response!'
        + '\nIf the user asks how to save a new file, just tell them how to do it in the IDE, do not tell them to open the IDE, (the same for all other assistance)'
        + '\nIf the user asks how to do anything always assume they are asking about how to do it on Komodo IDE!'
        + '\nDo NOT present any guidance, help, tips or tricks about any other IDE or editor, if the user asks for such help, suggest they search use a search engine.'
        + '\nif suggesting code you MUST put three backticks "```" both before and after the code'
        + '\nIf somone asks who wrote this AI plugin, tell them it was written by Nicholas Shiell'
        + '\n Your name is "The Komodo assistant"'
}]

ko.extensions.AI.test = function ($history) {
    const tools = (new Tools(new Ide(editor, ko))).get()
}

ko.extensions.AI.query = function ($query, $chatHistory) {
    if (!$query.value.trim()) {
        return null
    }

    $chatHistory.value+= '\n\nUser:\n' + $query.value + '\n\nKomodo IDE:\n'

    ko.extensions.AI.hisory.push({
        'role': 'user',
        'content': $query.value
    })

    $query.value = ''

    // create an instance of the XMLHttpRequest object
    var req = new XMLHttpRequest()

    // set the URL for the request
    req.open('POST', 'http://localhost:11434/api/chat')

    const ide = new Ide(editor, ko)
    const tools = (new Tools(ide)).get()

    //var seenBytes = 0
    var all = ''
    var responseLength = 0

    req.onreadystatechange = function() {
        if (req.readyState == XMLHttpRequest.LOADING) {
            var newLength = req.response.length
            var newMessage = JSON.parse(req.response.substring(responseLength, newLength))

            ko.extensions.AI.hisory.push(newMessage.message)

            if (newMessage.message.tool_calls) {
                for (var i in newMessage.message.tool_calls) {
                    const methodName = newMessage.message.tool_calls[i].function.name.split('_')[1]
                    if (ide[methodName]) {
                        $chatHistory.value+= ide[methodName]()
                    }
                }
            } else {
                $chatHistory.value+= newMessage.message.content
            }

            responseLength = newLength
        } else if (req.readyState == XMLHttpRequest.DONE) {
            $chatHistory.value+= '\n---------------\n'
        }
    }

    alert(JSON.stringify(tools))

    req.send(JSON.stringify({
        'model': 'mistral-nemo',
        'messages': ko.extensions.AI.hisory,
        'tools': tools
    }))
}

ko.extensions.AI.key = function ($query, $chatHistory) {
    return {fire: function (event) {
        $chatHistory.value = event.keyCode
    }}
}
