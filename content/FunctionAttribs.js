if (typeof ko.extensions === 'undefined') ko.extensions = {}
if (typeof ko.extensions.AI === 'undefined') ko.extensions.AI = { version : '0.0.1' }

ko.extensions.AI.FunctionAttribs = function (protoClass) {
    function setAttrib(chain, value) {
        var chain = chain.slice()
        const last = chain.pop()
        var parent = protoClass

        for (var i = 0; i < chain.length; i++) {
            var childName = chain[i]

            if (parent[childName] === undefined) {
                parent[childName] = {}
            }
            parent = parent[childName]
        }

        parent[last] = value
    }

    function getAttrib(chain, remove) {
        var chain = chain.slice()
        const last = chain.pop()

        var parent = protoClass
        for (var i = 0; i < chain.length; i++) {
            if (parent === undefined) {
                return undefined
            }

            parent = parent[chain[i]]
        }

        if (parent === undefined || parent[last] === undefined) {
            return undefined
        }

        const value = parent[last]
        if (remove) {
            parent[last] = undefined
        }
        return value
    }

    const allowedAttributes = ['description', 'exposeToAi']
    for (var i = 0; i < allowedAttributes.length; i++) {
        setAttrib(['attributes', allowedAttributes[i]], {})
    }

    setAttrib(['attributes', 'description'], {})
    this.description = function (value) {
        setAttrib(['attributes', 'description', '_pending'], value)
    }

    setAttrib(['attributes', 'exposeToAi'], {})
    this.exposeToAi = function (value) {
        setAttrib(['attributes', 'exposeToAi', '_pending'], value)
    }

    this.add = function (name) {
        for (var i = 0; i < allowedAttributes.length; i++) {
            var atribName = allowedAttributes[i]
            var value = getAttrib(['attributes', atribName, '_pending'], true)
            if (value !== undefined) {
                setAttrib(['attributes', atribName, name], value)
            }
        }

        return name
    }
}
