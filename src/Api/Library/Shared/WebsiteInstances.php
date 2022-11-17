<?php
namespace Api\Library\Shared;

use Api\Model\Shared\Rights\SiteRoles;

class WebsiteInstances
{
    /**
     * This function contains the site "definitions" for Language Forge sites
     * @throws \Exception
     * @return array
     */
    public static function getLanguageForgeSites()
    {
        $sites = [];

        $w = new Website("localhost", Website::LANGUAGEFORGE);
        $w->name = "Language Forge";
        $w->ssl = false;
        $w->userDefaultSiteRole = SiteRoles::PROJECT_OWNER;
        $w->releaseStage = "local";
        $sites["localhost"] = $w;

        $w = new Website("qa.languageforge.org", Website::LANGUAGEFORGE);
        $w->name = "Language Forge";
        $w->ssl = true;
        $w->userDefaultSiteRole = SiteRoles::PROJECT_OWNER;
        $w->releaseStage = "qa";
        $sites["qa.languageforge.org"] = $w;

        $w = new Website("languageforge.org", Website::LANGUAGEFORGE);
        $w->name = "Language Forge";
        $w->ssl = true;
        $w->userDefaultSiteRole = SiteRoles::PROJECT_OWNER;
        $w->isProduction = true;
        $w->releaseStage = "live";
        $sites["languageforge.org"] = $w;

        return $sites;
    }
}
