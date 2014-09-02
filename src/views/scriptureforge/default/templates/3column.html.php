		<div class="container">
			<div class="row">
			<?php foreach ($columns as $num => $column): ?>
				<div class="span4">
					<h3><?php echo $column['title'] ?></h3>
					<p><?php echo $column['summary']?></p>
					<?php if ($column['target_url']): ?>
					<p><a href="<?php echo $column['target_url'] ?>" class="arrowed">Read More</a></p>
					<?php endif ?>
				</div>
			<?php endforeach; ?>
			</div>
		</div>
