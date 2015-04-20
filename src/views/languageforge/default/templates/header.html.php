        <div id="header">
            <div class="container">
                <div class="lf-logo">
                    <img src="/images/languageforge/default/lf_logo-beta.png" alt="Language Forge" width="96" height="117" class="png_bg" />
                </div>
                <div id="header-nav" class="pull-left">
                    <ul class="sf-menu">
                        <li><a href="/">Home</a></li>
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
