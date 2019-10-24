#!/usr/bin/php -q

<?php

require_once('../scriptsConfig.php');

use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

// When we change the site name, don't update the date modified timestamps
define('MAPPERMODEL_NO_TIMESTAMP_UPDATE', true);

class ChangeSiteName
{
    public static function getNewSiteName($target, $siteName) {
        if (strpos($siteName, "languageforge") !== false) {
            if ($target == "qa") {
                return "qa.languageforge.org";
            }
            return "languageforge.localhost";
        }
        if (strpos($siteName, "scriptureforge") !== false) {
            if ($target == "qa") {
                return "qa.scriptureforge.org";
            }
            return "scriptureforge.localhost";
        }
        return '';
    }

    public static function run($mode, $target)
    {
        $testMode = ($mode != 'run');
        $siteNameCount = array();

        // loop over every project
        $projectList = new ProjectListModel();
        $projectList->read();

        print "Parsing " . $projectList->count . " projects.\n";
        foreach ($projectList->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            $siteName = $project->siteName;
            $newSiteName = self::getNewSiteName($target, $siteName);
            if ($newSiteName) {
                $project->siteName = $newSiteName;
                if (!$testMode) {
                    $project->write();
                }
                if (array_key_exists($siteName, $siteNameCount)) {
                    $siteNameCount[$siteName]++;
                } else {
                    $siteNameCount[$siteName] = 1;
                }
            }
        }
        foreach(array_keys($siteNameCount) as $from) {
            $count = $siteNameCount[$from];
            print "$count $from projects changed site to " . self::getNewSiteName($target, $from) . "\n";
        }
        print "\n";

        $siteNameCount = array();

        // loop over every user
        $userList = new UserListModel();
        $userList->read();
        $userChangeCount = 0;
        print "Parsing " . $userList->count . " users.\n";
        foreach ($userList->entries as $userParams) {
            $siteNamesToRemove = array();
            $userId = $userParams['id'];
            $user = new UserModel($userId);
            foreach ($user->siteRole->getArrayCopy() as $siteName => $role) {
                $newSiteName = self::getNewSiteName($target, $siteName);
                if ($newSiteName) {
                    $user->siteRole[$newSiteName] = $role;
                    $siteNamesToRemove[] = $siteName;
                    if (array_key_exists($siteName, $siteNameCount)) {
                        $siteNameCount[$siteName]++;
                    } else {
                        $siteNameCount[$siteName] = 1;
                    }
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
        foreach(array_keys($siteNameCount) as $from) {
            $count = $siteNameCount[$from];
            print "$count users of $from projects changed site to " . self::getNewSiteName($target, $from) . "\n";
        }
        print "\n";
    }
}
if (count($argv) != 3) {
    print "Usage:\n" . "php changeSiteName.php [run|test] [qa|local]\n\n" .
        "examples:\n\n" . "php changeSiteName.php test local\n    - test changes but do not make actual changes.  " .
        "Change site names to the localhost site available on developer machines\n\n" .
        "php changeSiteName.php run qa\n     - change the database.  change site names to the QA site\n";
    exit;
}

$mode = $argv[1];
if ($mode != 'test' && $mode != 'run') {
    print "Error: first argument must be either 'test' or 'run' which determines script run mode\n";
    exit;
}

$target = $argv[2];
if ($target != 'qa' && $target != 'local') {
    print "Error: second argument must be either 'qa' or 'local' which determines the target site\n";
    exit;
}

ChangeSiteName::run($mode, $target);
