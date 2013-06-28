		<div id="header" class="png_bg">
			
			<div class="container">
				
				<?php if (isset($is_static_page)):?>
				<div class="sf-logo-large">
					<img src="/images/sf_logo_large.png" alt="Scripture Forge" width="96" height="165" class="png_bg" />
				</div>
				<?php endif;?>
				
				<div id="header-nav" class="left">
				<?php if (!isset($is_static_page)):?>
					<img align="left" style="margin: 2px 10px 0 0" src="/images/sf_logo_small.png" alt="Scripture Forge" width="27" height="36" />
				<?php endif;?>
					<ul class="sf-menu">
						<li><a href="/">Home</a></li>
						<li><a href="#">Explore</a>
							<ul>
								<li><a href="#">Jamaica Project 1</a></li>
								<!--
								<li><a href="#">Sub Menu Item 2</a>
									<ul>
										<li><a href="#">Another Sub Menu Item 1</a></li>
										<li><a href="#">Another Sub Menu Item 2</a></li>
										<li><a href="#">Another Sub Menu Item 3</a></li>
									</ul>
								</li>
								-->
								<li><a href="#">Jamaica Project 2</a></li>
								<li><a href="#">Jamaica Project 3</a></li>
							</ul>
						</li>
						<li><a href="/learn_scripture_forge">Learn</a>
							<ul>
								<li><a href="/learn_scripture_forge">About Scripture Forge</a></li>
								<li><a href="/learn_expand_your_team">Expand Your Team</a></li>
								<li><a href="/learn_contribute">Contribute</a></li>
							</ul>
						</li>
						<li><a href="/contribute">Contribute</a></li>
						<li><a href="/discuss">Discuss</a></li>
					</ul>
						<?php if ($is_admin):?>
							<ul style="margin-left: 50px" class="sf-menu">
								<li><a href="#">Administration</a>
									<ul>
										<li><a href="/app/sfadmin">Users and Projects</a></li>
										<li><a href="/app/projectadmin/p1">My First Project</a></li>
									</ul>
								</li>
							</ul>
						<?php endif;?>
				</div>
				
				<?php if ($logged_in):?>
					<div id="account" class="right">
						<img src="<?php echo $small_gravatar_url; ?>" style="float:left; position:relative; top:-4px; border:1px solid white; margin-right:10px" />
						
						<ul class="sf-menu">
							<li><a href="#">Welcome, <?php echo $user_name; ?></a>
								<ul>
									<li><a href="/app/userprofile">My Profile</a></li>
									<li><a href="/auth/change_password">Change Password</a></li>
								</ul>
							</li>
						</ul>
						
						<span style="margin-left:10px" ><a href="/auth/logout">Logout</a></span>
					</div>
				
				<?php else:?>
					<div id="account" class="right">
						<input type="button" value="Login" class="login-btn left" onclick="window.location='/auth/login'"/> &nbsp; or &nbsp; <a href="#">Create an Account</a>
					</div>
				<?php endif;?>
				
			</div>
		</div>