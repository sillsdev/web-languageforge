<?php 

require_once 'base.php';

class Pages extends Base {
	
	public function view($page = 'frontpage') {
		$data = array();
		$data['title'] = "Scripture Forge";
		if ( ! file_exists('views/pages/'.$page.'.html.php'))
		{
			show_404();
		} else {
			$this->_render_page("pages/$page", $data);
		}
	}
}


?>