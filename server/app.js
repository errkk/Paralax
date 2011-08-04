var io = require('socket.io').listen(8080);

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
		io.sockets.emit('move', { Na : data.latLng.Na, Oa : data.latLng.Oa });
		locations.push(data);
	});
	
	// When an FE marker is moved
	socket.on('newcentre', function (data) {
		io.sockets.emit('movecentre', { Na : data.latLng.Na, Oa : data.latLng.Oa });

	});
});

// latLng: { Na: 51.48802991581375, Oa: -0.171754455566429 }