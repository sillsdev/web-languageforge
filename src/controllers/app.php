<?php 

require_once 'secure_base.php';

class App extends Secure_base {
	
	public function view($app = 'main') {
		if ( ! file_exists("angular-app/$app")) {
			show_404();
		} else {
			$data = array();
			$data['appName'] = $app;
			$data['jsSessionVars'] = '{"userid": "' . $this->session->userdata('user_id') . '"}';
			$data['jsCommonFiles'] = $this->getCommonJSFiles();
			$data['jsProjectFiles'] = $this->getProjectJSFiles($app);
			$data['title'] = "Scripture Forge";
			$this->_render_page("angular-app", $data);
		}
	}
	
	private function getCommonJSFiles() {
		$allfiles = scandir("angular-app/common/js");
		return array_filter($allfiles, "filterForJS");
	}
	
	private function getProjectJSFiles($appName) {
		$allfiles = scandir("angular-app/$appName/js");
		return array_filter($allfiles, "filterForJS");
	}
}

function filterForJS($filename) {
	return (bool)preg_match('/\.js$/', $filename);
}

?>