#!/usr/bin/env python

import flask
import requests


app = flask.Flask(__name__)
ROKU_IP = '192.168.42.69'
ROKU_URLBASE = 'http://%s:8060/' % (ROKU_IP,)


def make_response(req):
    res = flask.make_response(req.content, req.status_code)

    if 'content-type' in req.headers:
        res.headers['content-type'] = req.headers['content-type']
    if 'cache-control' in req.headers:
        res.headers['cache-control'] = req.headers['cache-control']

    return res


@app.route('/query/apps', methods=['GET'])
def apps():
    req = requests.get(ROKU_URLBASE + 'query/apps')
    return make_response(req)


@app.route('/query/icon/<int:channel>', methods=['GET'])
def icon(channel):
    req = requests.get(ROKU_URLBASE + 'query/icon/%d' % (channel,))
    return make_response(req)


@app.route('/launch/<int:channel>', methods=['GET'])
def launch(channel):
    req = requests.post(ROKU_URLBASE + 'launch/%d' % (channel,))
    return make_response(req)


@app.route('/keydown/<key>', methods=['POST'])
def keydown(key):
    req = requests.post(ROKU_URLBASE + 'keydown/%s' % (key,))
    return make_response(req)


@app.route('/keyup/<key>', methods=['POST'])
def keyup(key):
    req = requests.post(ROKU_URLBASE + 'keyup/%s' % (key,))
    return make_response(req)


content_types = {
    'firoku-128.png': 'image/png',
    'firoku.appcache': 'text/cache-manifest',
    'firoku.css': 'text/css',
    'firoku.js': 'application/x-javascript',
    'index.html': 'text/html',
    'jquery-1.8.3.js': 'application/x-javascript',
    'jquery.noty.center.js': 'application/x-javascript',
    'jquery.noty.js': 'application/x-javascript',
    'jquery.noty.theme.default.js': 'application/x-javascript',
    'manifest.webapp': 'application/x-web-app-manifest+json'
}


@app.route('/firoku-128.png')
@app.route('/firoku.appcache')
@app.route('/firoku.css')
@app.route('/firoku.js')
@app.route('/index.html')
@app.route('/jquery-1.8.3.js')
@app.route('/jquery.noty.center.js')
@app.route('/jquery.noty.js')
@app.route('/jquery.noty.theme.default.js')
@app.route('/manifest.webapp')
@app.route('/')
def staticfile():
    filename = flask.request.path[1:]
    if not filename:
        # Handle '/' path appropriately
        filename = 'index.html'
    with file(filename) as f:
        content = f.read()
    res = flask.make_response(content, 200)
    res.headers['content-type'] = content_types[filename]
    return res

test_body = '''<!DOCTYPE html>
<html>
 <head>
  <title>Test</title>
  <script type="text/javascript" src="jquery-1.8.3.js"></script>
  <meta charset="utf-8">
 </head>
 <body>
  Test
 </body>
</html>
'''


@app.route('/test.html')
def test():
    return test_body

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8060, debug=True)
