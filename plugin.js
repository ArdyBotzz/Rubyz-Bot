const path = require("path");

/*
@type Array pluginsFolder
@type String child pluginsFolder
Read a directory from folder 'plugins'
*/
let pluginsFolder = path.join(__dirname, 'plugins')
/*
@type RegExp pluginsFilter
@type String filename
Filter array to determine filename with javascript extension
*/
let pluginsFilter = filename => /\.js$/.test(filename)
/*
@type Object plugins
@type String keys plugins
Put the filename in the plugins object
*/
global.plugins = {}
/*
@type Object plugins
@type Function value plugins
Filling the keys filename object plugins with function
*/
for (let filename of fs.readFileSync(pluginsFolder).filter(pluginsFilter)) {
  try {
    global.plugins[filename] = require(path.join(pluginsFolder, filename))
  } catch (e) {
    console.log(e)
    delete global.plugins[filename]
  }
}
/*
@type Object plugins
@type Function value plugins
Display the contents of the plugins object in the log
*/
console.log(Object.keys(global.plugins))