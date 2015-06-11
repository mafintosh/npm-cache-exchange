#!/usr/bin/env node

var exchange = require('./')
var airpaste = require('airpaste')

if (process.argv.indexOf('--help') > -1) {
  console.error('Usage: npm-cache-exchange [optional-namespace]')
  process.exit(0)
}

var ex = exchange()
var stream = airpaste('npm-cache-exchange-' + (process.argv[2] || 'any'))

ex.on('fetch', function (file) {
  console.log('Fetching', file)
})

ex.on('send', function (file) {
  console.log('Sending', file)
})

stream.pipe(ex).pipe(stream)
