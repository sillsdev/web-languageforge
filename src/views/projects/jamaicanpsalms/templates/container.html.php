<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view('projects/jamaicanpsalms/templates/meta.html.php');
?>
</head>
<body>
<div id="maincontainer">
<?php
$this->load->view('projects/jamaicanpsalms/templates/header.html.php');
$this->load->view($page); 
$this->load->view('projects/jamaicanpsalms/templates/script.html.php');
?>
<div class="container clearfooter">&nbsp;</div>
</div>
<?php $this->load->view('projects/jamaicanpsalms/templates/footer.html.php'); ?>
</body>
</html>
