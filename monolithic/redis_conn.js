const redis = require('redis').createClient();

redis.on('error', (err) => {
    console.log(`Redis Error : ${err}`);
});
exports.redis = redis;
