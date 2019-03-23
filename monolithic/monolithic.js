const http = require('http');
const url = require('url');
const querystring = require('querystring');

const members = require('./monolithic_members.js');
const goods = require('./monolithic_goods.js');
const purcharses = require('./monolithic_purcharses.js');

var server = http.createServer((req, res) => {
    var method = req.method;
    var uri = url.parse(req.url, true);
    var pathname = uri.pathname;

    if (method === 'POST' || method === 'PUT') {
        var body = '';

        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            var params = '';
            var contentType = req.headers['content-type'];
            if (contentType == 'application/json') {
                params = JSON.parse(body);
            } else {
                params = querystring.parse(body);
            }

            onRequest(res, method, pathname, params);
        });
    } else {
        onRequest(res, method, pathname, uri.query);
    }
}).listen(8000);

function onRequest(res, method, pathname, params) {
    switch(pathname) {
        case '/members' :
            members.onRequest(res, method, pathname, params, response);
            break;
        case '/goods' :
            goods.onRequest(res, method, pathname, params, response);
            break;
        case '/purchares' :
            purchares.onRequest(res, method, pathname, params, response);
            break;
        default :
            console.log('send 404!');
            res.writeHead(404);
            return res.end();
    }
}

function response(res, packet) {
    res.writeHead(200, {'Content-Type' : 'application/json'});
    res.end(JSON.stringify(packet));
}
