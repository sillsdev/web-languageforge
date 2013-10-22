<?php

require_once 'base.php';

class Upload extends Base {

	public function receive($param) {
		// form submit
		$file = $_FILES['file'];
	
		if ($file['error'] == UPLOAD_ERR_OK) {
			$fileName = $file['name'];
			move_uploaded_file(
				$file['tmp_name'],
				'audio/' . $fileName
			);
			echo "<p>File $fileName uploaded.</p>";
		}
	}
}

?>