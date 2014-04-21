<?php 

use models\rights\Realm;
use models\rights\Roles;

require_once 'base.php';

class Public_app extends Base {
	
	public function view($app = 'main') {
		$appFolder = "angular-app/" . $this->site . "/public/$app";
		if (!file_exists($appFolder)) {
			$appFolder = "angular-app/bellows/app/public/$app";
			if (!file_exists($appFolder)) {
				show_404($this->site); // this terminates PHP
			}
		}

		$data = array();
		$data['appName'] = $app;
		$data['site'] = $this->site;
		$data['appFolder'] = $appFolder;
		
		$data['jsFiles'] = array();
		self::addJavascriptFiles("angular-app/bellows/js", $data['jsFiles']);
		self::addJavascriptFiles ( "angular-app/bellows/directive", $data ['jsFiles'] );
		self::addJavascriptFiles($appFolder, $data['jsFiles']);
			
		$data['cssFiles'] = array();
		self::addCssFiles("angular-app/bellows/css", $data['cssFiles']);
		self::addCssFiles("$appFolder", $data['cssfiles']);
			
		$data['title'] = $this->site;
		$data['jsonSession'] = '"";'; // empty json session data that angular-app template needs to be happy
		
		$this->renderPage("angular-app", $data);
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
					//$isMin = (strpos($base, '-min') !== false) || (strpos($base, '.min') !== false);
					$isMin = FALSE;
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
