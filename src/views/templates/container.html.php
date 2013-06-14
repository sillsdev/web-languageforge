<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view('templates/meta.html.php');
?>
</head>
<body>
<?php
$this->load->view('templates/header.html.php');
?>
<div class="container cf">
	<div style="margin: 40px 0 0 140px">
		<?php $this->load->view($page); ?>
	</div>
</div>
<?php
$this->load->view('templates/script.html.php');
$this->load->view('templates/footer.html.php');
?>
</body>
</html>
