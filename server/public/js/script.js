


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
			cat = document.getElementById('cat')
			position = {x:0,y:0,z:0};
		
		
		
		var init = function(){
			
			socket = io.connect('http://' + window.location.hostname + ':8080/acc');

			// socket connected
			socket.on('connect', function (data) {
								
				socket.on('touch', function (data) {

					cat.style.marginLeft = parseInt(data.x * 3) + 'px';
					cat.style.marginTop = parseInt(data.y * 2) + 'px';					
				});
				
				
				
				socket.on('move', function (data) {
					var transform = 'translate3d(' + (data.x * 10) + 'px, ' + (data.y * 10) + 'px, ' + (data.y * 10) + 'px)';
					cat.style.MozTransform = transform;
					cat.style.webkitTransform = transform;
				});
				
				
			 });
			
			document.addEventListener('touchmove', function(event) {
			    event.preventDefault();
			    var touch = event.touches[0];
			    socket.emit( 'remotelog', { x : touch.pageX, y : touch.pageY } );
			}, false);
			
			window.ondevicemotion = function(event) {
				socket.emit( 'movement', { 
					x : event.accelerationIncludingGravity.x,
					y : event.accelerationIncludingGravity.y,
					y : event.accelerationIncludingGravity.z
				} );
			}
			
			

		}
		
		return {
			init : init

		}
		
	})();
	
	
	global.catapp = Module;
})(this);



