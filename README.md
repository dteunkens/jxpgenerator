# JXP Generator

The `JXP Generator` fixes some problems `JXcore`'s package function (download the `JXcore` binary from **http://jxcore.com/downloads/**). The `jx package` function often leaves out necessary .js and .json files from the `node_modules` directory. This results in an executable that doesn't work on its own. When a file is missing in the executable, the files are looked for in the same way `Node JS` always does: it checks out a myriad of places, including a possible `node_modules` next to the executable.

The most easy fix would be to just copy the `node_modules` directory along with the executable. Still no `Node JS` nor `JXcore` would need to be installed, but copying the `node_modules` directories is a cumbersome task, since it may contains many, many (small) files.

Instead, this project will exhaustively traverse the original `node_modules` directory, and scour it for all .js and .json files. Granted, we will probably end up with too many .js and .json files, and we will add a couple of kB's to the executable, but the result is a genuine, stand-alone executable.

# Command line arguments

The following arguments can be passed:
* name
  * one string
* ignore
  * one or more relative paths, where the tool won't look for .js or .json files.

# Github
The project has been placed on GitHub, so we can simply `npm install` it to any project we want.
```
https://github.com/dteunkenstt/jxpgenerator
```

# Seeing it in action

You can simple run the following command to create an executable of the `JXP Generator` project:
```
npm run compile
```

What this does, is look for a `compile` script inside the `package.json`.
The `package.json` for this project, contains:
```
...
"scripts": {
    "precompile": "node index.js -name \"jx generator\"",
    "compile": "jx compile \"jx generator.jxp\""
  },
...
```

Running `npm run compile`...
* first executes the `precompile` script. This runs the code in `index.js`, which creates a `jx generator.jxp` file.
* then executes the `compile` script. This one tells `JXcore` to compile that .jxp-file to an executable.

And we end up with `jx generator.exe`!

# Using it in your own project

First, make sure you have the JXP Generator project at you disposal. In your project directory, run:
```
npm install --save-dev git://github.com/dteunkenstt/jxpgenerator.git
```

Then, make some changes to your `package.json`:
```
...
"scripts": {
    "precompile": "node .\\node_modules\\jxpgenerator\\index.js -name <whatever-name-you-like> -ignore node_modules\\jxpgenerator",
    "compile": "jx compile <whatever-name-you-like>.jxp"
  },
...
```

Lastly, run:
```
npm run compile
```

The result is an executable with the same same as you choose in `package.json`.
