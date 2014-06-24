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
	 * @var string
	 */
	public $name;
	
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
	 * @var string - the base site for this website: either scriptureforge or languageforge
	 */
	public $base;
	
	/**
	 * 
	 * @var string - the name of the default project for this site, if any
	 */
	public $defaultProjectCode;
	
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
		$sites['scriptureforge.local'] = new Website('scriptureforge.local', 'ScriptureForge', self::SCRIPTUREFORGE);
		$sites['www.scriptureforge.org'] = new Website('www.scriptureforge.org', 'ScriptureForge', self::SCRIPTUREFORGE);
		$sites['dev.scriptureforge.org'] = new Website('dev.scriptureforge.org', 'ScriptureForge', self::SCRIPTUREFORGE);
		$sites['jamaicanpsalms.dev.scriptureforge.org'] = new Website('jamaicanpsalms.dev.scriptureforge.org', 'The Jamaican Psalms Project', self::SCRIPTUREFORGE, 'jamaicanpsalms', true, 'jamaicanpsalms');
		$sites['jamaicanpsalms.com'] = new Website('jamaicanpsalms.com', 'The Jamaican Psalms Project', self::SCRIPTUREFORGE, 'jamaicanpsalms', true, 'jamaicanpsalms');
		
		// SCRIPTUREFORGE REDIRECTS
		$redirect['scriptureforge.org'] = 'www.scriptureforge.org';
		$redirect['www.jamaicanpsalms.com'] = 'jamaicanpsalms.com';
		$redirect['www.jamaicanpsalms.org'] = 'jamaicanpsalms.com';
		$redirect['jamaicanpsalms.org'] = 'jamaicanpsalms.com';

		// LANGUAGEFORGE WEBSITES
		$sites['languageforge.local'] = new Website('languageforge.local', 'LanguageForge', self::LANGUAGEFORGE);
		$sites['www.languageforge.org'] = new Website('www.languageforge.org', 'LanguageForge', self::LANGUAGEFORGE);
		$sites['dev.languageforge.org'] = new Website('dev.languageforge.org', 'LanguageForge', self::LANGUAGEFORGE);
		
		self::$_sites = $sites;
		self::$_redirect = $redirect;
	}
	
	/**
	 * 
	 * @param string $domain - domain / hostname of the website
	 * @param string $name - display name of the website
	 * @param string $base - either 'scriptureforge' or 'languageforge'
	 * @param string $theme - theme name
	 * @param bool $ssl - whether or not to force HTTPS for this website
	 */
	public function __construct($domain, $name, $base = self::SCRIPTUREFORGE, $theme = 'default', $ssl = false, $defaultProjectCode = '') {
		$this->domain = $domain;
		$this->name = $name;
		$this->base = $base;
		$this->theme = $theme;
		$this->ssl = $ssl;
		$this->defaultProjectCode = $defaultProjectCode;
	}
	
	/**
	 * @param string $hostname
	 * @return Website
	 */
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
	
	/**
	 * @param string $hostname
	 * @return string
	 */
	public static function getRedirect($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		if (array_key_exists($hostname, self::$_redirect)) {
			$redirectTo = self::$_redirect[$hostname];
			if (array_key_exists($redirectTo, self::$_sites)) {
				$website = self::$_sites[$redirectTo];
				$protocol = 'http';
				if ($website->ssl) {
					$protocol = 'https';
				}
				return "$protocol://" . $website->domain;
			} else {
				throw new \Exception('Trying to redirect from $hostname to $redirectTo but $redirectTo is not a valid website!');
			}
		} else {
			return '';
		}
	}
	
	/**
	 * Convenience function to get the website object or redirect based upon ssl setting or a redirect list
	 * FYI Not testable  because of the inclusion of the header() method : test get() and getRedirect() instead
	 * @param string $hostname
	 * @return Website
	 */
	public static function getOrRedirect($hostname = '') {
		if (!$hostname) {
			$hostname = $_SERVER['HTTP_HOST'];
		}
		$website = self::get($hostname);
		if ($website) {
			// check for https
			if ($website->ssl && (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "")) {
				header("Location: " . $website->baseUrl() . $_SERVER['REQUEST_URI']);
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
	
	public function baseUrl() {
		$protocol = ($this->ssl) ? "https" : "http";
		return $protocol . "://" . $this->domain;
	}
	
	public function templatePath($templateFile) {
		$path = APPPATH . "views/" . $this->base . '/' . $this->theme . "/$templateFile";
		if (!file_exists($path)) {
			$path = APPPATH . "views/" . $this->base . "/default/$templateFile";
		}
		return $path;
	}
	
	/**
	 * get an array of available project themes for a base site (scriptureforge or languageforge)
	 * @param string $baseSite
	 * @return array
	 */
	/* note: not currently used
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
	*/
	
}
Website::init();

?>
