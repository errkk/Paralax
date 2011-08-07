var io = require('socket.io').listen(8080),
	express = require("express"),
	app = express.createServer();

var locations =[];

io.sockets.on('connection', function (socket) {

	// Check that the FE is ready and markers are added before telling them to move
	socket.on('ready', function (data) {
		// socket.emit('move', { Na: 51.495190968915516, Oa: -0.1424003601074446 });

 	});
  
	socket.on('motion', function (data) {
		console.log(data);	
	});

	// When an FE marker is moved
	socket.on('newlocation', function (data) {
		// send to everyone so the marker is moved
		io.sockets.emit('move', { Na : data.latLng.Na, Oa : data.latLng.Oa });
		locations.push(data);
	});
	
	// When its dragged
	socket.on('newcentre', function (data) {
		socket.broadcast.emit('movecentre', { Na : data.latLng.Na, Oa : data.latLng.Oa });

	});
});

// Serve Static Files with express
app.use(express.static(__dirname + '/public'));
app.listen(80);



var acc = io.of('/acc');

var state = 1;

acc.on('connection', function (socket) {

	socket.emit('connect', { message : 'hello' } );


	// screen touched
	socket.on('touchmove',function(data){	
		socket.broadcast.emit('touch', data );
	});
	
	socket.on('remotelog',function(data){	
		console.log(data);
	});
	
	socket.on('statechange',function(data){	
		if( data !== state ){
			socket.broadcast.emit('statechanged', data );
			state = data;
			
			socket.broadcast.emit('notification', 'State Changed' );
		}
	});
});


var acc = io.of('/paralax');

acc.on('connection', function (socket) {

	socket.emit('connect', { message : 'hello' } );
	
	// screen touched
	socket.on('swipe',function(data){	
		socket.broadcast.emit('swipe', data );
	});

});


