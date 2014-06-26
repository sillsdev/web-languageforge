		<div id="header" class="png_bg">
			
			<div class="sfcontainer">
				<div class="lf-logo">
					<img src="/images/languageforge/default/lf_logo.png" alt="Language Forge" width="96" height="117" class="png_bg" />
				</div>
				<div id="header-nav" class="left">
					<ul class="sf-menu">
						<li><a href="/">Home</a></li>
						<!--
						<li><a href="#">Explore</a>
							<ul>
								<li><a href="#">Jamaica Project 1</a></li>
								<li><a href="#">Jamaica Project 2</a></li>
								<li><a href="#">Jamaica Project 3</a></li>
								<?php foreach($featuredProjects as $project): ?>
											<!--  not sure about this <li><a href="<?php echo "/app/" . $project['appName'] . "/" . $project['id'] . "/"; ?>"><?php echo $project['projectName']; ?></a></li>-->
											<li><a href="<?php echo "/app/project/" . $project['id']; ?>"><?php echo $project['projectName']; ?></a></li>
								<?php endforeach;?>
							</ul>
						</li>
						-->
						<li><a href="/learn_language_forge">Learn</a>
							<ul>
								<li><a href="/learn_language_forge">About Language Forge</a></li>
								<li><a href="/learn_expand_your_team">Expand Your Team</a></li>
							</ul>
						</li>
						<li><a href="/discuss">Discuss</a></li>
					</ul>
				</div>
				
				<?php if ($logged_in):?>
					<div class="right">
							<ul class="sf-menu">
								<li><a href="/app/projects">My Projects</a>
									<ul>
									<?php foreach($projects as $project): ?>
										<li><a href="<?php echo "/app/" . $project['appName'] . "/" . $project['id'] . "/"; ?>"><?php echo $project['projectName']; ?></a></li>
									<?php endforeach;?>
									</ul>
								</li>
							</ul>
							<ul class="sf-menu">
							<li>
							<a href="#"><img src="<?php echo $small_avatar_url; ?>" style="width:30px; height:30px; float:left; border:1px solid white; margin-top:-6px; margin-right:10px" />Hi, <?php echo $user_name; ?></a>
								<ul>
									<?php if ($is_admin):?>
									<li><a href="/app/siteadmin">Site Administration</a></li>
									<?php endif;?>
									<li><a href="/app/userprofile">My Profile</a></li>
									<li><a href="/app/changepassword">Change Password</a></li>
									<li><a href="/auth/logout">Logout</a></li>
								</ul>
							</li>
						</ul>
					</div>
				
				<?php else:?>
					<div id="account" class="right">
						<input type="button" value="Login" class="login-btn left" onclick="window.location='/auth/login'"/> &nbsp; or &nbsp; <a href="/signup">Create an Account</a>
					</div>
				<?php endif;?>
				
			</div>
		</div>
