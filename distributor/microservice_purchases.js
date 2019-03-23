'use strict';

// 비즈니스 로직 파일 참조
const business = require('../monolithic/monolithic_purchases.js');
const cluster = require('cluster');

// Sever 클래스 참조
class purchases extends require('./server.js') {
    constructor() {
        // 부보 클래스 생성자 호출
        super('purchases'
            , process.argv[2] ? Number(process.argv[2]) : 9030
            , ['POST/purchases', 'GET/purchases']
        );

        // Distributor 접속
        this.connectToDistributor('127.0.0.1', 9000, (data) => {
            console.log('Distributor Notification', data);
        });
    }

    // CLient 요청 비즈니스 로직 호출
    onRead(socket, data) {
        console.log('onRead', socket.remoteAddress, socket.remotePort, data);
        business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
            socket.write(JSON.stringify(packet) + '¶');
        });
    }
}

// 인스턴스 생성
if (cluster.isMaster) {
    cluster.fork();

    // exit 이벤트 발생하면 새 자식 프로세스 실행
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    new purchases();
}
