<?php
namespace models\shared;

use libraries\shared\palaso\DbScriptLogger;

use models\UserModel;

use models\mapper\MongoStore;

use models\ProjectModel;

class DbIntegrityHelper extends DbScriptLogger {
    
    public $projectsChecked;
    public $projectsFixed;
    public $usersChecked;
    public $usersFixed;

    /**
     * 
     * @param boolean $makeChanges
     */
    public function __construct($makeChanges = false) {
        ini_set('xdebug.show_exception_trace', 0);
        parent::__construct($makeChanges);
        $this->projectsChecked = 0;
        $this->projectsFixed = 0;
        $this->usersChecked = 0;
        $this->usersFixed = 0;
    }
    
    
    public function checkProject($projectId) {
        $project = new ProjectModel($projectId);
        $this->projectsChecked++;
        $this->info("Checking {$project->projectName}");

        
        if ($project->projectName == '') {
            $this->warn("$projectId has an empty projectName");
        }
        
        if ($project->projectCode == '') {
            $this->warn("{$project->projectName} has an empty projectCode.  This will certainly cause failures");
        }
        
        // check that a database exists for this project
        try {
            $databaseName = $project->databaseName();
        } catch (\Exception $e) {
            $databaseName = "";
        }
        if (!MongoStore::hasDB($databaseName)) {
            $newProjectCode = str_replace(' ', '_', strtolower($project->projectName));
            $newDatabaseName = 'sf_' . $newProjectCode;
            if (MongoStore::hasDB($newDatabaseName)) {
                $this->warn("projectCode does not correspond to an existing MongoDb but projectName does (db migration required)");
                $this->fix("Changed projectCode to $newProjectCode");
                $this->projectsFixed++;
                $project->projectCode = $newProjectCode;
            } else {
                $this->warn("{$project->projectName} has no corresponding database. (could indicate a brand new project with no data");
            }
        }
        
        if ($project->siteName == '') {
            $this->warn("{$project->projectName} has no corresponding website (will not appear on any site)");
        }

        if ($project->appName == '') {
            $this->warn("{$project->projectName} has no app associated with it");
        }
        
        if ($this->makeChanges) {
            $project->write();
        }
    }
    
    public function checkUser($userId) {
        $this->usersChecked++;
        $user = new UserModel($userId);
        
        if ($this->makeChanges) {
            $user->write();
        }
    }
    
    public function generateSummary() {
        $this->info();
        $this->info("{$this->projectsChecked} projects checked");
        if ($this->projectsFixed > 0) {
            $this->info("{$this->projectsFixed} projects fixed");
        } else {
            $this->info("No projects needed to be fixed");
        }
        $this->info("{$this->usersChecked} users checked)");
        if ($this->usersFixed > 0) {
            $this->info("{$this->usersFixed} users fixed)");
        } else {
            $this->info("No users needed to be fixed");
        }
    }
}

class DbIntegrityHelperResult {
    
    const OK = 'ok';
    const DEGRADED = 'degraded';
    
    public $shouldDelete;
    
    public $state;
}

?>