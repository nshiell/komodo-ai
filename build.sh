#!/bin/sh

# XPI Name
_xpiName=komodo-ai.xpi

# Check if the build directory exists
if [ -d ./build ]; then
    # Clear the contents of the directory
    rm -rf ./build/*
else
    mkdir ./build
fi

mkdir ./build/xpi

echo "
/* jshint asi: true */
if (typeof ko.extensions === 'undefined') ko.extensions = {}
if (typeof ko.extensions.ai === 'undefined') ko.extensions.ai = {version : '0.0.1'}

this.onerror = alert
;(() => {

const pendingImports = {}

function importObject(moduleName, name) {
    if (ko.extensions.ai[moduleName] === undefined) {
        if (pendingImports[moduleName] === undefined) {
            throw moduleName +' was not found'
        }

        pendingImports[moduleName]()
    }

    if (ko.extensions.ai[moduleName][name] === undefined) {
        throw moduleName + ' ' + name + ' was not found'
    }

    return ko.extensions.ai[moduleName][name]
}

" > ./content/ai.js

for filePath in ./contentSource/*; do
    moduleName="$(b=${filePath##*/}; echo ${b%.*})"
    echo

    echo ";pendingImports.$moduleName = () => {((exportObject) => {"
    cat $filePath
    echo "})((name, obj) => {
        if (!ko.extensions.ai.$moduleName) {
            ko.extensions.ai.$moduleName = {}
        }

        ko.extensions.ai.$moduleName[name] = obj
    })}"
done >> ./content/ai.js

echo "pendingImports.AI()" >> ./content/ai.js
echo "})()" >> ./content/ai.js

# Copy the files and folders required into the build directory
cp -r ./content ./build/xpi/
#cp -r ./skin ./build/xpi/
#cp -r ./xtk2 ./build/xpi/
cp chrome.manifest ./build/xpi/
cp install.rdf ./build/xpi/

# Remove old XPI file name
rm -f $_xpiName

# Create the XPI file
cd ./build/xpi/
zip -X -r $_xpiName *

cp $_xpiName ../../
