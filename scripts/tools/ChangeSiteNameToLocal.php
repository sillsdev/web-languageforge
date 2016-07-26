#!/usr/bin/php -q

<?php

require_once('../scriptsConfig.php');

use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;
use Api\Model\UserListModel;
use Api\Model\UserModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

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
        $projectList = new ProjectListModel();
        $projectList->read();

        foreach ($projectList->entries as $projectParams) { // foreach existing project
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

        $siteNameCount = array();
        foreach($siteNameMap as $from => $to) {
            $siteNameCount[$from] = 0;
        }

        // loop over every user
        $userList = new UserListModel();
        $userList->read();
        $userChangeCount = 0;
        foreach ($userList->entries as $userParams) {
            $siteNamesToRemove = array();
            $userId = $userParams['id'];
            $user = new UserModel($userId);
            foreach ($user->siteRole as $siteName => $role) {
                if (array_key_exists($siteName, $siteNameMap)) {
                    $newSiteName = $siteNameMap[$siteName];
                    $user->siteRole[$newSiteName] = $role;
                    $siteNamesToRemove[] = $siteName;
                    $siteNameCount[$siteName]++;
                    $userChangeCount++;
                }
            }
            foreach ($siteNamesToRemove as $siteName) {
                unset($user->siteRole[$siteName]);
            }
            if (!$testMode) {
                $user->write();
            }
        }
        print "$userChangeCount users changed\n\n";
        foreach($siteNameMap as $from => $to) {
            $count = $siteNameCount[$from];
            if ($count > 0) {
                print "$count $from projects changed site to $to in users\n";
            } else {
                print "No $from projects encountered in users\n";
            }
        }
        print "\n";
    }
}

ChangeSiteNameToLocal::run('run');
