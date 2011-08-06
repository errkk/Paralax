
var socket = io.connect('http://localhost:8080');





(function(global){
	var Module = (function(){
		
		var secret = 'sdsd',
			center,
			position = getPosition(function(coords){
				center = new google.maps.LatLng(coords.lat,coords.lng);
				createmap();
			}),
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
		
			// google.maps.event.addListener(marker, 'dragend', function() {
			//     var center = marker.getPosition();
			//     socket.emit('newlocation', { latLng: center });
			// });
			
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
			// var latLng = new google.maps.LatLng(51.5,-0.2);
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
			
			},
			moveMarker : moveMarker
			
		}
		
		
	})();
	
	global.maps = Module;

	
})(this);


window.maps.init();