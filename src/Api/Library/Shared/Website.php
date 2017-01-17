<?php

namespace Api\Library\Shared;

// this class is loaded early in index.php and therefore cannot have any dependencies on other libraries

class Website
{
    const SCRIPTUREFORGE = 'scriptureforge';
    const LANGUAGEFORGE = 'languageforge';

    // TODO: figure out how to use SiteRoles instead of these constants (required because we cannot load SiteRoles directly)
    const SITEROLE_NONE = 'none';
    const SITEROLE_USER = 'user';
    const SITEROLE_PROJECT_CREATOR = 'project_creator';
    const SITEROLE_SITE_MANAGER = 'site_manager';

    /**
     * @param string $domain
     * @param string $base
     * @throws \Exception
     */
    public function __construct($domain, $base)
    {
        if ($base != self::SCRIPTUREFORGE && $base != self::LANGUAGEFORGE) { throw new \Exception('website->base must be either scriptureforge or languageforge'); }
        $this->domain = $domain;
        $this->name = $domain;
        $this->base = $base;
        $this->theme = 'default';
        $this->ssl = false;
        $this->defaultProjectCode = '';
        $this->userDefaultSiteRole = self::SITEROLE_USER; // must match SiteRoles::USER;
        $this->allowSignupFromOtherSites = true;
    }

    /** @var string - the domain / hostname of the website */
    public $domain;

    /** @var string */
    public $name;

    /** @var string - the theme name of this website */
    public $theme;

    /** @var boolean - whether or not to force HTTPS for this website */
    public $ssl;

    /** @var string - the base site for this website: either scriptureforge or languageforge */
    public $base;

    /** @var string - the name of the default project for this site, if any */
    public $defaultProjectCode;

    /** @var string - a role constant from SiteRoles */
    public $userDefaultSiteRole;

    /** @var boolean */
    public $allowSignupFromOtherSites;

    /** @var array<Website> */
    private static $_sites;

    /** @var array */
    private static $_redirect;

    /**
     * @param string $hostname
     * @return Website
     */
    public static function get($hostname = '')
    {
        if (!$hostname) {
            $hostname = self::getHostname();
        }
        if (array_key_exists($hostname, self::$_sites)) {
            return self::$_sites[$hostname];
        } else {
            return null;
        }
    }

    private static function getHostname()
    {
        if (array_key_exists('HTTP_X_FORWARDED_SERVER', $_SERVER) && array_key_exists('HTTP_X_FORWARDED_HOST', $_SERVER)) {
            // special exception for reverse proxy on dev.scriptureforge.org
            $forwardedServer = $_SERVER['HTTP_X_FORWARDED_SERVER'];
            $forwardedHost = $_SERVER['HTTP_X_FORWARDED_HOST'];
            if ($forwardedServer == 'dev.scriptureforge.org' || $forwardedServer == 'dev.languageforge.org') {
                return $forwardedHost;
            }
        }

        $pos = strpos($_SERVER['HTTP_HOST'], 'm.');
        if ($pos === 0) {
            return substr($_SERVER['HTTP_HOST'], 2);
        }

        return $_SERVER['HTTP_HOST'];
    }

    /**
     * @param string $hostname
     * @return string
     * @throws \Exception
     */
    public static function getRedirect($hostname = '')
    {
        if (!$hostname) {
            $hostname = self::getHostname();
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
    
    public static function getRawRedirect($hostname) {
        if (array_key_exists($hostname, self::$_redirect)) {
            return self::$_redirect[$hostname];
        }
        return '';
    }

    /**
     * Convenience function to get the website object or redirect based upon ssl setting or a redirect list
     * FYI Not testable  because of the inclusion of the header() method : test get() and getRedirect() instead
     * @param string $hostname
     * @return Website
     */
    public static function getOrRedirect($hostname = '')
    {
        if (!$hostname) {
            $hostname = self::getHostname();
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
                header("Location: http://" . substr($hostname, strpos($hostname, '.')+1), true, 302);
            }
        }
    }

    public function baseUrl()
    {
        $protocol = ($this->ssl) ? "https" : "http";

        return $protocol . "://" . $this->domain;
    }

    public function templatePath($templateFile)
    {
        $path = APPPATH . "views/" . $this->base . '/' . $this->theme . "/$templateFile";
        if (!file_exists($path)) {
            $path = APPPATH . "views/" . $this->base . "/default/$templateFile";
        }

        return $path;
    }

    public function getAngularPath($appName) {
        $dirPath = "angular-app/" . $this->base . "/$appName";
        if (!file_exists($dirPath)) {
            $dirPath = "angular-app/bellows/apps/$appName";
            if (!file_exists($dirPath)) {
                $dirPath = '';
            }
        }
        return $dirPath;
    }

    /**
     * get an array of available project themes for a base site (scriptureforge or languageforge)
     * @param string $baseSite
     * @return array
     */
    /* note: not currently used
    public static function getProjectThemeNamesForSite($baseSite = self::SCRIPTUREFORGE)
    {
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

    /**
     * This function contains the "definitions" for each website/domain
     */
    public static function init()
    {
        self::$_sites = WebsiteInstances::getLanguageForgeSites() + WebsiteInstances::getScriptureForgeSites();
        self::$_redirect = WebsiteInstances::getRedirects();
    }
}

Website::init();
