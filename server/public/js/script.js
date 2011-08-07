





(function(global){
	var Module = (function(){
		var socket,
			center,
			position,
			mapDiv = document.getElementById('map_canvas'),
			map,
			marker,
			line,
			dragging = false;
			
		
			
			
		function createmap()
		{
			map = new google.maps.Map(mapDiv, {
				center : center,
				zoom : 13,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			
			google.maps.event.addListenerOnce(map, 'tilesloaded', addMarkers);	
			
			line = new google.maps.Polyline({
			    strokeColor: '#ff0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 2
			  });

		  	line.setMap(map);
		
			var path = line.getPath();
			path.push(center);
			
			google.maps.event.addListener(map, 'drag', function(event){
				
				socket.emit('newcentre', { latLng: map.getCenter() });	
			});
			
			
			google.maps.event.addListener(map, 'dragend', function(event){
				dragging = false;
			});	
			
			google.maps.event.addListener(map, 'dragstart', function(event){
				dragging = true;
			});
			
		}	
		
		function addMarkers()
		{
		    marker = new google.maps.Marker({
				position: center,
				map: map,
				draggable : true
		    });
			
			google.maps.event.addListener(map, 'click', function(event){
			    var center = event.latLng;
			    socket.emit('newlocation', { latLng: center });			
			});
			
			socket.emit('ready',{});
			
			// Move event sent form server
			socket.on('move', function (data) {

				var latLng = new google.maps.LatLng(data.Na,data.Oa);
			
				moveMarker(latLng);

			});
			socket.on('movecentre', function (data) {

				var latLng = new google.maps.LatLng(data.Na,data.Oa);
			
				// check if its dragging
				if ( !dragging ){
					map.setCenter(latLng);
				}

			});
			
		}
		
		function moveMarker(latLng)
		{
			map.panTo( latLng );
			marker.setPosition(latLng);
			addNewPoint(latLng);			
		}
		
		function addNewPoint(latLng) {
			var path = line.getPath();
			path.push(latLng);
		}
		
		function getPosition(callback)
		{
			navigator.geolocation.getCurrentPosition( 
				function (position) { 
					var coords = {lat:position.coords.latitude,lng:position.coords.longitude};
					callback(coords); 
				}, 
				function (error)
				{
					switch(error.code) 
					{
						case error.TIMEOUT:
							alert ('Timeout');
							break;
						case error.POSITION_UNAVAILABLE:
							alert ('Position unavailable');
							break;
						case error.PERMISSION_DENIED:
							alert ('Permission denied');
							break;
						case error.UNKNOWN_ERROR:
							alert ('Unknown error');
							break;
					}

			});
		}
			
		
		

	
		// stuff to expose to global
		return {
			init : function()
			{

				socket = io.connect('http://' + window.location.hostname + ':8080');
				position = getPosition(function(coords){
					center = new google.maps.LatLng(coords.lat,coords.lng);
					createmap();
				})
			}
		}
		
	})();
	
	global.maps = Module;
	
})(this);



(function(global){
	var Module = (function(){
		var socket = false,
			cat = document.getElementById('cat'),
			infop = document.getElementById('info'),
			mainwindow = document.getElementById('main'),
			position = {x:0,y:0,z:0},
			state = 1;
		
		
		
		var init = function(){
			
			document.getElementById('request_permission').addEventListener('click', function() {
			  window.webkitNotifications.requestPermission();
			}, false);
			
			socket = io.connect('http://' + window.location.hostname + ':8080/acc');

			// socket connected
			socket.on('connect', function (data) {
				
				socket.on('notification', function(data){
					if( window.webkitNotifications.checkPermission() == 0 ){
						window.webkitNotifications.createNotification('', 'Connected', data.message).show();			
					}else{
						alert(data.message);
					}	
				});
				
				socket.on('touch', function (data) {

					cat.style.marginLeft = parseInt(data.x * 3) + 'px';
					cat.style.marginTop = parseInt(data.y * 2) + 'px';					
				});
				
				
				
				socket.on('move3d', function (data) {
					var transform = 'translate3d(' + (data.x * 10) + 'px, ' + (data.y * 10) + 'px, ' + (data.y * 10) + 'px)';
					cat.style.MozTransform = transform;
					cat.style.webkitTransform = transform;
				});
				
				socket.on('statechanged', function (data) {
					if( data == 0 ){
						mainwindow.style.backgroundColor = '#000';
					}else{
						mainwindow.style.backgroundColor = '#fff';
					}
				});
				
				
			 });
			

			
			
			document.addEventListener('touchmove', function(event) {
			    event.preventDefault();
			    var touch = event.touches[0];
			    socket.emit( 'touchmove', { x : touch.pageX, y : touch.pageY } );
			}, false);
			
			// check if the phone is upside down
			var offness = 0, onness = 0;
			window.ondevicemotion = function(event) {
				if( event.accelerationIncludingGravity.z > 8 && state === 1 ){
					offness ++;
					
				}else if( event.accelerationIncludingGravity.z < 8 && state === 0 ){
					onness ++;
				}
				
				if( offness > 20 ){
					state = 0;
					offness = 0;
					socket.emit('statechange', state );

				}else if( onness > 20 ){
					state = 1;			
					onness = 0;			
					socket.emit('statechange', state );							
				}
				
				infop.innerHTML = 'on: ' + onness + ', off: ' + offness;
				
			}
			
			
		}
		
		return {
			init : init

		}
		
	})();
	
	
	global.catapp = Module;
})(this);



