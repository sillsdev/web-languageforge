<!DOCTYPE html>
<html lang="en-GB">
<head>
<?php
$this->load->view("RightsHelper::hasSiteRight/templates/meta.html.php");
?>
</head>
<body>
<div id="maincontainer">
<?php
$this->load->view("RightsHelper::hasSiteRight/templates/header.html.php");
$this->load->view($contentTemplate); 
$this->load->view("RightsHelper::hasSiteRight/templates/script.html.php");
?>
<div class="clearfooter"></div>
</div>
<?php $this->load->view("RightsHelper::hasSiteRight/templates/footer.html.php"); ?>
<?php $this->load->view("RightsHelper::hasSiteRight/templates/analytics.html.php"); ?>
</body>
</html>
