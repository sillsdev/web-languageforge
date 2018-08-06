<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;


(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

/**
 * Migration script to change configuration labels:
 * from "meaning" to "definition" and
 * from "example" to "sentence"
 * @package Api\Library\Shared\Script\Migration
 */
class FixSenseAndExampleLabels
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Assign labels to \"senses\" and \"examples\" fields.\n");

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $fixCount = 0;
        $meaningLabelsUpdated = 0;
        $exampleLabelsUpdated = 0;

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexProjectModel($projectId);
                $projectChanged = false;
                $entryFieldsArray = $project->config->entry->fields->getArrayCopy();
                if (array_key_exists("senses", $entryFieldsArray)) {
                    $senseFieldsArray = $entryFieldsArray["senses"]->fields->getArrayCopy();
                    if ($entryFieldsArray["senses"]->label != "Meaning") {
                        $entryFieldsArray["senses"]->label = "Meaning";
                        //print "  Fixed \"Meaning\" label\n";
                        $meaningLabelsUpdated++;
                        $projectChanged = true;
                    }
                    if (array_key_exists("examples", $senseFieldsArray)) {
                        if ($senseFieldsArray["examples"]->label != "Example") {
                            $senseFieldsArray["examples"]->label = "Example";
                            //print "  Fixed \"Example\" label\n";
                            $exampleLabelsUpdated++;
                            $projectChanged = true;
                        }
                    }
                }
                $entryFieldsArray["senses"]->fields->exchangeArray($senseFieldsArray);
                $project->config->entry->fields->exchangeArray($entryFieldsArray);

                if ($projectChanged) {
                    $fixCount++;
                    if (!$testMode) {
                        print "  Saving changes to project $project->projectName.\n";
                        $project->write();
                    }
                }

                unset($senseFieldsArray);
                unset($entryFieldsArray);
            }
        }

        if ($fixCount > 0) {
            print "$fixCount projects were fixed\n";
            print "$meaningLabelsUpdated \"Meaning\" labels assigned to \"senses\" fields\n";
            print "$exampleLabelsUpdated \"Example\" labels assigned to \"examples\" fields\n";
        } else {
            print "No projects needed fixing\n";
        }
    }
}

$mode = 'test';
if (isset($argv[1])) {
    $mode = $argv[1];
}
print "Running in $mode mode\n";
FixSenseAndExampleLabels::run($mode);
