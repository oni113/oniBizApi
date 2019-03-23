var net = require('net');

var options = {
    host : '127.0.0.1',
    port : 9000
};

var client = net.connect(options, () => {
    console.log('tcp connected!!');
});

client.on('data', (data) => {
    console.log(data.toString());
});

client.on('end', () => {
    console.log('tcp disconnected!!');
})
