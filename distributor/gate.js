const http = require('http');
const url = require('url');
const querystring = require('querystring');
const tcpClient = require('./client.js');

var mapClients = {};
var mapUrls = {};
var mapResponse = {};
var mapRR = {};
var index = 0;

// HTTP 서버 생성
var server  = http.createServer((req, res) => {
    var method = req.method;
    var uri = url.parse(req.url, true);
    var pathname = uri.pathname;

    // method 처리
    if ('POST' == method || 'PUT' == method) {
        var body = '';

        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            var params;

            // 헤더에 따라 파라미터 파싱
            if (req.headers['content-type'] == 'application/json') {
                params = JSON.parse(body);
            } else {
                params = querystring.parse(body);
            }

            onRequest(res, method, pathname, params);
        });
    } else {
        // GET or DELETE
        onRequest(res, method, pathname, uri.query);
    }
}).listen(8000, () => {
    console.log('listen', server.address());

    //Distribuor 전달 패킷
    var packet = {
        uri : '/distributes',
        method : 'POST',
        key : 0,
        params : {
            port : 8000,
            name : 'gate',
            urls : []
        }
    };

    var isConnectedDistributor = false;

    // Distributor 접속
    this.clientDistributor = new tcpClient(
        '127.0.0.1',
        9000,
        (options) => {  // Distributor 접속 완료 이벤트
            isConnectedDistributor = true;
            this.clientDistributor.write(packet);
        },
        (options, data) => {    // Distributor 데이터 수신 이벤트
            onDistribute(data);
        },
        (options) => {  // Distributor 접속 종료 이벤트
            isConnectedDistributor = false;
        },
        (options) => {  // Distributor 에러 이벤트
            isConnectedDistributor = false;
        }
    );

    // 주기적인 Distributor 접속 상태 확인
    setInterval(() => {
        if (!isConnectedDistributor) {
            this.clientDistributor.connect();
        }
    }, 3000);
});

// 요청 정보 처리 (API 호출 처리)
function onRequest(res, method, pathname, params) {
    var key = method + pathname;
    var client = mapUrls[key];
    if (client == null) {
        res.writeHead(404);
        res.end();
        return;
    } else {
        params.key = index;
        var packet = {
            uri : pathname,
            method : method,
            params : params
        };

        mapResponse[index] = res;
        index++;

        if (mapRR[key] == null) {
            mapRR[key] = 0;
        }
        mapRR[key]++;
        client[mapRR[key] % client.length].write(packet);
    }
}

// Distributor 데이터 수신 처리
function onDistribute(data) {
    for (var n in data.params) {
        var node = data.params[n];
        var key = node.host + ':' + node.port;
        if (mapClients[key] == null && node.name != 'gate') {
            var client = new tcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClient);
            mapClients[key] = {
                client : client,
                info : node
            };
            for (var m in node.urls) {
                var key = node.urls[m];
                if (mapUrls[key] == null) {
                    mapUrls[key] = [];
                }
                mapUrls[key].push(client);
            }
            client.connect();
        }
    }
}

// 마이크로 서비스 접속 이벤트 처리
function onCreateClient(options) {
    console.log('onCreateClient');
}

// 마이크로 서비스 응답 처리
function onReadClient(options, packet) {
    console.log('onReadClient', packet);
    mapResponse[packet.key].writeHead(200, {'Content-Type' : 'application/json'});
    mapResponse[packet.key].end(JSON.stringify(packet));
    delete mapResponse[packet.key];
}

// 마이크로 서비스 접속 종료 처리
function onEndClient(options) {
    var key = options.host + ':' + options.port;
    console.log('onEndClient', mapClients[key]);
    for (var n in mapClients[key].info.urls) {
        var node = mapClients[key].info.urls[n];
        delete mapUrls[node];
    }
    delete mapClients[key];
}

// 마이크로 서비스 접속 에러 처리
function onErrorClient(options) {
    console.log('onErrorClient');
}
