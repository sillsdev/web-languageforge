<?php

namespace Api\Library\Shared;

// this class is loaded early in index.php and therefore cannot have any dependencies on other libraries

class WebsiteInstances
{

    /**
     * This function contains the site "definitions" for Scripture Forge sites
     * @return array
     */
    public static function getScriptureForgeSites()
    {
        $sites = array();

        /*
         * **************************
         * SCRIPTURE FORGE WEBSITES
         * **************************
         */

        // scriptureforge.local sites
        $w = new Website('scriptureforge.local', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['scriptureforge.local'] = $w;

        $w = new Website('e2etest.scriptureforge.local', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['e2etest.scriptureforge.local'] = $w;

        $w = new Website('jamaicanpsalms.scriptureforge.local', Website::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaicanpsalms';
        $sites['jamaicanpsalms.scriptureforge.local'] = $w;

        $w = new Website('jamaicanpsalms.e2etest.scriptureforge.local', Website::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaicanpsalms';
        $sites['jamaicanpsalms.e2etest.scriptureforge.local'] = $w;

        $w = new Website('demo.scriptureforge.local', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['demo.scriptureforge.local'] = $w;

        // dev.scriptureforge.org sites
        $w = new Website('dev.scriptureforge.org', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['dev.scriptureforge.org'] = $w;

        $w = new Website('demo.dev.scriptureforge.org', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['demo.dev.scriptureforge.org'] = $w;

        $w = new Website('jamaicanpsalms.dev.scriptureforge.org', Website::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaican_psalms';
        $sites['jamaicanpsalms.dev.scriptureforge.org'] = $w;

        // scriptureforge.org
        $w = new Website('scriptureforge.org', Website::SCRIPTUREFORGE);
        $w->name = 'Scripture Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['scriptureforge.org'] = $w;

        // jamaicanpsalms.com
        $w = new Website('jamaicanpsalms.scriptureforge.org', Website::SCRIPTUREFORGE);
        $w->name = 'The Jamaican Psalms Project';
        $w->ssl = true;
        $w->theme = 'jamaicanpsalms';
        $w->defaultProjectCode = 'jamaican_psalms';
        $sites['jamaicanpsalms.scriptureforge.org'] = $w;

        // waaqwiinaagiwritings.org
        $w = new Website('waaqwiinaagiwritings.org', Website::SCRIPTUREFORGE);
        $w->name = 'Waaqwiinaagi Writings';
        $w->ssl = true;
        $w->theme = 'simple';
        $w->defaultProjectCode = 'waaqwiinaagiwritings';
        $sites['waaqwiinaagiwritings.org'] = $w;

        return $sites;
    }


    /**
     * This function contains the site "definitions" for Language Forge sites
     * @return array
     */
    public static function getLanguageForgeSites()
    {
        $sites = array();


        /*
         * **************************
         * LANGUAGE FORGE WEBSITES
         * **************************
         */

        // languageforge.local sites
        $w = new Website('languageforge.local', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['languageforge.local'] = $w;

        $w = new Website('m.languageforge.local', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge Mobile';
        $w->ssl = false;
        $w->theme = 'mobile';
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['m.languageforge.local'] = $w;

        $w = new Website('e2etest.languageforge.local', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = false;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['e2etest.languageforge.local'] = $w;

        // dev.languageforge.org sites
        $w = new Website('dev.languageforge.org', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->ssl = true;
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $sites['dev.languageforge.org'] = $w;

        // languageforge.org
        $w = new Website('languageforge.org', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge';
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $w->ssl = true;
        $sites['languageforge.org'] = $w;

        $w = new Website('m.languageforge.org', Website::LANGUAGEFORGE);
        $w->name = 'Language Forge Mobile';
        $w->userDefaultSiteRole = Website::SITEROLE_PROJECT_CREATOR;
        $w->ssl = true;
        $w->theme = 'mobile';
        $sites['m.languageforge.org'] = $w;

        return $sites;
    }


    /**
     * @return array
     */
    public static function getRedirects() {

        $redirects = array();

        $redirects['www.scriptureforge.org'] = 'scriptureforge.org';
        $redirects['www.languageforge.org'] = 'languageforge.org';
        $redirects['www.jamaicanpsalms.com'] = 'jamaicanpsalms.scriptureforge.org';
        $redirects['www.jamaicanpsalms.org'] = 'jamaicanpsalms.scriptureforge.org';
        $redirects['jamaicanpsalms.org'] = 'jamaicanpsalms.scriptureforge.org';
        $redirects['jamaicanpsalms.com'] = 'jamaicanpsalms.scriptureforge.org';

        return $redirects;

    }

}
