<?php

require_once 'base.php';

class Upload extends Base {

	public function receive($param) {
		//$request = file_get_contents('php://input');
		//var_dump($request);
		echo "PHP says:\n";
		var_dump($_FILES);
		var_dump($_REQUEST);
		var_dump($_POST);
	}
}


?>