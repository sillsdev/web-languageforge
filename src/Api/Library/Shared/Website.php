<?php

namespace Api\Library\Shared;

use Api\Model\Shared\Rights\SiteRoles;
use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

class Website
{
    const LANGUAGEFORGE = 'languageforge';

    /**
     * Website constructor.
     * @param string $domain
     * @param string $base
     * @throws \Exception
     */
    public function __construct($domain, $base)
    {
        if ($base != self::LANGUAGEFORGE) {
            throw new \Exception('website->base must be languageforge');
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

    /** @var string - the base site for this website: languageforge */
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
        return Env::requireEnv('WEBSITE');
    }

    public function baseUrl()
    {
        $protocol = ($this->ssl) ? "https" : "http";

        return $protocol . "://" . $this->domain;
    }

    /**
     * This function contains the "definitions" for each website/domain
     */
    public static function init()
    {
        self::$_sites = WebsiteInstances::getLanguageForgeSites();
        self::$_redirect = WebsiteInstances::getRedirects();
    }
}

Website::init();
