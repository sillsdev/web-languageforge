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
			$this->load->view("projects/jamaican_psalms/templates/slideshow.html.php", $data);
			?>
			
			
			<div class="container">
				<div class="row">
					<div class="span12">
						<h2 class="lifted-text">Welcome to <span class="sf-jamaican-green">Jamiekan Psalms</span></h2>
						<p>Can you imagine hundreds of Jamaicans from all over the world (young and old, rich and poor), working together on the internet to translate the Bible into the language that connects with them best—Jamaican Creole?  That is exactly what we want to accomplish with this project!   From the comforts of wherever you have internet access, work together with the Bible Society of the West Indies in translating our favourite Psalms iina fi wi langwij!</p>
					</div>
				</div>
			</div>
		
		
			<?php
			
			$data['columns'] = array(
				array(
					"title" => "Latest News",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					),
				array(
					"title" => "How it Works",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					),
				array(
					"title" => "Get Started",
					"summary" => "Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue. Donec id elit non mi porta gravida at eget metus.",
					"target_url" => "#"
					)
			);
			$this->load->view("projects/jamaican_psalms/templates/3column.html.php", $data);
			?>
			
			
			
			<div class="sub-foot-detailing"></div>
			<div id="sub-foot">
				<div class="container">
					<div class="row">
						<div class="span3"><img src="/images/jamaican_psalms/sf-sub-footer-pic.png" alt="Girl Smiling" width="209" height="209" /></div>
						<div class="span9">
							<h3>The Impact of the Bible</h3>
							<p>Many Jamaicans have been touched by the Jamaican New Testament!  Take Israel, for example, a young British-Jamaican girl living in England. She talks to us regularly on our Facebook page.  She regularly reads for her family members from the Jamaican New Testament (JNT).  One day, she read to her grandmother from the JNT day.  Her grandmother then told her pastor about the JNT.  The pastor was curious, so Israel was asked to take her JNT to church and read from it during worship!  Israel messaged us after the service:</p>
							<p>“I've just got home from church. Believe me when I tell you that they LOVE the JNT! Thank you for my copy of the JNT in my own language. I've come to realise that when you listen to the Bible in your language, it is more meaningful to you.”</p>
							<p><a href="/create_account" class="arrowed">Get Involved Today</a></p>
						</div>
					</div>
				</div>
			</div>
			<div class="sub-foot-detailing"></div>