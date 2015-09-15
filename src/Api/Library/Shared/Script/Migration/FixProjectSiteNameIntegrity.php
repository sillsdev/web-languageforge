<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Library\Shared\Website;

use Api\Model\Shared\Rights\SiteRoles;

use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;
use Api\Model\UserModel;
use Api\Model\UserListModel;

class FixProjectSiteNameIntegrity
{
    public function run($userId, $mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Fix project site name integrity\n\n";
        
        // loop over every project
        $projectlist = new ProjectListModel();
        $projectlist->read();
        $fixCount = 0;

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            $hostname = $project->siteName;
            $website = Website::get($hostname);
            if (!$website) {
                // the website does not exist anymore
                $message .= "$hostname does not exist anymore...";
                
                // see if there is a redirect
                $redirect = Website::getRawRedirect($hostname);
                if ($redirect) {
                    $message .= "changed to $redirect\n";
                    $project->siteName = $redirect;
                    $fixCount++;
                    if (!$testMode) {
                        $project->write();
                    }
                } else {
                    $message .= "ERROR: dont know what to change it to since no redirect is available\n";
                }
            }
        }
        if ($fixCount > 0) {
            $message .= "\n\nFixed siteNames in $fixCount project(s)\n\n";
        } else {
            $message .= "\n\nNo non-existent siteNames were found in the projects collection\n\n";
        }

        return $message;
    }
    
    /**
     * 
     * @param UserModel $user
     * @param string $site
     * @param string $role
     */
    public function giveUserSiteRole($user, $site, $role = SiteRoles::USER) {
        $user->siteRole[$site] = $role;
    }
}
