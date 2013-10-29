<?php 

require_once 'base.php';

class Pages extends Base {
	
	public function view($page = 'frontpage') {
		$data = array();
		$data['title'] = "Scripture Forge";
		$data['is_static_page'] = true;
		
		if ($this->_project == 'scriptureforge') {
			$view = 'pages/'.$page;
		} else {
			$view = 'projects/' . $this->_project . '/pages/' . $page;
			$filePath = self::templateToPath($view);
			if (!file_exists($filePath)) {
				$view = 'pages/'.$page;
			}
		}
		
		$filePath = self::templateToPath($view);
		
		if (!file_exists($filePath)) {
			show_404();
		} else {
			$this->_render_page($view, $data);
		}
	}
}


?>