const RedisUtil = function () { }

const redis = require("redis");
const client = redis.createClient(sails.config.redis.redis_port, sails.config.redis.redis_url);
RedisUtil.hset = function (hashkey, field, value) {
	return new Promise((resolve, reject) => {
		client.hset(hashkey, field, value, function (err, response) {
			if (err) {
				reject(err);
			} else {
				resolve(response);
			}
		});
	});
}

RedisUtil.hget = function (hashkey, field) {
	return new Promise((resolve, reject) => {
		client.hget(hashkey, field, function (err, response) {
			if (err) {
				reject(err);
			} else {
				resolve(response);
			}

		});
	});
}

RedisUtil.hvals = function (hashkey) {
	return new Promise((resolve, reject) => {
		client.hvals(hashkey, function (err, replies) {
			if (err) {
				reject(err);
			} else {
				resolve(replies);
			}
		});
	});
}

RedisUtil.hgetall = function (hashkey) {
	return new Promise((resolve, reject) => {
		client.hgetall(hashkey, function (err, replies) {
			if (err) {
				reject(err);
			} else {
				resolve(replies);
			}
		});
	});
}

RedisUtil.hkeys = function (hashkey) {
	return new Promise((resolve, reject) => {
		client.hkeys(hashkey, function (err, replies) {
			if (err) {
				reject(err);
			} else {
				resolve(replies);
			}
		});
	});
}
module.exports = RedisUtil