<?php

namespace libraries\shared;

use models\ProjectModel;

class Website {
	
	const SCRIPTUREFORGE = 'scriptureforge';
	const LANGUAGEFORGE = 'languageforge';
	
	/**
	 * 
	 * @var string - the domain / hostname of the website
	 */
	public $domain;
	
	/**
	 * 
	 * @var string - the theme name of this website
	 */
	public $theme;
	
	/**
	 * 
	 * @var bool - whether or not to force HTTPS for this website
	 */
	public $ssl;
	
	/**
	 * 
	 * @var the base site for this website: either scriptureforge or languageforge
	 */
	public $base;
	
	/**
	 * 
	 * @var string - the name of the default project for this site, if any
	 */
	public $defaultProjectName;
	
	/**
	 * 
	 * @var array<Website>
	 */
	private static $_sites;
	/**
	 * 
	 * @var array
	 */
	private static $_redirect;
	public static function init() {
		$sites = array();
		$redirect = array();
		
		// SCRIPTUREFORGE WEBSITES
		$sites['scriptureforge.local'] = new Website('scriptureforge.local', self::SCRIPTUREFORGE);
		$sites['www.scriptureforge.org'] = new Website('www.scriptureforge.org', self::SCRIPTUREFORGE);
		$sites['dev.scriptureforge.org'] = new Website('dev.scriptureforge.org', self::SCRIPTUREFORGE);
		$sites['jamaicanpsalms.dev.scriptureforge.org'] = new Website('jamaicanpsalms.dev.scriptureforge.org', self::SCRIPTUREFORGE, 'jamaicanpsalms', true, 'jamaicanpsalms');
		$sites['jamaicanpsalms.com'] = new Website('jamaicanpsalms.com', self::SCRIPTUREFORGE, 'jamaicanpsalms', true, 'jamaicanpsalms');
		
		// SCRIPTUREFORGE REDIRECTS
		$redirect['scriptureforge.org'] = 'www.scriptureforge.org';
		$redirect['www.jamaicanpsalms.com'] = 'jamaicanpsalms.com';
		$redirect['www.jamaicanpsalms.org'] = 'jamaicanpsalms.com';
		$redirect['jamaicanpsalms.org'] = 'jamaicanpsalms.com';

		// LANGUAGEFORGE WEBSITES
		$sites['languageforge.local'] = new Website('languageforge.local', self::LANGUAGEFORGE);
		$sites['www.languageforge.org'] = new Website('www.languageforge.org', self::LANGUAGEFORGE);
		$sites['dev.languageforge.org'] = new Website('dev.languageforge.org', self::LANGUAGEFORGE);
		
		self::$_sites = $sites;
		self::$_redirect = $redirect;
	}
	
	/**
	 * 
	 * @param string $domain - domain / hostname of the website
	 * @param string $base - either scriptureforge or languageforge
	 * @param string $theme - theme name
	 * @param bool $ssl - whether or not to force HTTPS for this website
	 */
	public function __construct($domain, $base = self::SCRIPTUREFORGE, $theme = 'default', $ssl = false, $defaultProjectName = '') {
		$this->domain = $domain;
		$this->base = $base;
		$this->theme = $theme;
		$this->ssl = $ssl;
		$this->defaultProjectName = $defaultProjectName;
	}
	
	public static function get($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		if (array_key_exists($hostname, self::$_sites)) {
			return self::$_sites[$hostname];
		} else {
			return null;
		}
	}
	
	public static function getRedirect($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		if (array_key_exists($hostname, self::$_sites)) {
			$website = self::$_sites[self::$_redirect[$hostname]];
			$protocol = 'http';
			if ($website->ssl) {
				$protocol = 'https';
			}
			return "$protocol://" . $website->domain;
		} else {
			return '';
		}
	}
	
	/**
	 * Convenience function to get the website object or redirect based upon ssl setting or a redirect list
	 * @param string $hostname
	 * @return Ambigous <NULL, \libraries\shared\array<Website>>|NULL
	 * FYI Not testable - test get() and getRedirect() instead
	 */
	public static function getOrRedirect($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		$website = self::get($hostname);
		if ($website) {
			// check for https
			if ($website->ssl && (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "")) {
				header("Location: https://" . $hostname . $_SERVER['REQUEST_URI']);
			} else {
				return $website;
			}
		} else {
			$url = self::getRedirect($hostname);
			if ($url) {
				header("Location: $url", true, 302); 
			} else {
				return null;	
			}
		}
	}
	
	/**
	 * 
	 * @param string $hostname - HTTP_HOST header or equivalent
	 * @return string - returns the second to last token in the domain name. Ideally returns either 'scriptureforge' or 'languageforge'
	 */
	public static function guessBaseSite($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		$uriParts = explode('.', $hostname);
		array_pop($uriParts); // pop off the .org
		return array_pop($uriParts);
	}
	
	public static function getSiteName($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
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
	 * get an array of available project themes for a base site (scriptureforge or languageforge)
	 * note: not currently used
	 * @param string $baseSite
	 * @return array
	 */
	public static function getProjectThemeNamesForSite($baseSite = self::SCRIPTUREFORGE) {
		$themeNames = array();
		$sitePath = APPPATH . 'views/' . $baseSite;
		if (is_dir($sitePath)) {
			$folders = glob($sitePath . '/*' , GLOB_ONLYDIR);
			foreach ($folders as &$folder) {
				$folder = pathinfo($folder, PATHINFO_BASENAME);
			}
			$themeNames = $folders;
		}
		
		return $themeNames;	
	}
	
}
Website::init();

?>
