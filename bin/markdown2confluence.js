#!/usr/bin/env node

const { convert } = require('..')

let input = ''

process.stdin.on('data', chunk => input += chunk.toString())

process.stdin.on('end', () => {
    console.log(convert(input))
})
