		<div id="footer" class="png_bg">
			<div class="container cf">
			
				<div class="three-col">
					<div class="three-col-1">
						<div class="left">
							<h4>Contact</h4>
							<p class="small">Scripture Forge<br />SIL International<br />Contact Line One<br />Address<br />City<br />Code<br />Phone Number</p>
						</div>
						<div class="left footer-nav">
							<h4>Navigate</h4>
							<p class="small">Home<br />Explore<br />Learn<br />Contribute<br />Discuss</p>
						</div>
					</div>
				</div>
				
				<div class="three-col">
					<div class="three-col-2">
						<h4>Credits</h4>
						<p class="small">Copyright 2012 Scripture Forge. An SIL International project. All rights reserved.</p>
						<p class="small">Use of this site is governed by our terms and conditions of use.</p>
					</div>
				</div>
				
				<div class="three-col">
					<img src="/images/PAYAP_logo.png" alt="PAYAP" width="170" height="50" class="right png_bg">
					<img src="/images/SIL_logo.png" alt="SIL" width="50" height="49" class="right png_bg" style="margin-right: 30px;">
				</div>
			
			</div>
		</div>
		
		<div id="footerBaseline">
			<div class="container">
				<div class="darkTextLogo png_bg"></div>
			</div>
		</div>
		
		<script src="/js/jquery-1.8.0.min.js"></script>
		<script src="/js/jquery-ui-1.8.23.custom.min.js"></script>
		<script src="/js/superfish/superfish.js"></script>
		<script src="/js/superfish/hoverIntent.js"></script>
		<script src="/js/slides.min.jquery.js"></script>
		<script>
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
					prependPagination: true
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
		<script src="/js/DD_belatedPNG.js"></script>
		<script>
			$(document).ready(function(){ 
				setTimeout(function(){ DD_belatedPNG.fix('.png_bg') }, 100);
			});
		</script>
		<![endif]-->
	</body>
</html>