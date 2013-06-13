		<div class="container cf">
		<?php foreach ($columns as $num => $column): ?>
			<div class="three-col">
				<div class="three-col-<?php echo $num + 1 ?>">
					<h2><?php echo $column['title'] ?></h2>
					<p><?php echo $column['summary']?></p>
					<?php if ($column['target_url']): ?>
					<p><a href="<?php echo $column['target_url'] ?>" class="arrowed">Read More</a></p>
					<?php endif ?>
				</div>
			</div>
		<?php endforeach; ?>
		</div>