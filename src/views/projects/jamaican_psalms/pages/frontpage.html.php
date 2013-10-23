			<?php 
			// perhaps this data array should be put into the controller?
			
			$data['slides'] = array(
				array(
					"title" => "Scripture Forge Community Checking",
					"summary" => "Scripture Forge enables communities to participate in the Scripture checking process like never before."
					),
				array(
					"title" => "Scripture Forge Community Checking 2",
					"summary" => "Scripture Forge enables communities to participate in the Scripture checking process like never before."
					),
				array(
					"title" => "Scripture Forge Community Checking 3",
					"summary" => "Scripture Forge enables communities to participate in the Scripture checking process like never before."
					)
			);
			$this->load->view("templates/slideshow.html.php", $data);
			?>
			
			
			<div class="container">
				<div class="row">
					<div class="span12">
						<h2 class="lifted-text">Welcome to <span class="sf-jamaican-green">Scripture Forge Jamaica</span></h2>
						<p>Take your scripture-checking project to the next level by involving tens or hundreds more in the scripture review process. Engage your language&rsquo;s diaspora speakers on the web or their phone, wherever they are. Bring new insights into the checking process by engaging remote participants. While your translation team continues to work in ParaTExt, Scripture Forge provides a community feedback mechanism to help your team test their scripture drafts for comprehension and readability. </p>
					</div>
				</div>
			</div>
		
		
			<?php
			
			$data['columns'] = array(
				array(
					"title" => "Scripture Forge",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					),
				array(
					"title" => "Scripture Forge",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					),
				array(
					"title" => "Scripture Forge",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					)
			);
			$this->load->view("templates/3column.html.php", $data);
			?>
			
			
			
			<div class="sub-foot-detailing"></div>
			<div id="sub-foot">
				<div class="container">
					<div class="row">
						<div class="span3"><img src="/images/jamaican_psalms/sf-sub-footer-pic.png" alt="Girl Smiling" width="209" height="209" /></div>
						<div class="span9">
							<h3>The Power of Collaboration</h3>
							<p>When everyone plays their part in getting Scripture translated and into the right hands, everyone benefits. It&rsquo;s the power of collaboration that gets Scripture checking done faster and better. Our technology brings Scripture checking to the masses, in a positive environment that focuses participants on the task and works wherever they are. On the tablet, phone or web, Scripture Forge is there.</p>
							<p><a href="/create_account" class="arrowed">Get Involved Today</a></p>
						</div>
					</div>
				</div>
			</div>
			<div class="sub-foot-detailing"></div>