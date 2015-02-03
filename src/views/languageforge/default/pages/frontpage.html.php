<?php
// perhaps this data array should be put into the controller?

$data['slides'] = array(
    array(
        "title" => "Expand your team",
        "summary" => "No applications or plug-ins to install.  Just invite people to contribute to a project, and they'll be able to make updates from their web browser anytime, anywhere.",
        "social_media" => "",
        "image_url" => "team.jpg",
        "target_url" => "/learn_expand_your_team"
    ),
    array(
        "title" => "Rapidly develop a dictionary online",
        "summary" => "Language Forge enables communities to participate in the dictionary development like never before.  Create brand new projects.  Or bring existing WeSay or FieldWorks projects into the cloud for online collaboration",
        "social_media" => "",
        "image_url" => "lf_edit_view.png",
        "target_url" => "/learn_language_forge"
    ),
    array(
        "title" => "Customize your project",
        "summary" => "Give members roles on a project as Observers, Commenters, Contributors, or fellow Managers.  Each of them can get a custom view so they only see the fields applicable to their role.  Determine which fields are visible in the entries, senses, and examples.",
        "social_media" => "",
        "image_url" => "lf_roles.png",
        "target_url" => "/learn_language_forge" // TODO learn_roles 2014-08 DDW
    ),
    array(
        "title" => "Get feedback along the way",
        "summary" => "With the commenting system, people can have discussions about the lexical entries, tagged down to the field.  Prioritize comments as \"Todo\" and then \"Resolve\" when they're complete.",
        "social_media" => "",
        "image_url" => "lf_comments_view.png",
        "target_url" => "/learn_language_forge" // TODO learn_comments 2014-08 DDW
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

			<div class="container">
				<div class="sub-promotion">
				<div class="row row-padded">
					<div class="span4">
						<img src="/images/languageforge/default/girlsmiling.jpg" alt="girl smiling" width="299" height="182" class="left">
					</div>
					<div class="span8">
						<h3>The Power of Collaboration</h3>
						<p>When everyone plays their part in producing a dictionary in your language, everyone benefits.  It's the power of collaboration that provides richer and more accurate dictionaries.  Our technology brings dictionary development to the masses, in a positive environment that focuses participants on the task and works wherever they are.  On the tablet, phone or web, Language Forge is there.</p>
						<p><a href="/signup" class="arrowed">Get Involved Today</a></p>
					</div>
				</div>
				</div>
			</div>
