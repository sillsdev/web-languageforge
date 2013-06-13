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
$this->load->view('pages/' . $page . '.html.php');
$this->load->view('templates/script.html.php');
$this->load->view('templates/footer.html.php');
?>
</body>
</html>
