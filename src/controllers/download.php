<?php 

require_once 'base.php';

class Download extends Base {
	
	public function assets($id, $file) {
		$filePath = APPPATH .  "assets/$id/" . urldecode($file);
		if (!file_exists($filePath)) {
			show_404($this->site);
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