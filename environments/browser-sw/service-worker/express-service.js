var url = require('url');

// auxiliary functions
var previewRegExp = new RegExp(location.protocol + '//' + location.host + '/preview/(.*)');
function matchCanvasURL(url) {
  if (!url) { return false; }

  var match = url.match(previewRegExp);

  if (match) {
    return match[1];
  } else {
    return false;
  }
}


// server - Express application, as in
// var express = require('express')
// var app = express()
// think of this as equivalent to http.createServer(app)
function expressService (app) {

  function isJsRequest (path) {
    return /\.js$/.test(path)
  }

  function isCssRequest (path) {
    return /\.css$/.test(path)
  }

  function isFormPost (req) {
    return req.headers.get('content-type') === 'application/x-www-form-urlencoded'
  }

  function formToObject (text) {
    var obj = {}
    text.split('&').forEach(function (line) {
      var parts = line.split('=')
      if (parts.length === 2) {
        obj[parts[0]] = decodeURIComponent(parts[1].replace(/\+/g, ' '))
      }
    })
    return obj
  }

  self.addEventListener('fetch', function (event) {
    var parsedUrl = url.parse(event.request.url);
    
    console.log('FETCH');

    if (!matchCanvasURL(event.request.url)) {
      console.log('FETCH NOT MATCHED');

      return;
    }

    event.respondWith(new Promise(function (resolve) {
      // let Express handle the request, but get the result
      console.log('express-service', 'handle request', JSON.stringify(parsedUrl, null, 2))

      event.request.clone().text().then(function (text) {
        var body = text
        if (isFormPost(event.request)) {
          body = formToObject(text)
        }

        var req = {
          url: parsedUrl.href,
          method: event.request.method,
          body: body,
          headers: {
            'content-type': event.request.headers.get('content-type')
          },
          unpipe: function () {},
          connection: {
            remoteAddress: '::1'
          },
          resume: function () {
            
          }
        }
        // console.log(req)
        var res = {
          _headers: {},
          setHeader: function setHeader (name, value) {
            // console.log('set header %s to %s', name, value)
            this._headers[name] = value
          },
          getHeader: function getHeader (name) {
            return this._headers[name]
          },
          get: function get (name) {
            return this._headers[name]
          },
          resume: function () {
            
          }
        }


        function endWithFinish (chunk, encoding) {
          // console.log('ending response for request', req.url)
          // console.log('output "%s ..."', chunk.toString().substr(0, 10))
          // console.log('%d %s %d', res.statusCode || 200,
          //   res.get('Content-Type'),
          //   res.get('Content-Length'))
          // end.apply(res, arguments)
          var responseOptions = {
            status: res.statusCode || 200,
            headers: {
              'Content-Length': res.get('Content-Length'),
              'Content-Type': res.get('Content-Type')
            }
          }
          if (res.get('Location')) {
            responseOptions.headers.Location = res.get('Location')
          }
          if (res.get('X-Powered-By')) {
            responseOptions.headers['X-Powered-By'] = res.get('X-Powered-By')
          }
          resolve(new Response(chunk, responseOptions))
        }

        res.end = endWithFinish
        app(req, res)
      })
    }))
  })
}

module.exports = expressService;
