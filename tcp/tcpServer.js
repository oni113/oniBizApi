var net = require('net');

var server = net.createServer((socket) => {
    console.log('tcp server request!!');
    socket.end('hello world');
});

server.on('error', (err) => {
    console.log(err);
});

server.listen(9000, () => {
    console.log('tcp server listen', server.address());
});
