/* jshint asi: true */
const editor = require("ko/editor")

//const FunctionAttribs = ko.extensions.AI.FunctionAttribs
const FunctionAttribs = importObject('FunctionAttribs', 'FunctionAttribs')

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

exportObject('Ide', Ide)
