		<div id="sf-promotion-outer-wrap">
			<div id="sf-promotion-inner-wrap">
				<div class="promotionWing promotionWingLeft pull-left"></div>
				<div class="promotionWing promotionWingRight pull-right"></div>
				<div id="sf-promotion">
					<div id="slides">

						<div class="slides_container">

							<?php foreach ($slides as $slide): ?>

							<div class="slides_content">
								<h2 class="pull-left"><?php echo $slide['title'] ?></h2>
								<h3 class="pull-left"><?php echo $slide['summary'] ?></h3>
							</div>

							<?php endforeach; ?>

						</div>

					</div>
				</div>
			</div>
		</div>

		<div class="container">
			<div id="sf-promotion-wrap-shadow"></div>
		</div>
