		<script src="/js/lib/jquery-ui-1.10.3.custom.min.js"></script>
		<script src="/js/lib/superfish/superfish.js"></script>
		<script src="/js/lib/superfish/hoverIntent.js"></script>
		<script src="/js/lib/slides.min.jquery.js"></script>
		<script src="/js/lib/jquery.iframe-transport.js"></script>
		<script src="/js/lib/jquery.fileupload.js"></script>
		<script src="/js/lib/jquery.fileupload-process.js"></script>
		<script src="/js/lib/jquery.fileupload-validate.js"></script>
		<script src="/js/lib/jquery.jsonrpc.js"></script>
		<!--
			<script type="text/javascript"
		src="//www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>
		<script src="/js/lib/angular-recaptcha.min.js"></script>  -->
		<script>
			
			$(document).ready(function(){
				// Superfish menu delay
				$("ul.sf-menu").superfish({
					delay: 500
				});	
				
				// Slideshow				
				$('#slides').slides({
					preload: false,
					preloadImage: 'images/shared/loading.gif',
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
