<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view('templates/meta.html.php');
?>
</head>
<body>
<div id="maincontainer">
<?php
$this->load->view("$projectPath/templates/header.html.php");
$this->load->view($contentTemplate); 
$this->load->view("$projectPath/templates/script.html.php");
?>
<div class="clearfooter"></div>
</div>
<?php $this->load->view("$projectPath/templates/footer.html.php"); ?>
<?php $this->load->view("$projectPath/templates/analytics.html.php"); ?>
</body>
</html>
