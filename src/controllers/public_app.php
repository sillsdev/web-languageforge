<?php 

use models\rights\Realm;
use models\rights\Roles;

require_once 'base.php';

class Public_app extends Base {
	
	public function view($app = 'main') {
		$appFolder = "angular-app/" . $this->site . "/public/$app";
		if (!file_exists($appFolder)) {
			$appFolder = "angular-app/account/public/$app";
			if (!file_exists($appFolder)) {
				show_404(); // this terminates PHP
			}
		}

		$data = array();
		$data['appName'] = $app;
		$data['site'] = $this->site;
		$data['appFolder'] = $appFolder;
		
		$data['jsCommonFiles'] = array();
		self::addJavascriptFiles("angular-app/common/js", $data['jsCommonFiles']);
		$data['jsProjectFiles'] = array();
		self::addJavascriptFiles($appFolder, $data['jsProjectFiles']);
			
		$data['title'] = $this->site;
		$data['jsonSession'] = '"";'; // empty json session data that angular-app template needs to be happy
		
		$this->_render_page("angular-app", $data);
	}
	
	private static function ext($filename) {
		return pathinfo($filename, PATHINFO_EXTENSION);
	}

	private static function basename($filename) {
		return pathinfo($filename, PATHINFO_BASENAME);
	}
	
	private static function addJavascriptFiles($dir, &$result) {
		if (($handle = opendir($dir))) {
			while ($file = readdir($handle)) {
				if (is_file($dir . '/' . $file)) {
					$base = self::basename($file);
					$isMin = (strpos($base, '-min') !== false) || (strpos($base, '.min') !== false);
					if (!$isMin && self::ext($file) == 'js') {
						$result[] = $dir . '/' . $file;
					}
				} elseif ($file != '..' && $file != '.') {
					self::addJavascriptFiles($dir . '/' . $file, $result);
				}
			}
			closedir($handle);
		}
	}
}

?>
