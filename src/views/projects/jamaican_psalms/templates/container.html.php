<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view('projects/jamaican_psalms/templates/meta.html.php');
?>
</head>
<body>
<div id="maincontainer">
<?php
$this->load->view('projects/jamaican_psalms/templates/header.html.php');
$this->load->view($page); 
$this->load->view('projects/jamaican_psalms/templates/script.html.php');
?>
<div class="clearfooter"></div>
</div>
<?php $this->load->view('projects/jamaican_psalms/templates/footer.html.php'); ?>
</body>
</html>
