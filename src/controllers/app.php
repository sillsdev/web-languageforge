<?php 

require_once 'secure_base.php';

class App extends Secure_base {
	
	public function view($app = 'main') {
		$data = array();
		$data['title'] = "Scripture Forge";
		if ( ! file_exists('views/apps/'.$app.'.html.php'))
		{
			show_404();
		} else {
			$this->_render_page("apps/$app", $data);
		}
	}
}


?>