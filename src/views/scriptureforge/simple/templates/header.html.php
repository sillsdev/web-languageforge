<!--[if lte IE 8]>
<div style="text-align:center">Your browser may not work so well. Please consider <a href="learn_faq">upgrading</a> to a modern standards compliant browser.</div>
<![endif]-->
		<div id="header">
			<div class="container">
				<div class="sf-logo-medium">
					<img src="/images/scriptureforge/simple/sf_logo_medium.png" alt="Scripture Forge" style="width:92px; height:114px" />
				</div>
				<div id="header-nav" class="pull-left">
					<ul class="sf-menu">
						<li><a href="/">Home</a></li>
						<!--
						<li><a href="/explore">Explore</a>
							<ul>
							<?php foreach($featuredProjects as $project): ?>
								<li><a href="<?php echo "/projects/" . str_replace(" ", "_", strtolower($project['projectName'])); ?>"><?php echo $project['projectName']; ?></a></li>
							<?php endforeach; ?>
							</ul>
						</li>
						-->
						<li><a href="/learn_scripture_forge">Learn</a>
							<ul>
								<li><a href="/learn_faq">Frequently Asked Questions</a></li>
								<li><a href="/learn_scripture_forge">About Scripture Forge</a></li>
								<li><a href="/learn_expand_your_team">Expand Your Team</a></li>
							</ul>
						</li>
						<li><a href="/discuss">Discuss</a></li>
					</ul>
				</div>
				
				<?php if ($logged_in):?>
					<div class="pull-right">
						<ul id="header-nav" class="sf-menu">
							<li id="myProjects"><a href="/app/projects">My Projects</a>
								<ul>
								<?php foreach($projects as $project): ?>
									<li><a href="<?php echo "/app/" . $project['appName'] . "/" . $project['id'] . "/"; ?>"><?php echo $project['projectName']; ?></a></li>
								<?php endforeach;?>
								</ul>
							</li>
							<li>
							<a href="#"><img src="<?php echo $small_avatar_url; ?>" style="width: 28px; height: 28px; float:left; position:relative; top:-5px; border:1px solid white; margin-right:10px" id="smallAvatarURL" />Hi, <?php echo $user_name; ?></a>
								<ul>
									<?php if ($is_admin):?>
									<li><a href="/app/siteadmin">Site Administration</a></li>
									<?php endif;?>
									<li><a href="/app/userprofile">My Profile</a></li>
									<li><a href="/app/activity">My Activity</a></li>
									<li><a href="/app/changepassword">Change Password</a></li>
									<li><a href="/auth/logout">Logout</a></li>
								</ul>
							</li>
						</ul>
					</div>
				
				<?php else:?>
					<div id="account" class="pull-right">
						<input type="button" value="Login" style="position:relative; top:-3px" class="login-btn left" onclick="window.location='/auth/login'"/> &nbsp; or &nbsp; <a href="/signup">Create an Account</a>
					</div>
				<?php endif;?>
				
			</div>
		</div>
