<?php

require_once('../../scriptsConfig.php');

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

class RunAllMigrationScripts {

    public static function run() {
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\FixAvatarRefs::run('run'));
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\FixEnvironmentReversalEntriesFieldOrder::run('run'));
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\FixLexViewSettings::run('run'));
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\FixProjectSiteNameIntegrity::run('run'));
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\FixSiteRolesIntegrity::run('run'));
        fwrite(STDOUT, \Api\Library\Shared\Script\Migration\ImportEnglishSemDomProject::run('run'));
        //fwrite(STDOUT, \Api\Library\Shared\Script\Migration\ImportOtherLanguageSemDomProjects::run('run'));

        $migrationFinished = false;
        $output = '';
        while (!$migrationFinished) {
            $output .= \Api\Library\Shared\Script\Migration\FixSemanticDomainKey::run('run');
            if (strstr($output, "All projects have now been processed")) {
               $migrationFinished = true;
            }
        }
        fwrite(STDOUT, $output);
    }
}

RunAllMigrationScripts::run();