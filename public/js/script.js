




(function(global){
	var Module = (function(){
		
		var secret = 'sdsd',
			mapDiv = document.getElementById('map_canvas'),
			center = new google.maps.LatLng(51.5,-0.1),
			map,
			marker,
			line;
			

			
			
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
		}	
		
		function addMarkers()
		{
		    marker = new google.maps.Marker({
				position: center,
				map: map
		    });
		}
		
		function moveMarker()
		{
			var latLng = new google.maps.LatLng(51.5,-0.2);
			map.panTo( latLng );
			marker.setPosition(latLng);
			addNewPoint(latLng);

		}
		
		function addNewPoint(latLng) {
			var path = line.getPath();
			path.push(latLng);
		}
		

	
		// stuff to expose to global
		return {
			init : function()
			{
				createmap();
			},
			moveMarker : moveMarker
			
		}
		
		
	})();
	
	global.maps = Module;

	
})(this);

window.maps.init();