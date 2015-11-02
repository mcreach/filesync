'use strict';

var io = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var _ = require('lodash');

var logger = require('winston');
var config = require('./config')(logger);

app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

var server = app.listen(config.server.port, function() {
  logger.info('Server listening on %s', config.server.port);
});


var sio = io(server);

sio.set('authorization', function(handshakeData, accept) {
  // @todo use something else than a private `query`
  handshakeData.isAdmin = handshakeData._query.access_token === config.auth.token;
  accept(null, true);

});

function Viewers(sio) {
  var data = [];

  function notifyChanges() {
    sio.emit('viewers:updated', data);
  }

  return {
    add: function add(nickname) {
      data.push(nickname);
      notifyChanges();
    },
    remove: function remove(nickname) {
      var idx = data.indexOf(nickname);
      if (idx > -1) {
        data.splice(idx, 1);
      }
      notifyChanges();
      console.log('-->', data);
    }
  };
}

function Message(sio){
  var messages = [];
  function notifyChanges(){
    sio.emit('messages:updated', messages);
  }
  return {
    add: function add(msgObject){

        if((messages.length)&&(messages[messages.length-1].id==msgObject.id)){
        //  messages[messages.length-1].message += "\n" + msgObject.message;
        messages[messages.length-1].message.push(msgObject.message[0]);
        }else{
          messages.push(msgObject);
        }

      notifyChanges();
    }
  };
}


function Comment(sio){
  var comments = [];
  function notifyChanges(){
    sio.emit('comments:updated', comments);
  }
  return {
    add: function add(commentObject){
    comments.push(commentObject);
      notifyChanges();
    }
  };
}

var viewers = Viewers(sio);
var messages = Message(sio);
var comments = Comment(sio);


// @todo extract in its own
sio.on('connection', function(socket) {


  // console.log('nouvelle connexion', socket.id);
  socket.on('viewer:new', function(nickname) {
    socket.nickname = nickname;
    socket.userId = Math.random().toString(16).slice(2,14);
    viewers.add(nickname);
    console.log('new viewer with nickname %s', nickname, viewers);
  });

  socket.on('viewer:newColor', function(color){
    socket.userColor = color;
    console.log('new color has been set');
  })

  socket.on('comment:newComment', function(comment){
      console.log('server : new Comment');
      comment.nickname = sio.nickname;
      comment.date =Date.now();
    comments.add(comment);
  })

  socket.on('disconnect', function() {
    viewers.remove(socket.nickname);
    console.log('viewer disconnected %s\nremaining:', socket.nickname, viewers);
  });

  socket.on('newMessage',function(message){
    messages.add({id:socket.userId ,nickname:socket.nickname, message:[message], userColor:socket.userColor});
  })

  socket.on('file:changed', function() {
    if (!socket.conn.request.isAdmin) {
      // if the user is not admin
      // skip this
      return socket.emit('error:auth', 'Unauthorized :)');
    }

    // forward the event to everyone
    sio.emit.apply(sio, ['file:changed'].concat(_.toArray(arguments)));
  });

  socket.visibility = 'visible';

  socket.on('user-visibility:changed', function(state) {
    socket.visibility = state;
    sio.emit('users:visibility-states', getVisibilityCounts());
  });
});

function getVisibilityCounts() {
  return _.chain(sio.sockets.sockets).values().countBy('visibility').value();
}
