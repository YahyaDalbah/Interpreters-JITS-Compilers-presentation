const { readFileSync, writeFileSync } = require("fs");
const sourceCodeFile = "./hello-world.qs";

let program = 'let string = ""\n';
let sourceCode = readFileSync(sourceCodeFile, "utf-8");

sourceCode.split("\r\n").forEach((line) => {
  if (line[0] == "p") {
    program += "console.log(string)\n";
  } else if (line[0] == "t") {
    throw new Error("ERROR I AM AN INVALID LINE");
  } else if (line[0] == "#") {
  } else {
    program += `string += '${line}'\n`;
  }
});

writeFileSync('./output.js', program);
