<?php

namespace libraries;

use models\ProjectModel;

class Website {
	
	const SCRIPTUREFORGE = 'scriptureforge';
	const LANGUAGEFORGE = 'languageforge';
	
	public static function getSiteName($domainName = '') {
		if (!$domainName) {
			$domainName = $_SERVER['HTTP_HOST'];
		}
		$uriParts = explode('.', $domainName);
		array_pop($uriParts); // pop off the .org
		$site = array_pop($uriParts);

		// exception list for custom standalone domains
		if ($site == 'jamaicanpsalms') {
			$site = self::SCRIPTUREFORGE;
		}

		return $site;
	}
	
	/**
	 * 
	 * @param string $domainName
	 * @return string
	 */
	public static function getProjectThemeNameFromDomain($domainName = '') {
		if (!$domainName) {
			$domainName = $_SERVER['HTTP_HOST'];
		}
		$themeName = ProjectModel::domainToProjectCode($domainName);
		if (!$themeName) {
			$themeName = 'default';	
		}
		return $themeName;
	}
	
	/**
	 * 
	 * @param string $domainName
	 * @return string
	 */
	public static function getProjectViewsPathFromDomain($domainName = '') {
		if (!$domainName) {
			$domainName = $_SERVER['HTTP_HOST'];
		}
		return 'views/' . self::getSiteName($domainName) . '/' . self::getProjectThemeNameFromDomain($domainName);
	}
	
	
	public static function getProjectImagesPath() {
		
	}
	
	public static function getProjectCssPath() {
		
	}
}

?>
