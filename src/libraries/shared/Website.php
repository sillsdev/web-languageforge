<?php

namespace libraries\shared;

use models\ProjectModel;

class Website {
	
	const SCRIPTUREFORGE = 'scriptureforge';
	const LANGUAGEFORGE = 'languageforge';
	
	public static function normalizeUrl($url = '') {
		return $url;
	}
	
	// return 'http' or 'https'
	public static function getProtocolForHostName($hostName = '') {
		if (!$hostName) {
			$hostName = $_SERVER['HTTP_HOST'];
		}
		$default = 'http'; // Default to HTTP without specific reason for HTTPS
		$projectName = ProjectModel::domainToProjectCode($hostName);
		switch ($projectName) {
			case "jamaicanpsalms":
				$result = 'https';
				break;
			default:
				$result = $default;
		}
		return $result;
	}
	
	
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
	
	public static function getHostName($domainName = '') {
		if (!$domainName) {
			$domainName = $_SERVER['HTTP_HOST'];
		}
		$uriParts = explode('.', $domainName);
		$stopWords = array(self::LANGUAGEFORGE, self::SCRIPTUREFORGE, 'www', 'dev');
		while (count($uriParts) > 0 && !in_array($uriParts[0], $stopWords)) {
			array_shift($uriParts);
		}
		return implode('.', $uriParts);
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
