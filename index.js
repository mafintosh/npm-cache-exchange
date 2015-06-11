var fs = require('fs')
var path = require('path')
var parallel = require('parallel-transform')
var multiplex = require('multiplex')
var mkdirp = require('mkdirp')
var pump = require('pump')

var NPM = path.join(process.env.HOME || process.env.USERPROFILE, '.npm')

module.exports = function () {
  var pending = 2

  var plex = multiplex(function (stream, id) {
    if (id === 'have') return onhave(stream)
    plex.emit('send', id)
    var fullpath = path.join(NPM, path.resolve('/', id))
    pump(fs.createReadStream(fullpath), stream)
  })

  var have = plex.createStream('have')

  have.resume()
  have.on('end', done)

  visit(have, NPM, function () {
    have.write('-')
  })

  function done () {
    if (!--pending) plex.end()
  }

  function onhave (stream) {
    var queue = stream.pipe(parallel(32, write))
    queue.resume()
    queue.on('end', onend)

    function onend () {
      stream.end()
      done()
    }

    function write (data, cb) {
      data = data.toString()

      if (data === '-') {
        queue.end()
        return cb()
      }

      var fullpath = path.join(NPM, path.resolve('/', data))
      fs.stat(fullpath, function (_, st) {
        if (st) return cb(null, {})
        mkdirp(path.join(fullpath, '..'), function (err) {
          if (err) return cb(err)
          plex.emit('fetch', data)
          pump(plex.createStream(data, {chunked: true}), fs.createWriteStream(fullpath), cb)
        })
      })
    }
  }

  function visit (have, filename, cb) {
    fs.stat(filename, function (err, st) {
      if (err) return cb(err)

      if (st.isDirectory()) {
        fs.readdir(filename, function (err, files) {
          if (err) return cb(err)
          loop()

          function loop (err) {
            if (!files.length || err) return cb(err)
            var next = path.join(filename, files.shift())
            visit(have, next, loop)
          }
        })
        return
      }

      have.write(filename.replace(NPM, '.'), cb)
    })
  }

  return plex
}
