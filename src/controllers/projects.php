<?php 

require_once 'base.php';

class Projects extends Base {
	
	public function view($project = 'unknown') {
		$data = array();
		$data['title'] = "Scripture Forge";
		$data['is_static_page'] = true;
		
		$templateInFolder = 'projects/' . $project . '/pages/frontpage';
		$templateInSingleFile = 'projects/' . $project;

		if (file_exists(self::templateToPath($templateInFolder))) {
			$this->renderProjectPage('pages/frontpage', $project, $data);
		} else if (file_exists(self::templateToPath($templateInSingleFile))) {
			$this->_render_page($templateInSingleFile, $data);
		} else {
			$this->_render_page("projects/not_yet_implemented", $data);
		}
	}
	
}

?>