<?php 

require_once 'base.php';

class Download extends CI_Controller {
	
	public function assets($id, $file) {
		$filePath = APPPATH .  "assets/$id/$file";
		if (!file_exists($filePath)) {
			show_404();
			return;
		}
		header("Content-type: octet/stream");
		header("Content-disposition: attachment; filename=" . $file . ";");
		header("Content-Length: ".filesize($filePath));
		readfile($filePath);
		exit;
	}

}

?>