			<?php 
			// perhaps this data array should be put into the controller?
			
			$data['slides'] = array(
				array(
					"title" => "Community Checking",
					"summary" => "Scripture Forge enables communities to participate in the Scripture checking process like never before",
					"social_media" => "{Social Media}",
					"image_url" => "community.jpg",
					"target_url" => "/learn_scripture_forge"
					),
				array(
					"title" => "Your Team, Expanded",
					"summary" => "Improve your scripture checking project by adding more native speakers to your workflow",
					"social_media" => "{Social Media}",
					"image_url" => "team.jpg",
					"target_url" => "/learn_expand_your_team"
					),
				array(
					"title" => "Make a Difference Today",
					"summary" => "Speak a minority language?  See if your language has a scripture checking project in progress today",
					"social_media" => "{Social Media}",
					"image_url" => "contribute.jpg",
					"target_url" => "/learn_contribute"
					)
			);
			$this->load->view("templates/slideshow.html.php", $data);
			
			$data['columns'] = array(
				array(
					"title" => "Scripture Forge",
					"summary" => "Take your scripture-checking project to the next level by involving tens or hundreds more in the scripture review process.  Engage your language's diaspora speakers on the web or their phone, wherever they are.",
					"target_url" => "/learn_scripture_forge"
					),
				array(
					"title" => "Expand Your Team",
					"summary" => "Give your Scripture project a boost during the checking phase.  Sign-up is easy and free.  As the project manager, you can control who joins your \"extended team\" of scripture checkers.",
					"target_url" => "/learn_expand_your_team"
					),
				array(
					"title" => "Contribute",
					"summary" => "Your ability to think and speak in your mother tongue is a powerful gift.  You could make an eternal difference by bringing God's Word into your own language through participating as a Scripture reviewer.  You can comment on text, answer questions, and follow up on other comments.  What are you waiting for?  Sign up today!",
					"target_url" => "/learn_contribute"
					)
			);
			$this->load->view("templates/3column.html.php", $data);
			?>
			
		<div class="sub-promotion sfcontainer cf">
			<img src="/images/girlsmiling.jpg" alt="girl smiling" width="299" height="182" class="left">
			<h2>The Power of Collaboration</h2>
			<p>When everyone plays their part in getting Scripture translated and into the right hands, everyone benefits.  It's the power of collaboration that gets Scripture checking done faster and better.  Our technology brings Scripture checking to the masses, in a positive environment that focuses participants on the task and works wherever they are.  On the tablet, phone or web, Scripture Forge is there.</p>
			<p><a href="/create_account" class="arrowed">Get Involved Today</a></p>
		</div>
		
		<!--
		<div class="sfcontainer cf">
			<h2>Latest News</h2>
			
			<div class="three-col">
				<div class="three-col-1">
					<p>1st September 2012</p>
					<h3>Nullam Quis Risus Eget Urna</h3>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit...</p>
					<p><a href="#" class="arrowed">Read Article</a></p>
				</div>
			</div>
			
			<div class="three-col">
				<div class="three-col-2">
					<p>27th August 2012</p>
					<h3>Praesent Commodo Cursus</h3>
					<p>Nullam quis risus eget urna mollis ornare vel eu leo. Praesent commodo cursus magna, vel scelerisque nisl consectetur et...</p>
					<p><a href="#" class="arrowed">Read Article</a></p>
				</div>
			</div>
			
			<div class="three-col">
				<div class="three-col-3">
					<p>26th August 2012</p>
					<h3>Posuere Consectetur</h3>
					<p>Etiam porta sem malesuada magna mollis euismod. Sed posuere consectetur est at lobortis. Sed posuere consectetur est at lobortis...</p>
					<p><a href="#" class="arrowed">Read Article</a></p>
				</div>
			</div>
			
		</div>
		-->