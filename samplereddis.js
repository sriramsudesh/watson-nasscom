/*

var redis = require("redis");

var myCache = new redis.createClient("redis://admin:NWAFWQLARTCIOGPT@bluemix-sandbox-dal-9-portal.1.dblayer.com:23093");
myCache.on('error', function (err) {
    console.log('error event - ' + myCache.host + ':' + myCache.port + ' - ' + err);
});



// ioredis supports all Redis commands:
redis.set('foo', 'bar');
redis.get('sudesh', function (err, result) {
	if(result === null) {
		redis.set('sudesh', 'icecream');
	}
  
});

redis.get('sudesh', function (err, result) {
	if(result === 'icecream') {
		console.log(result);
	}
  
});

*/

var redis = require("redis"),
    client = redis.createClient("redis://admin:NWAFWQLARTCIOGPT@bluemix-sandbox-dal-9-portal.1.dblayer.com:23093");
 
// if you'd like to select database 3, instead of 0 (default), call 
// client.select(3, function() { /* ... */ }); 
 
client.on("error", function (err) {
    console.log("Error " + err);
});
 
client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});
