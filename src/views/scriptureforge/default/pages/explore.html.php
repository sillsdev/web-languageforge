<div class="container banner">
	<img src="/images/scriptureforge/default/beach2.jpg" width="965px" height="360px" alt="on the beach" />
</div>

<div class="container">
	
			<h2>Explore Featured Scriptureforge.org Projects</h2>
			
			<?php if (count($featuredProjects) > 0): ?>
			<p>Below is a list of Scriptureforge.org projects that you can learn more about:</p>
			
				<?php foreach($featuredProjects as $project): ?>
					<h3><a href="<?php echo "/projects/" . str_replace(" ", "_", strtolower($project['projectName'])); ?>"><?php echo $project['projectName']; ?></a></h3>
				<?php endforeach; ?>
			
			<?php else: ?>
			
			<h4>There are currently no featured projects listed.</h4><h4>Check back again later!</h4>
			
			<?php endif;?>
			
</div>