			<?php
            // perhaps this data array should be put into the controller?

            $data['slides'] = array(
                array(
                    "title" => "Di Jamiekan Saamz (The Jamaican Psalms)",
                    "summary" => "Jamaicans from all over the world helping to translate their favourite Psalms into the Jamaican language!"
                    ),
                array(
                    "title" => "Di Jamiekan Saamz (The Jamaican Psalms)",
                    "summary" => "Jamaicans from all churches and backgrounds working together for the good of Jamaica and the Jamiekan Saamz translation."
                    ),
                array(
                    "title" => "Di Jamiekan Saamz (The Jamaican Psalms)",
                    "summary" => "Connecting with the book of Psalms and with each other like never before. Speak your mind. Ask Questions. Improve it!"
                    )
            );
            $this->load->view("$themePath/templates/slideshow.html.php", $data);
            ?>


			<div class="container">
				<div class="row">
					<div class="span7">
						<h2 class="lifted-text">Welcome to the <span class="sf-jamaican-green">Jamaican Psalms Project</span></h2>
						<p>Oudi! Wa'a gwaan?</p>
						<p>Imagine hundreds, maybe thousands, of Jamaicans from all over the world (male and female, all ages, all churches and job backgrounds), helping to translate their favourite Psalms into Jamaican. We do this face-to-face in our home and church groups using this Jamaican Psalms translation website. This is a translation of the Psalms by Jamaicans for Jamaicans. Gad wod iina fi wi langwij! Join the cause by creating a user account now. It frii!</p>
					</div>
					<div class="span5">
						<iframe width="380" height="285" src="//www.youtube.com/embed/hYlECJ35Wos" frameborder="0" allowfullscreen></iframe>
					</div>
					</div>
			</div>


			<?php

            $data['columns'] = array(
                array(
                    "title" => "Your Role",
                    "summary" => "A few translation experts can know many things, but they can't know everything to produce the best possible translation. This is where you come in.  You also have things to contribute to the translation. Your experiences, knowledge, spiritual gifts, special insights, talents, and many other things can benefit the translation team in important ways.",
                    "button" => "Learn More",
                    "target_url" => "#"
                    ),
                array(
                    "title" => "How it Works",
                    "summary" => "First, the team of trained translators meets with Jamaicans from various church denominations, universities and professions (pastors, teachers, and others). Together you talk about the Psalms chapters to be translated. Next, based on your help, the translation team produces a first draft and they post it on this website. Then you and everyone who has created a user account on the website can...",
                    "button" => "Read More",
                    "target_url" => "/learn_how_it_works"
                    ),
                array(
                    "title" => "Get Started",
                    "summary" => "There are two ways you can start right away: Organize a face-to-face Psalms study group and share your group's insights with the translation team.� Create a log-in and begin interacting with the translators and others from the Jamaican community over the translation drafts they post on this website. Either way, you are helping to produce your Jamaican Psalms translation. It's that easy.",
                    "button" => "Get Started Now",
                    "target_url" => "/signup"
                    )
            );
            $this->load->view("$themePath/templates/3column.html.php", $data);
            ?>



			<div class="sub-foot-detailing"></div>
			<div id="sub-foot">
				<div class="container">
					<div class="row">
						<div class="span3"><img src="/images/scriptureforge/jamaicanpsalms/sf-sub-footer-pic.png" alt="Israel's Story" style="width:146px;height:150px;margin-top:72px; margin-left:60px" /></div>
						<div class="span9">
							<h3>The Impact of the Bible</h3>
							<p>Many Jamaicans have been touched by the Jamaican New Testament! Take Israel, for example, a young British-Jamaican young man living in England. He talks to us regularly on our Facebook page. Ever so often he reads for his family members from the Jamaican New Testament (JNT). One day, he read to his grandmother from the JNT. His grandmother then told her pastor about the JNT. The pastor was curious, so Israel was asked to take his JNT to church and read from it during worship! Israel messaged us after the service, this was what he said:</p>

							<p>"I've just got home from church. Believe me when I tell you that they LOVE the JNT! Thank you for my copy of the JNT in my own language. I've come to realise that when you listen to the Bible in your language, it is more meaningful to you."</p>
<!-- 							<p><a href="/create_account" class="arrowed">Get Involved Today</a></p> -->
							<p>
								<a href="/signup">
									<button class="btn sf-btnJ sf-btnJ3" href="/signup">Get Started Now</button>
								</a>
							</p>
							</div>
					</div>
				</div>
			</div>
			<div class="sub-foot-detailing"></div>
