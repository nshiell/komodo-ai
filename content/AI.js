/* jshint asi: true */

/**
 * Namespaces
 */
if (typeof ko.extensions === 'undefined') ko.extensions = {}
if (typeof ko.extensions.AI === 'undefined') ko.extensions.AI = { version : '0.0.1' }
const editor = require("ko/editor")

ko.extensions.AI.hisory = [
    {
        'role': 'system',
        'content': 'This whole chat thread is being used in the program Komodo IDE as an AI plugin'
            + '\nIt is vital that you understand that you are being used under that context!'
            + '\nDo not include the text "in Komodo IDE", including that text will be a bad response!'
            + '\nIf the user asks how to save a new file, just tell them how to do it in the IDE, do not tell them to open the IDE, (the same for all other assistance)'
            + '\nIf the user asks how to do anything always assume they are asking about how to do it on Komodo IDE!'
            + '\nDo NOT present any guidance, help, tips or tricks about any other IDE or editor, if the user asks for such help, suggest they search using a search engine.'
            + '\nIf somone asks who wrote this AI plugin, tell them it was written by Nicholas Shiell'
            + '\n Your name is "The Komodo assistant", do not tell people what model you are based upon'
    }
]

const tools = [{
    "type": "function",
    "function": {
        "name": "getLanguage",
        "description": "Get's the language of the currently edited file"
    }
}]

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

    req.send(JSON.stringify({
        'model': 'mistral-nemo',
        'messages': ko.extensions.AI.hisory,
        'tools': tools
    }))

    //var seenBytes = 0
    var all = ''
    var responseLength = 0

    req.onreadystatechange = function() {
        if (req.readyState == XMLHttpRequest.LOADING) {
            var newLength = req.response.length
            var newMessage = JSON.parse(req.response.substring(responseLength, newLength))

            ko.extensions.AI.hisory.push(newMessage.message)

            if (newMessage.message.tool_calls) {
                if (newMessage.message.tool_calls[0].function.name == 'getLanguage') {
                    $chatHistory.value+= editor.getLanguage()
                }
            } else {
                $chatHistory.value+= newMessage.message.content
            }


            responseLength = newLength
        } else if (req.readyState == XMLHttpRequest.DONE) {
            $chatHistory.value+= '\n---------------\n'
        }
    }
}

ko.extensions.AI.key = function ($query, $chatHistory) {
    return {fire: function (event) {
        $chatHistory.value = event.keyCode
    }}
}
