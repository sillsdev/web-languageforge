<?php

require_once 'base.php';

class Upload extends Base {

	public function receive($param) {
		$allowedTypes = array("audio/mpeg", "audio/wav");
		$allowedExtensions = array(".mp3", ".wav");
		
		// form submit
		$file = $_FILES['file'];
		$fileType = $file['type'];
		$fileName = $file['name'];
		$fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);
		
		if ($file['error'] == UPLOAD_ERR_OK) {
			if (in_array($fileType, $allowedTypes) && in_array($fileExt, $allowedExtensions)) {
				move_uploaded_file(
					$file['tmp_name'],
					'audio/' . $fileName
				);
				echo "<p>File $fileName uploaded.</p>";
			} else {
				$allowedExtensionsStr = implode(", ", $allowedExtensions);
				echo "<p>File $fileName is not an allowed audio file. Ensure the file is one of $allowedExtensionsStr.</p>";
			}
		}
	}
}

?>