<?php 

use models\rights\Realm;
use models\rights\Roles;

require_once 'secure_base.php';

class App extends Secure_base {
	
	public function view($app = 'main', $project = 'default') {
		$appFolder = "angular-app/" . $this->site . "/$app";
		if (!file_exists($appFolder)) {
			$appFolder = "angular-app/bellows/apps/$app";
			if (!file_exists($appFolder)) {
				show_404($this->site); // this terminates PHP
			}
		}
	
		$data = array();
		$data['appName'] = $app;
		$data['site'] = $this->site;
		$data['appFolder'] = $appFolder;
		
		// User Id
		$sessionData = array();
		$sessionData['userId'] = (string)$this->session->userdata('user_id');
		
		// Rights
		$role = $this->_user->role;
		if (empty($role)) {
			$role = Roles::USER;
		}
		$sessionData['userSiteRights'] = Roles::getRightsArray(Realm::SITE, $role);
		$sessionData['site'] = $this->site;
		
		// File Size
		$postMax = self::fromValueWithSuffix(ini_get("post_max_size"));
		$uploadMax = self::fromValueWithSuffix(ini_get("upload_max_filesize"));
		$fileSizeMax = min(array($postMax, $uploadMax));
		$sessionData['fileSizeMax'] = $fileSizeMax;
		
		$jsonSessionData = json_encode($sessionData);
		$data['jsonSession'] = $jsonSessionData;

		$data['jsFiles'] = array();
		self::addJavascriptFiles("angular-app/bellows/js", $data['jsFiles'], array('vendor/', 'assets/'));
		self::addJavascriptFiles ( "angular-app/bellows/directive", $data ['jsFiles'] );
		self::addJavascriptFiles($appFolder, $data['jsFiles'], array('vendor/', 'assets/'));
		
		// remove asset js files
		$data['jsNotMinifiedFiles'] = array();
		self::addJavascriptFiles("angular-app/bellows/js/vendor", $data['jsNotMinifiedFiles']);
		self::addJavascriptFiles("angular-app/bellows/js/assets", $data['jsNotMinifiedFiles']);
		self::addJavascriptFiles($appFolder . "/js/vendor", $data['jsNotMinifiedFiles']);
		self::addJavascriptFiles($appFolder . "/js/assets", $data['jsNotMinifiedFiles']);
			
		$data['cssFiles'] = array();
		self::addCssFiles("angular-app/bellows/css", $data['cssFiles']);
		self::addCssFiles($appFolder, $data['cssFiles']);

		$data['title'] = $this->site;
		
		$this->renderPage("angular-app", $data);
	}
	
	/**
	 * 
	 * @param string $val
	 * @return int
	 */
	private static function fromValueWithSuffix($val) {
		$val = trim($val);
		$result = (int)$val;
		$last = strtolower($val[strlen($val)-1]);
		switch($last) {
			// The 'G' modifier is available since PHP 5.1.0
			case 'g':
				$result *= 1024;
			case 'm':
				$result *= 1024;
			case 'k':
				$result *= 1024;
		}
	
		return $result;
	}
	
	private static function ext($filename) {
		return pathinfo($filename, PATHINFO_EXTENSION);
	}

	private static function basename($filename) {
		return pathinfo($filename, PATHINFO_BASENAME);
	}
	
	private static function addJavascriptFiles($dir, &$result, $exclude = array()) {
		self::addFiles('js', $dir, $result, $exclude);
	}

	private static function addCssFiles($dir, &$result) {
		self::addFiles('css', $dir, $result, array());
	}

	private static function addFiles($ext, $dir, &$result, $exclude) {
		if (is_dir($dir) && ($handle = opendir($dir))) {
			while ($file = readdir($handle)) {
				$filepath = $dir . '/' . $file;
				foreach ($exclude as $ex) {
					if (strpos($filepath, $ex)) {
						continue 2;
					}
				}
				if (is_file($filepath)) {
					if ($ext == 'js') {
						/* For Javascript, check that file is not minified */
						$base = self::basename($file);
						//$isMin = (strpos($base, '-min') !== false) || (strpos($base, '.min') !== false);
						$isMin = FALSE;
						if (!$isMin && self::ext($file) == $ext) {
							$result[] = $filepath;
						}
					} else {
						if (self::ext($file) == $ext) {
							$result[] = $filepath;
						}
					}
				} elseif ($file != '..' && $file != '.') {
					self::addFiles($ext, $filepath, $result, $exclude);
				}
			}
			closedir($handle);
		}
	}
}

?>
