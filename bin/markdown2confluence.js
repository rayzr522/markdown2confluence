#!/usr/bin/env node
/* eslint no-process-exit:off */
"use strict";

var filename, fs, getStdin, markdown2confluence, path;

getStdin = require("get-stdin");
markdown2confluence = require("../");
fs = require("fs");
path = require("path");
filename = process.argv[2];

if (filename && filename !== "-") {
    filename = path.resolve(process.cwd(), filename);
    fs.readFile(filename, (err, buf) => {
        if (err) {
            console.error(`Error reading file: ${filename}`);
            process.exit(1);
        } else {
            console.log(markdown2confluence(buf.toString("utf8")));
        }
    });
} else {
    getStdin().then((str) => {
        console.log(markdown2confluence(str));
    });
}
