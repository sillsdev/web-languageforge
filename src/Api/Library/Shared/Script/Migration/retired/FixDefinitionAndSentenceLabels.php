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
class FixDefinitionAndSentenceLabels
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix Meaning->Definition and Example->Sentence labels.\n");

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $fixCount = 0;
        $definitionLabelsUpdated = 0;
        $sentenceLabelsUpdated = 0;

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexProjectModel($projectId);
                $projectChanged = false;
                $entryFieldsArray = $project->config->entry->fields->getArrayCopy();
                if (array_key_exists("senses", $entryFieldsArray)) {
                    $senseFieldsArray = $entryFieldsArray["senses"]->fields->getArrayCopy();
                    if ($senseFieldsArray["definition"]->label != "Definition") {
                        $senseFieldsArray["definition"]->label = "Definition";
                        //print "  Fixed \"Definition\" label\n";
                        $definitionLabelsUpdated++;
                        $projectChanged = true;
                    }
                    if (array_key_exists("examples", $senseFieldsArray)) {
                        $exampleFieldsArray = $senseFieldsArray["examples"]->fields->getArrayCopy();
                        if ($exampleFieldsArray["sentence"]->label != "Sentence") {
                            $exampleFieldsArray["sentence"]->label = "Sentence";
                            //print "  Fixed \"Sentence\" label\n";
                            $sentenceLabelsUpdated++;
                            $projectChanged = true;
                        }
                    }
                }
                $senseFieldsArray["examples"]->fields->exchangeArray($exampleFieldsArray);
                $entryFieldsArray["senses"]->fields->exchangeArray($senseFieldsArray);
                $project->config->entry->fields->exchangeArray($entryFieldsArray);

                if ($projectChanged) {
                    $fixCount++;
                    if (!$testMode) {
                        print "  Saving changes to project $project->projectName.\n";
                        $project->write();
                    }
                }

                unset($exampleFieldsArray);
                unset($senseFieldsArray);
                unset($entryFieldsArray);
            }
        }

        if ($fixCount > 0) {
            print "$fixCount projects were fixed\n";
            print "$definitionLabelsUpdated \"meaning\" labels changed to \"definition\"\n";
            print "$sentenceLabelsUpdated \"example\" labels changed to \"sentence\"\n";
        } else {
            print "No projects needed fixing\n";
        }
    }
}

FixDefinitionAndSentenceLabels::run('run');
