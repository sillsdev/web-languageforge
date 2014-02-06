<?php 

require_once 'base.php';

class Pages extends Base {
	
	public function view($page = 'frontpage') {
		$data = array();
		$data['title'] = $this->site;
		$data['is_static_page'] = true;
		
		if (empty($this->getProjectTemplatePath("pages/$page"))) {
			show_404();
		} else {
			$this->renderPage("pages/$page", $data);
		}
	}
}


?>