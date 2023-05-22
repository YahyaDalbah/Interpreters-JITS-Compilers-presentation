const { readFileSync } = require("fs");
const sourceCodeFile = "./error.qs";

let string = "";
let sourceCode = readFileSync(sourceCodeFile, "utf-8");

sourceCode.split("\r\n").forEach((line) => {
  if (line[0] == "p") {
    console.log(string);
  } else if(line[0] == "t") {
    throw new Error("ERROR I AM AN INVALID LINE");
  }else if(line[0] == '#'){}
  else{
    string += line
  }
});
