# ****Interpreters, JITS, & Compilers****

Compilers, interpreters, and just-in-time (JIT) compilers are all responsible for translating and executing code, but they differ in how they accomplish this task. In this article, we will explain how each of them works and the differences between them, using a toy language called QuipScript.

## A toy language

QuipScript is a small language that constructs, modifies, and prints a single stateful string value. Here's an example QS program:

```jsx

# One statement per line, three kinds of statements:
#lines start with '#' are comments (ignored)

# adds any following characters to the string.
# `print` (or any line beginning with `p`) prints the current string state.
hello
print
 world
print
```

QuipScript program has a single implicit stateful string that begins empty. In this example, we first concatenate `hello` into the string. Next, we `print` the current state of the string. Afterward, we concat `world`,  Our string state is now `hello world` — which we `print`.

Our QR code is certainly useless without a way to execute it. Therefore, let's build a program to execute it.

## interpreters

An interpreter **translates and executes** the code line by line, let’s write a js interpreter to describe this:

```jsx

/**
 * QuipScript Interpreter!
 * reads in a QS file and interprets it.
 * Interpretation executes the desired behavior "live" as the source code is read.
 */
const { readFileSync } = require("fs");
const sourceCodeFile = "./text.qs";

let string = "";
let sourceCode = readFileSync(sourceCodeFile, "utf-8");

sourceCode.split("\r\n").forEach((line) => {
  if (line[0] == "p") {
    console.log(string);
  } else {
    string += line;
  }
});
```

in this example, every line in QS code is read, translated, and executed immediately.

this is the output of our code:

```jsx
hello
hello world
```

what if we had an error in the middle of the file, what will be the output?

```jsx
hello
c:\Users\yahya\Desktop\test\test.js:11
    throw new Error("ERROR I AM AN INVALID LINE");
    ^

Error: ERROR I AM AN INVALID LINE
    at c:\Users\yahya\Desktop\test\test.js:11:11
```

as you see, the `hello` is printed before the error occurs. Interpreters perform some work before failing.

## JIT compilers

while interpreters translate (compile) each line and execute it, JIT compilers identify hotspots (frequently executed code), compile the source code into machine code, then run that machine code as soon as possible.

```jsx
const { readFileSync } = require("fs");
const sourceCodeFile = "./hello-world.qs";

/**
 * This program reads a QS file, compiles it & then runs it.
*/

let program = 'let string = ""\n';
let sourceCode = readFileSync(sourceCodeFile, "utf-8");

sourceCode.split("\r\n").forEach(line => {
    if (line[0] == "p") {
      program += "console.log(string)\n";
    } else if (line[0] == "t") {
      throw new Error("ERROR I AM AN INVALID LINE");
    } else if (line[0] == "#") {
    } else {
      program += `string += '${line}'\n`;
    }
})

eval(program)
```

we converted the source code into machine code (JS code for this article) and then immediately executed it.

if we have an error in our code no work will be performed

```jsx
e:\projects\presentation\jit.js:11
      throw new Error("ERROR I AM AN INVALID LINE");
      ^

Error: ERROR I AM AN INVALID LINE
    at e:\projects\presentation\jit.js:11:13
```

notice that `hello` wasn’t printed here, unlike **interpreters.**

## Compilers

If we wanted to re-run our QS code, we could pass it through either the interpreter or JIT again. But then we’d be re-doing all the work from scratch. Wouldn’t it make sense to compile *once*, ahead of time, and simply save the generated JS program for future use?

compilers translate the whole source code to machine code and save it in an output file.

```jsx
const { readFileSync, writeFileSync } = require("fs");
const sourceCodeFile = "./hello-world.qs";

/** 
 * This program reads in a QS file, compiles it & then outputs it.
*/

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

```

this compiler generates the following JS file

```jsx
let string = "";
string += "hello";
console.log(string);
string += " world";
console.log(string);
```

close to how JIT but it instead saves the machine code into a file that can be executed (fast) later.

## Optimized AOT Compilers

Optimized compilers do some logic while compiling the source code.

yes, it may take longer to compile but the compiled code is more efficient

```jsx
const { readFileSync, writeFileSync } = require("fs");
const sourceCodeFile = "./hello-world.qs";

//This program reads a QS file, compiles it, optimizes it, & then outputs it

let program = '';
let string = '';
let sourceCode = readFileSync(sourceCodeFile, "utf-8");

sourceCode.split("\r\n").forEach((line) => {
  if (line[0] == "p") {
    program += `console.log('${string}')\n`;
  } else if (line[0] == "t") {
    throw new Error("ERROR I AM AN INVALID LINE");
  } else if (line[0] == "#") {
  } else {
    string += line;
  }
});

writeFileSync("./output2.js", program);

```

this optimized compiler generates the following code

```jsx
console.log('hello')
console.log('hello world')
```

The “optimization” shown in this example was practically interpretation itself, but optimizations take many forms, including:

- **Dead code elimination** — if some source code could logically never be useful, remove it from the output. For example, if we did some more concatenation after the final `print`, that would be pointless work.
- **Register allocation** — the most used variables might be stored closer to the processor (e.g. in explicit registers), so they do not have to be retrieved from higher layers (e.g. RAM).
- **Loop unrolling** — if the number of passes of a loop can be analyzed ahead of time, a loop can be converted into a simple sequence of statements with no expensive “jump” commands or control flow statements.
- **Inlining** — if a variable is used just to name some constant data reused across the app, the compiler can simply replace the variable with the data in the output code (saving a memory lookup)

### Comparison Table

| Entity | Action | Result | Compile Time | Result Start Time | Result Running Speed |
| --- | --- | --- | --- | --- | --- |
| Interpreter | Read source code and execute program logic as it goes | Performs task directly | Zero (N/A) | Immediate | Slow |
| JIT Compiler | Read source code and translate to object code, then run object code | Runs output program | Fast | Soon | Good |
| AOT Compiler | Read source code and translate to object code, then save object code | Saves output program | (Can be) fast | Immediate when used (in the future) | Good |
| Optimizing AOT Compiler | Read source code, translate to object code, improve it, then save it | Saves output program | Slow | Immediate when used (in the future) | Best |