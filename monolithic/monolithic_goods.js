const mysql = require('mysql');
const dbconn = require('./db').dbconn;
const redis = require('./redis_conn').redis;

exports.onRequest = (res, method, pathname, params, callback) => {
    console.log('onRequest params');
    console.dir(params);
    switch (method) {
        case 'GET' :
            console.log('상품 조회');
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(callback, res, response);
            });
        case 'POST' :
            console.log('상품 등록');
            return register(method, pathname, params, (response) => {
                process.nextTick(callback, res, response);
            });
        case 'DELETE' :
            console.log('상품 삭제');
            return unregister(method, pathname, params, (response) => {
                process.nextTick(callback, res, response);
            });
        default :
            return process.nextTick(cb, res, null);
    }
};

function inquiry(method, pathname, params, callback) {
    var response = {
        key : params.key,
        errorcode : 0,
        errormessage : 'success'
    };

    var connection = mysql.createConnection(dbconn);
    connection.connect();
    var sql = 'select id, name, category, price, description from  goods';
    connection.query(sql, (error, results, fields) => {
        if (error || results.length == 0) {
            response.errorcode = 1;
            response.errormessage = error ? error : 'no data';
        } else {
            response.results = results;
        }
        callback(response);
    });
    connection.end();
}

function register(method, pathname, params, callback) {
    console.log('3. api params');
    console.dir(params);
    var response = {
        key : params.key,
        errorcode : 0,
        errormessage : 'success'
    };

    if (params.name == null || params.category == null || params.price == null || params.description == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parametes';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'insert into goods(name, category, price, description) values (?, ?, ?, ?); select LAST_INSERT_ID() as id;';
        connection.query(sql, [params.name, params.category, params.price, params.description], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            } else {
                // Redis 에 상품 정보 저장
                const id = results[1][0].id;
                redis.set(id, JSON.stringify(params));
            }
            callback(response);
        });
        connection.end();
    }
}

function unregister(method, pathname, params, callback) {
    var response = {
        key : params.key,
        errorcode : 0,
        errormessage : 'success'
    };

    console.dir(params);

    if (params.id == null ) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parametes';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'delete from goods where id = ?';
        connection.query(sql, [params.id], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            } else {
                redis.del(params.id);
            }
            callback(response);
        });
        connection.end();
    }
}
