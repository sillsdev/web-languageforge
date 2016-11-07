#!/usr/bin/php -q

<?php

// Assumption MONGODB_CONN for dev site has been previously set from TeamCity
require_once('../scriptsConfig.php');

use Api\Library\Shared\Website;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

/*
 * Description: Restore live site data (mongodb, lf assets and sf assets, and lfmerge projects)
 * to local or dev site
 * Parameters:
 * @param string $argv[1]     [run or test]. Defaults to test
 * @param string $argv[2]     Optional path to .tgz files. If a path is not given, a local admin
 *                            account is created.
 *
 * Assumptions: user running the script has sudo privileges
 */
class FactoryReset
{
    public function __construct() {
        $this->DetermineEnvironment();
    }

    const DEV_LFPATH = '/var/www/languageforge.org_dev';
    const DEV_SFPATH = '/var/www/scriptureforge.org_dev';

    const LOCAL_LFPATH = '/var/www/virtual/languageforge.org';
    const LOCAL_SFPATH = '/var/www/virtual/scriptureforge.org';

    const LFMERGE_SENDRECEIVE_PATH = '/var/lib/languageforge/lexicon/sendreceive/';

    /** @var string - local or dev */
    public $environment;

    /** @var string - path to languageforge assets */
    public $lfAssetsPath;

    /** @var string - path to scriptureforge assets */
    public $sfAssetsPath;

    /** @var  string - path to lfmerge sendreceive folder */
    public $lfmergeSendReceivePath;

    /** @var  string - host option for mongo calls */
    public $hostOption;

    /**
     * Based on pwd, determine the environment of local or dev.
     * If live server detected, immediately exit
     */
    public function DetermineEnvironment() {
        if (strpos(getcwd(), 'TeamCity') !== false) {
            print "Script being run on the DEVELOPMENT SERVER khrap\n";
            $this->environment = "dev";
            $this->lfAssetsPath = $this::DEV_LFPATH;
            $this->sfAssetsPath = $this::DEV_SFPATH;
            $this->hostOption = "--host " . str_replace("mongodb://", "", MONGODB_CONN);
        } else if (strpos(getcwd(), '/var/www/') !== true) {
            print "Script being run on your LOCAL MACHINE khrap\n";
            $this->environment = "local";
            $this->lfAssetsPath = $this::LOCAL_LFPATH;
            $this->sfAssetsPath = $this::LOCAL_SFPATH;
            $this->hostOption = "";
        } else {
            exit("Cannot be run on LIVE SERVER.  EXITING\n");
        };

        print "Mongo host option: \"" . $this->hostOption . "\"\n";
        $this->lfmergeSendReceivePath = $this::LFMERGE_SENDRECEIVE_PATH;
    }

    public function Execute($runForReal, $cmd) {
        print "$cmd\n";
        if ($runForReal) {
            system($cmd);
        }
    }

    /**
     * UpdateDBSiteName: for dev or local site, migrate the mongodb sitename according to the mapping
     * @param bool $runForReal
     */
    public function UpdateDBSiteName($runForReal = false) {
        $siteNameMap = array();
        if ($this->environment == "dev") {
            print "Site names being converted for DEVELOPMENT SERVER khrap\n";
            $siteNameMap['scriptureforge.org'] = 'dev.scriptureforge.org';
            $siteNameMap['jamaicanpsalms.scriptureforge.org'] = 'jamaicanpsalms.dev.scriptureforge.org';
            $siteNameMap['languageforge.org'] = 'dev.languageforge.org';
        } else if ($this->environment == "local") {
            print "Site names being converted for LOCAL MACHINE khrap\n";
            $siteNameMap['scriptureforge.org'] = 'scriptureforge.local';
            $siteNameMap['jamaicanpsalms.scriptureforge.org'] = 'jamaicanpsalms.scriptureforge.local';
            $siteNameMap['languageforge.org'] = 'languageforge.local';
        }

        $siteNameCount = array();
        $userCount = array();
        foreach($siteNameMap as $from => $to) {
            $siteNameCount[$from] = 0;
            $userCount[$from] = 0;
        }

        // loop over every project
        $projectList = new ProjectListModel();
        $projectList->read();
        foreach ($projectList->entries as $projectParams) {
            $project = new ProjectModel($projectParams['id']);
            $siteName = $project->siteName;
            if (array_key_exists($siteName, $siteNameMap)) {
                $project->siteName = $siteNameMap[$siteName];
                $siteNameCount[$siteName]++;
                if ($runForReal) {
                    $project->write();
                }
            }
        }

        // loop over every user
        $userList = new UserListModel();
        $userList->read();
        foreach ($userList->entries as $userParams) {
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
            if ($runForReal) {
                $user->write();
            }
        }

        // report changes
        foreach($siteNameMap as $from => $to) {
            $count = $siteNameCount[$from];
            if ($count > 0) {
                print "$count $from projects changed site to $to\n";
            } else {
                print "No $from projects encountered\n";
            }

            $count = $userCount[$from];
            if ($count > 0) {
                print "$count $from users changed site to $to\n";
            } else {
                print "No $from users encountered\n";
            }
        }
    }

    public function Run($argv)
    {
        $runForReal = false;
        if (count($argv) > 1 && $argv[1] == 'run') {
            $runForReal = true;
        } else {
            print "\nUsage: FactoryReset.php <run> <DIRECTORY>\n";
            print "Run factory reset and restore mongodb and assets from DIRECTORY\n";
            print "\nTest Mode - no data will be changed\n--------------------------------\n\n";
        }
        $archivePath = (count($argv) > 2 ? $argv[2] : "");

        $projectList = new ProjectListModel();
        $projectList->read();

        // remove all existing projects
        print "\n{$projectList->count} projects will be deleted\n";

        foreach ($projectList->entries as $p) {
            $project = new ProjectModel($p['id']);
            print "Deleting Project " . $project->projectName . "\n";
            if ($runForReal) {
                try {
                    $project->remove();
                } catch (\Exception $e) {
                    // don't do anything
                }
            }
        }

        // start with a fresh database
        print "\nDropping main database...\n";
        if ($runForReal) {
            MongoStore::dropAllCollections(SF_DATABASE);
        }

        print "\nDropping other dbs on the server (like test dbs)\n";
        $cmd = "mongo --quiet $this->hostOption --eval 'db.getMongo().getDBNames().forEach(function(i){  " .
            "if (i.indexOf(\"sf_\") == 0 || i.indexOf(\"scriptureforge\") == 0) { " .
            "print(\"Dropping \" + i); db.getSiblingDB(i).dropDatabase()}})'";
        $this->Execute($runForReal, $cmd);

        if (is_dir($archivePath)) {
            print "\nExtracting archives...\n";
            foreach (glob("$archivePath/*.tgz") as $filename) {
                print "Extracting $filename\n";
                $cmd = "tar -xzf $filename -C $archivePath";
                $this->Execute($runForReal, $cmd);
            }

            print "\nEnsure www-data has permissions...\n";
            $cmd = "sudo chgrp -R www-data $archivePath/var/www";
            $this->Execute($runForReal, $cmd);
            $cmd = "sudo chown -R www-data:fieldworks $archivePath/var/lib";
            $this->Execute($runForReal, $cmd);

            print "\nRestoring mongodb...\n";
            $mongodbBackup = $archivePath . "/mongo_backup";
            $cmd = "mongorestore $this->hostOption $mongodbBackup";
            $this->Execute($runForReal, $cmd);

            print "\nUpdating DB site names...\n";
            $this->UpdateDBSiteName($runForReal);

            print "\nRestoring assets...\n";
            $cmd = "rsync -rzlt --chmod=Dug=rwx,Fug=rw,o-rwx --group " .
                "--delete-during --stats --rsync-path='sudo rsync' " .
                "--exclude=sfchecks " .
                "$archivePath/var/www/languageforge.org/htdocs/assets/ " .
                "$this->lfAssetsPath/htdocs/assets/";
            $this->Execute($runForReal, $cmd);

            $cmd = "rsync -rzlt --chmod=Dug=rwx,Fug=rw,o-rwx --group " .
                "--delete-during --stats --rsync-path='sudo rsync' " .
                "--exclude=lexicon --exclude=semdomtrans " .
                "$archivePath/var/www/scriptureforge.org/htdocs/assets/ " .
                "$this->sfAssetsPath/htdocs/assets/";
            $this->Execute($runForReal, $cmd);

            $cmd = "sudo rm -R $this->lfmergeSendReceivePath/state/*";
            $this->Execute($runForReal, $cmd);
            $cmd = "sudo rm -R $this->lfmergeSendReceivePath/webwork/*";
            $this->Execute($runForReal, $cmd);
            $cmd = "rsync -rzlt --chmod=Dug=rwx,Fug=rw,o-rwx --group " .
                "--delete-during --stats --rsync-path='sudo rsync' " .
                "$archivePath$this->lfmergeSendReceivePath $this->lfmergeSendReceivePath";
            $this->Execute($runForReal, $cmd);

            print "\nCleanup extracted files...\n";
            $cmd = "sudo rm -R $archivePath/var";
            $this->Execute($runForReal, $cmd);
            $cmd = "sudo rm -R $archivePath/mongo_backup";
            $this->Execute($runForReal, $cmd);
        } else {
            print "\nCreating local user: admin password: password\n";
            if ($runForReal) {
                $scriptureforgeWebsite = Website::get('scriptureforge.org');
                $languageforgeWebsite = Website::get('languageforge.org');
                $adminUser = UserCommands::createUser(array(
                    'id' => '',
                    'name' => 'Admin',
                    'email' => 'admin@admin.com',
                    'username' => 'admin',
                    'password' => 'password',
                    'active' => true,
                    'role' => SystemRoles::SYSTEM_ADMIN),
                    $languageforgeWebsite
                );
            }
        }
    }
}

$obj = new FactoryReset();
$obj->Run($argv);