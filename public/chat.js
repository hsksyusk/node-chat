$(function(){
  var socket = io.connect();
  console.log("connected",socket);

  var $posts = $('ul#posts');

  socket.on('login', function(data){
    console.log('data : ' + data);
    $posts.prepend(
      '<li>' + data + ' joined. </li>'
    );
  });

  socket.on('post', function(data){
    $posts.prepend(
      //'<li>' + data + '</li>'
      '<li>' + data.id + ' : ' + data.message + '</li>'
    );
  });

  var $message = $('input#message');
  $('input#update').on('click', function(e){
    if($message.val().length === 0) return;
    socket.emit('post', $message.val());
    $message.val('');
  });
});

