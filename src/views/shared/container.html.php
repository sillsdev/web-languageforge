<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$controller->loadTemplate('meta');
$controller->loadTemplate('templates/meta');
?>
</head>
<body>
<div id="maincontainer">
<?php
$controller->loadTemplate('templates/header');
$this->load->view($contentTemplate);
$controller->loadTemplate('templates/script');
?>
<div class="clearfooter"></div>
</div>
<?php
$controller->loadTemplate('templates/footer');
$controller->loadTemplate('templates/analytics');
 ?>
</body>
</html>
