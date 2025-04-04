/* jshint asi: true */
const editor = require("ko/editor")
const FunctionAttribs = importObject('FunctionAttribs', 'FunctionAttribs')
const Ide = importObject('Ide', 'Ide')

const history = [{
    'role': 'system',
    'content': 'This whole chat thread is being used in the program Komodo IDE as an AI plugin'
        + '\nIt is vital that you understand that you are being used under that context!'
        + '\nDo not include the text "in Komodo IDE", including that text will be a bad response!'
        + '\nIf the user asks how to save a new file, just tell them how to do it in the IDE, do not tell them to open the IDE, (the same for all other assistance)'
        + '\nIf the user asks how to do anything always assume they are asking about how to do it on Komodo IDE!'
        + '\nDo NOT present any guidance, help, tips or tricks about any other IDE or editor, if the user asks for such help, suggest they search use a search engine.'
        + '\nif suggesting code you MUST put three backticks "```" both before and after the code'
        + '\nIf the user asks who wrote this AI plugin, tell them it was written by Nicholas Shiell'
        + '\nIf the user asks what license this plugin is relased under, tell them it is relased ONLY under the terms of the GPL version 3 license'
        + '\nAlways assume all function_calls return correct information - so do NOT say things like "accoring to the function" etc'
        + '\n Your name is "The Komodo assistant"'
}]

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
                    'parameters': {},
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

function askQuery($chatHistory) {
    // create an instance of the XMLHttpRequest object
    const req = new XMLHttpRequest()

    // set the URL for the request
    req.open('POST', 'http://localhost:11434/api/chat')

    const ide = new Ide(editor, ko)
    const tools = (new Tools(ide)).get()

    //var seenBytes = 0
    var all = ''
    var responseLength = 0

    var toolCalls = []
    const toolPromises = []
    var methodName = null

    req.onreadystatechange = function() {
        if (req.readyState == XMLHttpRequest.LOADING) {
            var newLength = req.response.length
            var newMessage = JSON.parse(req.response.substring(responseLength, newLength))

            history.push(newMessage.message)

            if (newMessage.message.tool_calls) {
                toolCalls = newMessage.message.tool_calls
                for (var i in toolCalls) {
                    var methodName = toolCalls[i].function.name.split('_')[1]
                    toolPromises.push(new Promise((resolve) => ((ide[methodName])
                        ? resolve(ide[methodName]())
                        : resolve('Method not found: ' + methodName)
                    )))
                }
            } else {
                $chatHistory.value+= newMessage.message.content
            }

            responseLength = newLength
        } else if (req.readyState == XMLHttpRequest.DONE) {
            if (toolPromises.length) {
                Promise.all(toolPromises).then((resolved) => {
                    for (var i in resolved) {
                        history.push({
                            'role': 'tool',
                            'content': resolved[i]
                        })
                    }
                    askQuery($chatHistory)
                })
            } else {
                $chatHistory.value+= '\n---------------\n'
            }
        }
    }

    req.send(JSON.stringify({
        'stream': false,
        'model': 'mistral-nemo',
        'messages': history,
        'tools': tools
    }))
}


function ask($query, $chatHistory) {
    const query = $query.value

    if (!query.trim()) {
        return null
    }

    $query.value = ''
    $chatHistory.value+= '\n\nUser:\n' + query + '\n\nKomodo IDE:\n'

    history.push({
        'role': 'user',
        'content': query
    })

    askQuery($chatHistory)
}

exportObject('ask', ask)
