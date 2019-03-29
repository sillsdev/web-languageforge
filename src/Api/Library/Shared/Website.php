<?php

namespace Api\Library\Shared;

use Api\Model\Shared\Rights\SiteRoles;

class Website
{
    const SCRIPTUREFORGE = 'scriptureforge';
    const LANGUAGEFORGE = 'languageforge';

    /**
     * Website constructor.
     * @param string $domain
     * @param string $base
     * @throws \Exception
     */
    public function __construct($domain, $base)
    {
        if ($base != self::SCRIPTUREFORGE && $base != self::LANGUAGEFORGE) {
            throw new \Exception('website->base must be either scriptureforge or languageforge');
        }
        $this->domain = $domain;
        $this->name = $domain;
        $this->base = $base;
        $this->theme = 'default';
        $this->ssl = false;
        $this->isProduction = false;
        $this->defaultProjectCode = '';
        $this->userDefaultSiteRole = SiteRoles::USER;
        $this->allowSignupFromOtherSites = true;
        $this->releaseStage = 'local';
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

    /** @var boolean */
    public $isProduction;

    /** @var string - the release stage - live, qa, development, local */
    public $releaseStage;

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
            switch ($forwardedServer) {
                case 'dev.scriptureforge.org' :
                case 'dev.languageforge.org' :
                case 'qa.languageforge.org' :
                    return $forwardedHost;
                    break;
            }
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
     * @throws \Exception
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
            } elseif (strpos($hostname, '.')) {
                header("Location: http://" . substr($hostname, strpos($hostname, '.') + 1), true, 302);
            }
        }

        return null;
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
     * This function contains the "definitions" for each website/domain
     */
    public static function init()
    {
        self::$_sites = WebsiteInstances::getLanguageForgeSites() + WebsiteInstances::getScriptureForgeSites();
        self::$_redirect = WebsiteInstances::getRedirects();
    }
}

Website::init();
