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
$this->load->view('templates/header.html.php');
$this->load->view($page); 
$this->load->view('templates/script.html.php');
?>
<div class="clearfooter"></div>
</div>
<?php $this->load->view('templates/footer.html.php'); ?>
</body>
</html>
