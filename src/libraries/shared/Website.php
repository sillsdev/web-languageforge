<?php

namespace libraries\shared;

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
     * @var string - a role constant from SiteRoles
     */
    public $userDefaultSiteRole;

    /**
     *
     * @var bool
     */
    public $allowSignupFromOtherSites;

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
    /**
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

        return $_SERVER['HTTP_HOST'];
    }

    /**
     * @param string $hostname
     * @return string
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
        $sites = array();
        $redirect = array();

        /*
         * **************************
         * SCRIPTURE FORGE WEBSITES
         * **************************
         */

        // scriptureforge.local sites
        $w = new Website('scriptureforge.local', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['scriptureforge.local'] = $w;

        $w = new Website('e2etest.scriptureforge.local', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['e2etest.scriptureforge.local'] = $w;

        $w = new Website('jamaicanpsalms.scriptureforge.local', self::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaicanpsalms';
        $sites['jamaicanpsalms.scriptureforge.local'] = $w;

        $w = new Website('demo.scriptureforge.local', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['demo.scriptureforge.local'] = $w;

        // dev.scriptureforge.org sites
        $w = new Website('dev.scriptureforge.org', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['dev.scriptureforge.org'] = $w;

        $w = new Website('demo.dev.scriptureforge.org', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['demo.dev.scriptureforge.org'] = $w;

        $w = new Website('jamaicanpsalms.dev.scriptureforge.org', self::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaican_psalms';
        $sites['jamaicanpsalms.dev.scriptureforge.org'] = $w;

        // scriptureforge.org
        $w = new Website('scriptureforge.org', self::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['scriptureforge.org'] = $w;

        // jamaicanpsalms.com
        $w = new Website('jamaicanpsalms.com', self::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaican_psalms';
        $sites['jamaicanpsalms.com'] = $w;

        // waaqwiinaagiwritings.org
        $w = new Website('waaqwiinaagiwritings.org', self::SCRIPTUREFORGE);
        $w->name = 'Waaqwiinaagi Writings';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->defaultProjectCode = 'waaqwiinaagiwritings';
        $sites['waaqwiinaagiwritings.org'] = $w;
        
        /*
         * **************************
         * LANGUAGE FORGE WEBSITES
         * **************************
         */

        // languageforge.local sites
        $w = new Website('languageforge.local', self::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['languageforge.local'] = $w;

        $w = new Website('e2etest.languageforge.local', self::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['e2etest.languageforge.local'] = $w;

        // dev.languageforge.org sites
        $w = new Website('dev.languageforge.org', self::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $sites['dev.languageforge.org'] = $w;

        // languageforge.org
        $w = new Website('languageforge.org', self::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->userDefaultSiteRole = self::SITEROLE_PROJECT_CREATOR;
        $w->ssl = true;
        $sites['languageforge.org'] = $w;

        /*
         * **************************
         * REDIRECTS
         * **************************
         */

        $redirect['www.scriptureforge.org'] = 'scriptureforge.org';
        $redirect['www.languageforge.org'] = 'languageforge.org';
        $redirect['www.jamaicanpsalms.com'] = 'jamaicanpsalms.com';
        $redirect['www.jamaicanpsalms.org'] = 'jamaicanpsalms.com';
        $redirect['jamaicanpsalms.org'] = 'jamaicanpsalms.com';

        self::$_sites = $sites;
        self::$_redirect = $redirect;
    }

}

Website::init();
