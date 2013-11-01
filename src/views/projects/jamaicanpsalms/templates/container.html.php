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


<?php if (strstr($_SERVER['HTTP_HOST'], 'jamaicanpsalms.com')): ?>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-22170471-9', 'jamaicanpsalms.com');
  ga('send', 'pageview');

</script>
<?php endif; ?>

</body>
</html>
