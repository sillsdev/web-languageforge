			<?php 
			// perhaps this data array should be put into the controller?
			
			$data['slides'] = array(
				array(
					"title" => "Develop a dictionary",
					"summary" => "Language Forge enables communities to participate in the dictionary development like never before.",
					"social_media" => "",
					"image_url" => "community.jpg",
					"target_url" => "/learn_language_forge"
					),
				array(
					"title" => "Your Team, Expanded",
					"summary" => "Improve your dictionary project by adding more native speakers to your workflow.",
					"social_media" => "",
					"image_url" => "team.jpg",
					"target_url" => "/learn_expand_your_team"
					),
				array(
					"title" => "Make a Difference Today",
					"summary" => "Speak a minority language?  Help us to build a dictionary in your language.",
					"social_media" => "",
					"image_url" => "contribute.jpg",
					"target_url" => "/learn_language_forge"
					)
			);
			$this->load->view("$themePath/templates/slideshow.html.php", $data);
			
			$data['columns'] = array(
				array(
					"title" => "Language Forge",
					"summary" => "Take your dictionary project to the next level by involving tens or hundreds more in expanding your lexicon.  Engage your language's diaspora speakers on the web or their phone, wherever they are.",
					"target_url" => "/learn_language_forge"
					),
				array(
					"title" => "Expand Your Team",
					"summary" => "Give your Language project a boost as you collect words, definitions and example scentences.  Sign-up is easy and free.  As the project manager, you can control who joins your \"extended team\" of contributors.",
					"target_url" => "/learn_expand_your_team"
					),
				array(
					"title" => "Contribute",
					"summary" => "Your ability to think and speak in your mother tongue is a powerful gift.  You could make a wonderful contribution to your own language through participating in the development of dictionaries for your language community.  You can comment on lexical items, answer questions, and follow up on other comments.  What are you waiting for?  Sign up today!",
					"target_url" => "/learn_language_forge"
					)
			);
			$this->load->view("$themePath/templates/3column.html.php", $data);
			?>
			
		<div class="sub-promotion sfcontainer cf">
			<img src="/images/languageforge/default/girlsmiling.jpg" alt="girl smiling" width="299" height="182" class="left">
			<h2>The Power of Collaboration</h2>
			<p>When everyone plays their part in producing a dictionary in your language, everyone benefits.  It's the power of collaboration that provides richer and more accurate dictionaries.  Our technology brings dictionary development to the masses, in a positive environment that focuses participants on the task and works wherever they are.  On the tablet, phone or web, Language Forge is there.</p>
			<p><a href="/signup" class="arrowed">Get Involved Today</a></p>
		</div>
