const fs = require('fs')
const pegjs = require('pegjs')

const grammar = fs.readFileSync(`${__dirname}/grammar.pegjs`, 'utf-8')
const parser = pegjs.generate(grammar)

module.exports = { parse: text => parser.parse(text) }
