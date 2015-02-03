<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view($controller->template('templates/meta'));
?>
</head>
<body>
<div id="maincontainer">
<?php
$this->load->view($controller->template('templates/header'));
$this->load->view($contentTemplate);
$this->load->view($controller->template('templates/script'));
?>
<div class="clearfooter"></div>
</div>
<?php
$this->load->view($controller->template('templates/footer'));
$this->load->view($controller->template('templates/analytics'));
 ?>
</body>
</html>
