<?php

use models\shared\rights\Operation;

use models\shared\rights\Domain;

use models\scriptureforge\SfchecksProjectModel;

use models\shared\dto\RightsHelper;

use models\TextModel;
use models\ProjectModel;

require_once 'secure_base.php';

class Upload extends Secure_base {

	public function receive() {
		$projectModel = new SfchecksProjectModel($this->_projectId);
		if (!$projectModel->hasRight($this->_userId, Domain::TEXTS + Operation::EDIT)) {
			throw new \Exception("Insufficient privilege to upload");
		}
		
		// Note: ideally in the future this would have been implemented as an API method to take advantage of the security measures in place - cjh
		$allowedTypes = array("audio/mpeg", "audio/mp3");	// type: documented, observed
		$allowedExtensions = array(".mp3");
		
		$file = $_FILES['file'];
		$fileType = $file['type'];
		$fileName = $file['name'];
		$fileName = str_replace(array('/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'), '_', $fileName);	// replace special characters with _
		$fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);

		$projectId = $this->_projectId;
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
				foreach ($cleanupFiles as $cleanupFile) {
					@unlink($cleanupFile);
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

				echo "File uploaded successfully.";
			} else {
				$allowedExtensionsStr = implode(", ", $allowedExtensions);
				if (count($allowedExtensions) < 1) {
					echo "$fileName is not an allowed audio file. No audio file formats are currently enabled.";
				} else if (count($allowedExtensions) == 1) {
					echo "$fileName is not an allowed audio file. Ensure the file is an $allowedExtensionsStr.";
				} else {
					echo "$fileName is not an allowed audio file. Ensure the file is one of the following types: $allowedExtensionsStr.";
				}
			}
		}
	}
}

?>
