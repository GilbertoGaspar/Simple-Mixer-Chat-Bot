const fs = require('fs');
const path = require('path');

function writeCommandConfig(commandList) {
  var jsonContent = JSON.stringify(commandList);
  fs.writeFile(
    path.join(__dirname, 'commands.json'),
    jsonContent,
    'utf8',
    function(err) {
      if (err) {
        console.log('An error occured while writing JSON Object to File.');
        return console.log(err);
      }
    }
  );
}

function readCommandConfig(cb) {
  fs.readFile(path.join(__dirname, 'commands.json'), (err, data) => {
    if (err) throw err;
    cb(JSON.parse(data));
  });
}

function readPeposJson(cb) {
  fs.readFile(path.join(__dirname, 'pepos.json'), (err, data) => {
    if (err) throw err;
    cb(JSON.parse(data));
  });
}

module.exports = {
  writeCommandConfig,
  readCommandConfig,
  readPeposJson
};
