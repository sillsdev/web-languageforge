<?php

use models\TextModel;
use models\ProjectModel;

require_once 'base.php';

class Upload extends Base {

	public function receive() {
		$allowedTypes = array("audio/mpeg");
		$allowedExtensions = array(".mp3");
		
		$file = $_FILES['file'];
		$fileType = $file['type'];
		$fileName = $file['name'];
		$fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

		$projectId = $_POST['projectId'];
		$textId = $_POST['textId'];
		
		if ($file['error'] == UPLOAD_ERR_OK) {
			if (in_array($fileType, $allowedTypes) && in_array($fileExt, $allowedExtensions)) {
				// make the folder if it doesn't exist
				$folderPath = 'assets/' . $projectId;
				if (!file_exists($folderPath) and !is_dir($folderPath)) {
					mkdir($folderPath);
				};
				
				// cleanup previous files of any allowed extension
				$cleanupFiles = glob($folderPath . '/' . $textId . '*[' . implode(', ', $allowedExtensions) . ']');
				foreach ($cleanupFiles as $filename) {
					@unlink($filename);
				}
				
				// move uploaded file from tmp location to assets
				$filePath =  $folderPath . '/' . $textId . '_' . $fileName;
				$moveOk = move_uploaded_file($file['tmp_name'], $filePath);

				// update database with file location
				$project = new ProjectModel($projectId);
				$text = new TextModel($project, $textId);
				if ($moveOk) {
					$text->audioUrl = $filePath;
				} else {
					$text->audioUrl = '';
				}
				$text->write();

				echo "File $fileName uploaded.";
			} else {
				$allowedExtensionsStr = implode(", ", $allowedExtensions);
				if (count($allowedExtensions) < 1) {
					echo "File $fileName is not an allowed audio file. No audio file formats are cerrently enabled.";
				} else if (count($allowedExtensions) == 1) {
					echo "File $fileName is not an allowed audio file. Ensure the file is an $allowedExtensionsStr.";
				} else {
					echo "File $fileName is not an allowed audio file. Ensure the file is one of the following types: $allowedExtensionsStr.";
				}
			}
		}
	}
}

?>