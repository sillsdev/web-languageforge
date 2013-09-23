<!--[if lte IE 8]>
<div style="text-align:center">Your browser may not work so well. Please consider <a href="learn_faq">upgrading</a> to a modern standards compliant browser.</div>
<![endif]-->
		<div id="header" class="png_bg">
			<div class="sfcontainer">
				<div class="sf-logo-large">
					<img src="/images/sf_logo_medium.png" alt="Scripture Forge" style="width:92px; height:114px" class="png_bg" />
				</div>
				<div id="header-nav" class="left">
					<ul class="sf-menu">
						<li><a href="/">Home</a></li>
						<li><a href="#">Explore</a>
							<ul>
							<?php foreach($featuredProjects as $project): ?>
								<li><a href="<?php echo "/projects/" . str_replace(" ", "_", strtolower($project['projectname'])); ?>"><?php echo $project['projectname']; ?></a></li>
							<?php endforeach; ?>
								<!--
								<li><a href="#">Sub Menu Item 2</a>
									<ul>
										<li><a href="#">Another Sub Menu Item 1</a></li>
										<li><a href="#">Another Sub Menu Item 2</a></li>
										<li><a href="#">Another Sub Menu Item 3</a></li>
									</ul>
								</li>
								-->
							</ul>
						</li>
						<li><a href="/learn_scripture_forge">Learn</a>
							<ul>
								<li><a href="/learn_faq">Frequently Asked Questions</a></li>
								<li><a href="/learn_scripture_forge">About Scripture Forge</a></li>
								<li><a href="/learn_expand_your_team">Expand Your Team</a></li>
								<li><a href="/learn_contribute">Contribute</a></li>
							</ul>
						</li>
						<li><a href="/contribute">Contribute</a></li>
						<li><a href="/discuss">Discuss</a></li>
					</ul>
				</div>
				
				<?php if ($logged_in):?>
					<div class="right">
							<ul class="sf-menu">
								<li><a href="/app/sfchecks#/projects">My Projects</a>
									<ul>
									<?php foreach($projects as $project): ?>
										<li><a href="<?php echo "/app/sfchecks#/project/" . $project['id']; ?>"><?php echo $project['projectname']; ?></a></li>
									<?php endforeach;?>
									</ul>
								</li>
							</ul>
							<ul class="sf-menu">
							<li>
							<a href="#"><img src="<?php echo $small_avatar_url; ?>" style="width: 30px; height: 30px; float:left; position:relative; top:-6px; border:1px solid white; margin-right:10px" />Hi, <?php echo $user_name; ?></a>
								<ul>
									<?php if ($is_admin):?>
									<li><a href="/app/sfadmin">Site Administration</a></li>
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
						<input type="button" value="Login" style="position:relative; top:-3px" class="login-btn left" onclick="window.location='/auth/login'"/> &nbsp; or &nbsp; <a href="/signup">Create an Account</a>
					</div>
				<?php endif;?>
				
			</div>
		</div>
