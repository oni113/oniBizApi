const mysql = require('mysql');
const dbconn = require('./db').dbconn;

exports.onRequest = (res, method, pathname, params, cb) => {
    switch (method) {
        case 'GET' :
            console.log('회원 조회');
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(cb, res, response);
            });
        case 'POST' :
            console.log('회원 등록');
            return register(method, pathname, params, (response) => {
                process.nextTick(cb, res, response);
            });
        case 'DELETE' :
            console.log('회원 삭제');
            return unregister(method, pathname, params, (response) => {
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

    if (params.username == null || params.password == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parameters';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'select id from members where username = ? and password = ?';
        connection.query(sql, [params.username, params.password], (error, results, fields) => {
            if (error || results.length == 0) {
                response.errorcode = 1;
                response.errormessage = error ? error : 'no Username or Invalid Password';
            } else {
                response.userid = results[0].id;
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

    if (params.username == null || params.password == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parameters';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'insert into members(username, password) values(?, ?)';
        connection.query(sql, [params.username, params.password], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
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

    if (params.username == null) {
        response.errorcode = 1;
        response.errormessage = 'Invalid Parameters';
        callback(response);
    } else {
        var connection = mysql.createConnection(dbconn);
        connection.connect();
        var sql = 'delete from members where username = ?';
        connection.query(sql, [params.username], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            }
            callback(response);
        });
        connection.end();
    }
}
