var	speedFactor = 0.1,
	speedLayer = { 1 : 0.2, 2 : 0.5, 3 : 0.8, 4 : 5 };
	
function getSpeed( x, layer )
{
	return x * speedLayer[layer] * speedFactor * -1;
}	

jQuery(document).ready( function(){
	var para 		= document.getElementById('para'),
		$para 		= $(para),
		mousething	= document.getElementById('mousething'),
		$mousething = $(mousething),
		old_angle 	= 0;
	      

	
	// para.style.webkitTransition =  'all .2s ease-in-out';
	socket = io.connect('http://' + window.location.hostname + ':8080/paralax');
	
	// Touch Event
	document.addEventListener('touchmove', function(event) {
	    event.preventDefault();
	    var touch = event.touches[0];
		paralax(touch.pageX * 2);
		socket.emit('swipe', touch.pageX);
	}, false);
	
	// Mouse over event
	$mousething.mousemove( function(e){
		var x = (e.pageX  - this.offsetLeft );
		paralax(x);
	});
	
	// Remote Event
	socket.on('connect', function (data) {
		socket.on('swipe', function (data) {
			paralax(parseInt(data) * 2);
		});
	});
	
	// Animate the layers
	function paralax(x){
		$para.css("background-position", getSpeed( x, 3 ) + 'px 0' );

		$("#l1").css("left", getSpeed( x, 1 ) + "px");
		$("#l2").css("left", getSpeed( x, 2 ) + "px");
		$("#roof").css("left", getSpeed( x, 1 ) + "px");
		
		
		
		var per = parseInt( ( x / $(this).width() ) * 100 ),
			angle = parseInt( ( per -50 ) / 5 );

		if( old_angle != angle ){
			var transform = 'perspective(800px) rotateY(' + angle + 'deg)';
			para.style.webkitTransform =  transform;
			para.style.MozTransform3d =  transform;
			old_angle = angle;
		}
	}
	
	
	// Big Train
	window.setInterval(function(){
		$("#train").animate({ left: '-=2000' }, 1000, function(){
			$(this).css('left', '600px');
		});
	},10000);
	
	// Little Train
	window.setInterval(function(){
		$("#smalltrain").animate({ left: '1500' }, 800, function(){
			$(this).css('left', '-400px');
		});
	},11000);
});









