		<script src="/js/lib/jquery-1.8.0.min.js"></script>
		<script src="/js/lib/jquery-ui-1.8.23.custom.min.js"></script>
		<script src="/js/lib/superfish/superfish.js"></script>
		<script src="/js/lib/superfish/hoverIntent.js"></script>
		<script src="/js/lib/slides.min.jquery.js"></script>
		<script src="/js/lib/foundation/foundation.min.js"></script>
		<script>
			$(document).foundation();
			
			$(document).ready(function(){
				// Superfish menu delay
				$("ul.sf-menu").superfish({
					delay: 500
				});	
				
				// Slideshow				
				$('#slides').slides({
					preload: false,
					preloadImage: 'images/loading.gif',
					play: 5000,
					pause: 2500,
					hoverPause: true,
					prependPagination: true,
					paginationClass: 'slide_pagination'	
				});
				
				/* Workaround for IE image loading with black edges */
				if ($.browser.msie){
					if (parseInt($.browser.version, 10) != 6){
						setTimeout(function(){ $('.slides_container img').css('visibility','visible') }, 400);
					}
				} else {
					$('.slides_container img').css('visibility','visible');
				}
			
			});	
		</script>
		<!--[if IE 6]>
		<script src="/js/lib/DD_belatedPNG.js"></script>
		<script>
			$(document).ready(function(){ 
				setTimeout(function(){ DD_belatedPNG.fix('.png_bg') }, 100);
			});
		</script>
		<![endif]-->