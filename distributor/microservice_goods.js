'use strict';

// 비즈니스 로직 파일 참조
const business = require('../monolithic/monolithic_goods.js');
const cluster = require('cluster');

// Sever 클래스 참조
class goods extends require('./server.js') {
    constructor() {
        // 부보 클래스 생성자 호출
        super('goods'
            , process.argv[2] ? Number(process.argv[2]) : 9010
            , ['POST/goods', 'GET/goods', 'DELETE/goods']
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
    console.log(`master goods process ${process.pid} is running`);

    // exit 이벤트 발생하면 새 자식 프로세스 실행
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    new goods();
    console.log(`goods process ${process.pid} is running`);
}
