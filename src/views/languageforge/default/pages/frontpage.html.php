			<?php 
			// perhaps this data array should be put into the controller?
			
			$data['slides'] = array(
				array(
					"title" => "Develop a dictionary",
					"summary" => "Language Forge enables communities to participate in the dictionary development like never before.",
					"social_media" => "{Social Media}",
					"image_url" => "community.jpg",
					"target_url" => "/learn_language_forge"
					),
				array(
					"title" => "Your Team, Expanded",
					"summary" => "Improve your dictionary project by adding more native speakers to your workflow.",
					"social_media" => "{Social Media}",
					"image_url" => "team.jpg",
					"target_url" => "/learn_expand_your_team"
					),
				array(
					"title" => "Make a Difference Today",
					"summary" => "Speak a minority language?  Help us to build a dictionary in your language.",
					"social_media" => "{Social Media}",
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
			<p><a href="/create_account" class="arrowed">Get Involved Today</a></p>
		</div>
		
		<div class="sfcontainer cf">
			<h2>Latest News</h2>
			
			<div class="three-col">
				<div class="three-col-1">
					<p>16 July 2013</p>
					<h3>Early experiments with language forge under way</h3>
					<p>We are currently in the process of building the system to the point that we can start sharing dictionaries between language forge, <a href="http://wesay.palaso.org/" target="_blank">WeSay</a>, and <a href="http://fieldworks.sil.org/flex/" target="_blank" >FieldWorks Language Explorer</a>. We are not ready for real testing yet but will let you know when you can start experimenting.</p>
				    <!-- <p><a href="#" class="arrowed">Read Article</a></p> -->
				</div>
			</div>
			
			<div class="three-col">
				<div class="three-col-2">
					<p>2012</p>
					<h3>Experimentation with environments</h3>
					<p>In 2012 we implemented an equivalent to part of the interface using GWT and embedded this into a Drupal site. We were not able to get the Drupal part of the site working well however</p>
					<!-- <p><a href="#" class="arrowed">Read Article</a></p> -->
				</div>
			</div>
			
			<div class="three-col">
				<div class="three-col-3">
					<p>2011</p>
					<h3>Initiation of the Lexical Web app</h3>
					<p>In 2011 we started experimenting with develpoment of a Web app that would integrate with the mature tools that SIL has created for lexical development. A plan was then created for further development.</p>
					<!-- <p><a href="#" class="arrowed">Read Article</a></p> -->
				</div>
			</div>
			
		</div>