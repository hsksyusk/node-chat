// redis
var redis = require("redis"),
    client = redis.createClient();

function redisPushMessage(key, id, message){
  var reply = {
    id : id,
    message : message
  };
  client.rpush( key, JSON.stringify(reply), redis.print);
}

function redisGetMessages(key, currentMessageId, callback) {
  client.llen( key, function(err, len){
//    console.log("currentMessageId : " + currentMessageId);
//    console.log("redisGetMessages len : " + len);
    if ( currentMessageId < len ) {
//      console.log("lrange");
      client.lrange( key, currentMessageId, len - 1 , function(err, list){
        console.log("list : " + list);
//        console.log("err : " + err);
        callback(list);
      });
    } else {
      callback(null);
    }
  });
}

// Express
var express = require('express')
  , http = require('http')
  , app = express()
  ;

app.use(express.static(__dirname + '/public'));
var server = http.createServer(app).listen(3000);
console.log('server start:', 3000);

// Socket.IO
var io = require('socket.io')
  , io = io.listen(server, {'log level': 3})
  ;

io.sockets.on('connection', function(socket){
  var currentMessageId;
  var key = "message key";
  io.sockets.emit('login', socket.id);
  console.log(socket.id, 'a user connected');

  // regist post for redig
  socket.on('post', function(data){
    redisPushMessage( key ,socket.id, data);
  });
  
  setInterval(function() {
    // init currentMessageId
    if ( typeof currentMessageId === "undefined" ){
      currentMessageId = 0
    }

    redisGetMessages( key, currentMessageId, function(list){
//      console.log('get messages');
//      console.log("old currentMessageId : " + currentMessageId);
      if (list){
//        console.log(list);
        currentMessageId += list.length;
//        console.log("newer currentMessageId : " + currentMessageId);
	for (var i = 0; i < list.length; i++){
//          console.log(list[i]);
          console.log(JSON.parse(list[i]));
          socket.emit('post', JSON.parse(list[i]));
	}
      }
    });
  }, 100);
});


