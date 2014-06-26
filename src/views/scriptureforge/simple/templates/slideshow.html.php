		<div id="promotion" class="container">
			<div id="slides">
				<div id="promotion-ribbon"></div>
				<div id="promotionCutout"></div>
				<div class="slides_container">
				
					<?php foreach ($slides as $slide): ?>
					
					<div class="slides_content">
						<img src="<?php echo "/images/scriptureforge/simple/" . $slide['image_url'] ?>" alt="<?php $slide['image_url'] ?>" width="300" height="349" class="pull-left">
						<h3 class="pull-left" style="margin-top: 110px;"><?php echo $slide['title'] ?></h3>
						<p class="pull-left" style="margin-top: 10px;"><?php echo $slide['summary'] ?></p>
						<p class="pull-left"><input type="button" class="btn standard-btn standard-btn-big" value="Learn More" onclick="window.location='<?php echo $slide['target_url'] ?>';" /></p>
						<p class="pull-left" style="margin-top: 50px;"><?php echo $slide['social_media'] ?></p>
					</div>
					
					<?php endforeach ?>
					
				</div>
			</div>
		</div>