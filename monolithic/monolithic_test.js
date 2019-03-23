const http = require('http');

var options = {
    host : '127.0.0.1',
    port: 8000,
    headers : {
        'Content-Type' : 'application/json'
    }
};

function request(callback, params) {
    var req = http.request(options, (res) => {
        var data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(options, data);
            callback();
        });
    });

    if (params) {
        req.write(JSON.stringify(params));
    }

    req.end();
}

function goodsTest(callback) {
    goods_delete(() => {
        goods_post(() => {
            goods_get(callback);
        });
    });

    function goods_post(cb) {
        options.method = 'POST';
        options.path = '/goods';
        request(cb, {
            name : 'test Goods',
            category : 'tests',
            price : 1000,
            description : 'test'
        });
    }

    function goods_get(cb) {
        options.method = 'GET';
        options.path = '/goods';
        request(cb);
    }

    function goods_delete(cb) {
        options.method = 'DELETE';
        options.path = '/goods?id=1';
        request(cb);
    }
}

function membersTest(callback) {
    members_delete(() => {
        members_post(() => {
            members_get(callback);
        });
    });
}

function members_post(cb) {
    options.method = 'POST';
    options.path = '/members';
    request(cb, {
        username : 'test_account',
        password : '1234',
        passwordConfirm : '1234'
    });
}

function members_get(cb) {
    options.method = 'GET';
    options.path = '/members?username=test_accout&password=1234';
    request(cb);
}

function members_delete(cb) {
    options.mehtod = 'DELETE';
    options.path = '/members?username=test_account';
    request(cb);
}

function purchasesTest(callback) {
    purchases_post(() => {
        purchases_get(callback);
    });
}

function purchases_post(cb) {
    options.method = 'POST';
    options.path = '/purchases';
    request(cb, {
        userid : 1,
        goodsid : 1
    });
}

function purchases_get(cb) {
    options.method = 'GET';
    options.path = '/purchases?userid=1';
    request(cb);
}

console.log('=============================== members test =========================');
membersTest(() => {
    console.log('=============================== goods test =========================');
    goodsTest(() => {
        console.log('=============================== purchases test =========================');
        purchasesTest(() => {
            console.log('done');
        });
    });
});
