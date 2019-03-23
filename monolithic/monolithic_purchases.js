const mysql = require('mysql');
const dbconn = require('./db').dbconn;
const redis = require('./redis_conn').redis;

exports.onRequest = (res, method, pathname, params, cb) => {
    switch (method) {
        case 'GET' :
            console.log('구매 조회');
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(cb, res, response);
            });
        case 'POST' :
            console.log('구매 등록');
            return register(method, pathname, params, (response) => {
                process.nextTick(cb, res, response);
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

    if (params.userid == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parameters';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'select id, goodsid, date from purchases where id = ?';
        connection.query(sql, [params.userid], (error, results, fields) => {
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
}

function register(method, pathname, params, callback) {
    var response = {
        key : params.key,
        errorcode : 0,
        errormessage : 'success'
    };

    console.log('param userid : ' + params.userid);
    console.log('param goodsid : ' + params.goodsid);

    if (params.userid == null || params.goodsid == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parameters';
        callback(response);
    } else {
        redis.get(params.goodsid, (err, result) => {
            if (err || result == null) {
                response.errorcode = 1;
                response.errormessage = 'Redis failure';
                callback(response);
                return;
            }
            var connection = mysql.createConnection(dbconn);
            connection.connect();
            var sql = 'insert into purchases(userid, goodsid) values(?, ?)';
            connection.query(sql, [params.userid, params.goodsid], (error, results, fields) => {
                if (error) {
                    response.errorcode = 1;
                    response.errormessage = error;
                }
                callback(response);
            });
            connection.end();
        });
    }
}
