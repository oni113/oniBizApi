const http = require('http');

var server = http.createServer((req, res) => {
    console.log('request on!!');
    res.end('hello world');
});

server.listen(8000, () => {
    console.log('server listen port 8000!');
});
