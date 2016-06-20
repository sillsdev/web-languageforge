#!/usr/bin/php -q

<?php

require_once('../scriptsConfig.php');

use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;

class ChangeSiteNameToLocal
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print "Change Site Name To Local\n\n";

        $siteNameMap = array(
            "languageforge.org" => "languageforge.local",
            "scriptureforge.org" => "scriptureforge.local",
            "jamaicanpsalms.com" => "scriptureforge.local"
        );

        $siteNameCount = array();
        foreach($siteNameMap as $from => $to) {
            $siteNameCount[$from] = 0;
        }
        
        // loop over every project
        $projectlist = new ProjectListModel();
        $projectlist->read();

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            $siteName = $project->siteName;
            if (array_key_exists($siteName, $siteNameMap)) {
                $project->siteName = $siteNameMap[$siteName];
                $siteNameCount[$siteName]++;
                if (!$testMode) {
                    $project->write();
                }
            }
        }
        foreach($siteNameMap as $from => $to) {
            $count = $siteNameCount[$from];
            if ($count > 0) {
                print "$count $from projects changed site to $to\n";
            } else {
                print "No $from projects encountered\n";
            }
        }
        print "\n";
    }
}

ChangeSiteNameToLocal::run('run');
