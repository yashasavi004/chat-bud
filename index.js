var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:3000');
});

var onlineUser = [];
var onlineUserName = [];

io.on('connection', function(socket){
	
	console.log('a user connected');
	socket.on('userData',function(name) {
		onlineUser.push({socketObj : socket, username : name, id : socket.id});
		onlineUserName.push({username : name});
		console.log(onlineUser.length);
		io.emit('onlineUser',onlineUserName);
	});
	
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});
	
	socket.on('private', function(chatObj) {
		var chateeInd = findWithAttr(onlineUser, 'username', chatObj.toName);
		if(chateeInd != -1) {
			onlineUser[chateeInd].socketObj.emit('chat message', { msg : chatObj.msg, fromName : chatObj.fromName, toName : chatObj.toName, msgStatus: 'unread' });
		}
		
	});
	
	socket.on('typing in emit',function(names) {
		var ind = findWithAttr(onlineUser, 'username', names.toName)
		if( ind != -1) {
			onlineUser[ind].socketObj.emit('onTyping',names.fromName);
		}
	});
	
	socket.on('typing out emit',function(names) {
		var ind = findWithAttr(onlineUser, 'username', names.toName)
		if( ind != -1) {
			onlineUser[ind].socketObj.emit('offTyping',names.fromName);
		}
	});
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
		var ind = findWithAttr(onlineUser, 'id', socket.id);
		if( ind != -1)
		{
			var deletename = onlineUser[ind].username;
			onlineUser.splice(ind,1);
			onlineUserName.splice(findWithAttr(onlineUserName,'username',deletename),1);
		}
		console.log(onlineUser.length);
		io.emit('onlineUser',onlineUserName);
		
  });
  
  
});

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}


