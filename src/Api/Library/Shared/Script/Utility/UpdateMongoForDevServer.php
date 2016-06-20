<?php

namespace Api\Library\Shared\Script\Utility;

use Api\Library\Shared\Website;
use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;
use Api\Model\UserListModel;
use Api\Model\UserModel;

class UpdateMongoForDevServer
{
    public function run($userId, $mode = 'test') {
        $testMode = ($mode != 'run');
        $message = '';

        $website = Website::get();
        $onDevMachine = strpos($website->domain, 'dev.') !== FALSE;
        $onLocalMachine = strrpos($website->domain, '.local') !== FALSE;
        if ($onDevMachine || $onLocalMachine) {
            $siteNameMap = array();

            if ($onDevMachine) {
                $message .= "Script being run on the DEVELOPMENT SERVER khrap\n";
                $siteNameMap['scriptureforge.org'] = 'dev.scriptureforge.org';
                $siteNameMap['jamaicanpsalms.com'] = 'jamaicanpsalms.dev.scriptureforge.org';
                $siteNameMap['languageforge.org'] = 'dev.languageforge.org';

            } else { // on local machine
                $message .= "Script being run on your LOCAL MACHINE khrap\n";
                $siteNameMap['scriptureforge.org'] = 'scriptureforge.local';
                $siteNameMap['jamaicanpsalms.com'] = 'jamaicanpsalms.scriptureforge.local';
                $siteNameMap['languageforge.org'] = 'languageforge.local';
            }

            $siteNameCount = array();
            $userCount = array();
            foreach($siteNameMap as $from => $to) {
                $siteNameCount[$from] = 0;
                $userCount[$from] = 0;
            }

            $projectlist = new ProjectListModel();
            $projectlist->read();

            // loop over every project
            foreach ($projectlist->entries as $projectParams) {
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

            // loop over every user
            $userlist = new UserListModel();
            $userlist->read();

            foreach ($userlist->entries as $userParams) {
                $user = new UserModel($userParams['id']);
                $newSiteRole = array();
                //$message .= $user->username . "\n";
                foreach ($user->siteRole as $siteName => $role) {
                    //$message .= "$siteName : $role\n";
                    if (array_key_exists($siteName, $siteNameMap)) {
                        //$message .= "MATCH: $siteName\n";
                        $newSiteRole[$siteNameMap[$siteName]] = $role;
                        $userCount[$siteName]++;
                    }
                }
                $user->siteRole->exchangeArray($newSiteRole);
                if (!$testMode) {
                    $user->write();
                }
            }

            // report changes
            foreach($siteNameMap as $from => $to) {
                $count = $siteNameCount[$from];
                if ($count > 0) {
                    $message .= "$count $from projects changed site to $to\n";
                } else {
                    $message .= "No $from projects encountered\n";
                }

                $count = $userCount[$from];
                if ($count > 0) {
                    $message .= "$count $from users changed site to $to\n";
                } else {
                    $message .= "No $from users encountered\n";
                }
            }

        } else {
            $message .= "You must run this script from a dev or a local instance!  This script cannot be run on production instance!";
        }

        return $message;
    }
}
