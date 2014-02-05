<?php 

use models\rights\Realm;
use models\rights\Roles;

require_once 'secure_base.php';

class App extends Secure_base {
	
	public function view($app = 'main', $project = 'default') {
		$appFolder = "angular-app/" . $this->site . "/$app";
		if (!file_exists($appFolder)) {
			$appFolder = "angular-app/account/$app";
			if (!file_exists($appFolder)) {
				show_404(); // this terminates PHP
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

		$data['jsCommonFiles'] = array();
		self::addJavascriptFiles("angular-app/common/js", $data['jsCommonFiles']);
		$data['jsProjectFiles'] = array();
		self::addJavascriptFiles($appFolder, $data['jsProjectFiles']);
			
		$data['title'] = $this->site;
		
		$this->_render_page("angular-app", $data);
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
