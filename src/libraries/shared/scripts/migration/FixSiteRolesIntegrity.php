<?php

namespace libraries\shared\scripts\migration;

use libraries\shared\Website;

use models\shared\rights\SiteRoles;

use models\ProjectListModel;
use models\ProjectModel;
use models\UserModel;
use models\UserListModel;

class FixSiteRolesIntegrity
{
    public function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Fix site roles integrity\n\n";
        
        // loop over every project
        $projectlist = new ProjectListModel();
        $projectlist->read();
        $fixCount = array();

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            $hostname = $project->siteName;
            $website = Website::get($hostname);
            $fixCount[$hostname] = 0;
            $projectUserRefs = array_keys($project->users->getArrayCopy());
            $message .= "-------------  " . $project->projectName . "\n";
            foreach ($projectUserRefs as $userId) { // foreach user that is a member of this project
            	$user = new UserModel($userId);
            	if (!array_key_exists($hostname, $user->siteRole) && $user->username != '') {
            		$message .= "Fixed user '" . $user->username . "' who did not have a site role on " . $hostname . "\n";
            		$fixCount[$hostname]++;
            		$user->siteRole[$hostname] = $website->userDefaultSiteRole;
            		if (!$testMode) {
            			$user->write();
            		}
            	}
            }
        }
        
        // loop over users who do not belong to any projects
        $userlist = new UserListModel();
        $userlist->read();
        foreach ($userlist->entries as $userParams) { // foreach existing user
            $userId = $userParams['id'];
            $user = new UserModel($userId);
            if (count($user->projects->refs) == 0 && count(array_keys($user->siteRole->getArrayCopy())) == 0) {
                $message .= "Warning: user '" . $user->username . "' has no projects and no siteRoles on any site!\n";
            }
        }
        
        foreach ($fixCount as $site => $count) {
        	if ($count > 0) {
	            $message .= "\n\n$site : Fixed $count non-existent site roles \n\n";
	        } else {
	            $message .= "\n\n$site : Nothing to do \n\n";
	        }
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
