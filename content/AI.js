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

    Description("Gets the current time and the date")
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

ko.extensions.AI.hisory = [{
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

ko.extensions.AI.test = function ($history) {
    const tools = (new Tools(new Ide(editor, ko))).get()
}
/*
["version","printing","prefs","main","mozhacks","objectTimer","dragdrop","dialogs","windowManager","uilayout","uriparse","filepicker","open","mru","commands","macros","findcontroller","stringutils","treeutils","widgets","utils","findresults","find","findtoolbar","run","interpolate","views","tabstops","keybindings","browse","help","launch","inputBuffer","window","workspace","workspace2","statusBar","markers","history","projects","toolboxes","fileutils","lint","eggs","abbrev","snippets","hyperlinks","dbg","scc","services","formatters","extensions","analytics","profiler","tcldevkit","perldevkit","koextgen","httpinspector","publishing","changeTracker","refactoring","_hasFocus","moreKomodo","logging","toolbox2","places","openfiles","dbexplorer","collaboration","notifications"]*/
/*
["invokePart","invokePartById","findPartById","removeImportedVirtualFilesAndFolders","reimportFromFileSystem","importFromPackage","_importFromPackage","_importPackageViaHttp","toolPathShortName","managers","BaseManager","findItemsByURL","removeItemsByURL","removeItemsByURLList","findPartsByURL","hasURL","invalidateItem","addItem","_toolboxParts","findPart","manager","open","saveProjectAs","renameProject","onload","prepareForShutdown","handle_parts_reload","safeGetFocusedPlacesView","log","extensionManager","registerExtension","exportItems","exportPackageItems","refreshStatus","fileProperties","addFileWithURL","addPartWithURLAndType","_getDirFromPart","addNewFileFromTemplate","addFile","addRemoteFile","addRemoteFolder","addGroup","removeItems","snippetProperties","addSnippet","addSnippetFromText","snippetInsert","_detabify","_stripLeadingWS","snippetInsertImpl","_textFromEJSTemplate","printdebugProperties","addPrintdebug","printdebugInsert","commandProperties","runCommand","URLProperties","addURLFromText","addURL","peMenu","customIdFromPart","partAcceptsMenuToolbar","addMenu","addMenuFromPart","removeMenuForPart","removeToolbarForPart","addToolbarFromPart","onToolboxLoaded","onToolboxUnloaded","updateToolbarForPart","isToolbarRememberedAsHidden","toggleToolbarHiddenStateInPref","addToolbar","menuProperties","addMacro","executeMacro","executeMacroById","macroProperties","addTutorial","tutorialProperties","addTemplate","templateProperties","chooseTemplate","useTemplate","folderTemplateProperties","addFolderTemplate","createFolderTemplateFromDir","chooseFolderTemplate","useFolderTemplate","SCC","active"]*/


//alert(JSON.stringify(Object.keys(ko.projects)))
function askQuery($chatHistory) {
    // create an instance of the XMLHttpRequest object
    var req = new XMLHttpRequest()

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

    //alert(JSON.stringify(ko.extensions.AI.hisory))

    req.onreadystatechange = function() {
        if (req.readyState == XMLHttpRequest.LOADING) {
            var newLength = req.response.length
            var newMessage = JSON.parse(req.response.substring(responseLength, newLength))

            ko.extensions.AI.hisory.push(newMessage.message)

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
                //[TOOL_CALLS] {"function": "Ide_getValue", "arguments": {}}
                if (newMessage.message.content.substring(0, 12) == '[TOOL_CALLS]') {
                    alert('yuck')
                    var methodName = JSON.parse(newMessage.message.content.substring(13)).function
                    toolPromises.push(new Promise((resolve) => ((ide[methodName])
                        ? resolve(ide[methodName]())
                        : resolve('Method not found: ' + methodName)
                    )))
                } else {
                    try {
                        var messageAsToolCall = JSON.parse(newMessage.message.content)
                        if (ide[messageAsToolCall.name]) {// double if condition
                            alert('also yuck!')
                            var methodName = messageAsToolCall.name
                            toolPromises.push(new Promise((resolve) => ((ide[methodName])
                                ? resolve(ide[methodName]())
                                : resolve('Method not found: ' + methodName)
                            )))
                        } else {
                            $chatHistory.value+= newMessage.message.content
                        }
                    } catch(e) {
                        $chatHistory.value+= newMessage.message.content
                    }
                }
            }
/*
{"role":"user","content":"What is the current version of komodo ide?"},
{"role":"assistant","content":"  {\"input\": \"What is the current version of komodo ide?\", \"name\": \"Ide_getKomodoIdeVersion\"}"},
*/


/*
{"role":"user","content":"What is the current version of komodo?"},
{"role":"assistant","content":"[TOOL_CALLS] {\"content\": \"Komodo IDE 14.0.1 (Build: commit@3fa7a8e)\"}"},
{"role":"tool","content":"Method not found: undefined"}]
*/
            responseLength = newLength
        } else if (req.readyState == XMLHttpRequest.DONE) {
            if (toolPromises.length) {
                Promise.all(toolPromises).then((resolved) => {
                    for (var i in resolved) {
                        ko.extensions.AI.hisory.push({
                            'role': 'tool',
                            'content': resolved[i]
                        })
                    }
                    askQuery($chatHistory)
                })

                /*setTimeout(() =>
                    alert(JSON.stringify(ko.extensions.AI.hisory[ko.extensions.AI.hisory.length - 1]))
                , 10000)*/

            } else {
                $chatHistory.value+= '\n---------------\n'
            }
        }
    }

    req.send(JSON.stringify({
        'stream': false,
        'model': 'mistral-nemo',
        //'model': 'llama3.1
        'messages': ko.extensions.AI.hisory,
        'tools': tools
    }))
}


ko.extensions.AI.ask = function ($query, $chatHistory) {
    const query = $query.value

    if (!query.trim()) {
        return null
    }

    $query.value = ''
    $chatHistory.value+= '\n\nUser:\n' + query + '\n\nKomodo IDE:\n'

    ko.extensions.AI.hisory.push({
        'role': 'user',
        'content': query
    })

    askQuery($chatHistory)
}
