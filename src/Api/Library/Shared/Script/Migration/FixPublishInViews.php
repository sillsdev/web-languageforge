<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixPublishInViews
{
    public function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix (Remove) Sense/Example Publish In View Settings:\n\n");

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $fixCount = 0;
        $sensePublishInUpdated = 0;
        $examplePublishInUpdated = 0;

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexProjectModel($projectId);
                $projectChanged = false;

                print("\n-------------  $project->projectName.\n");
                // Remove sense/example publish in from views
                foreach ($project->config->roleViews as $key => $view) {
                    print("\tAnalyzing config->roleView $key\n");
                    $this->RemoveFromArray("sensePublishIn", $view->fields, $projectChanged, $sensePublishInUpdated);
                    $this->RemoveFromArray("examplePublishIn", $view->fields, $projectChanged, $examplePublishInUpdated);
                }

                $entryFieldsArray = $project->config->entry->fields->getArrayCopy();
                if (array_key_exists("senses", $entryFieldsArray)) {
                    print("\tAnalyzing Sense Publish-In\n");
                    $this->RemoveFromArray("sensePublishIn", $entryFieldsArray["senses"]->fields, $projectChanged, $sensePublishInUpdated);
                    $this->RemoveFromArray("sensePublishIn", $entryFieldsArray["senses"]->fieldOrder, $projectChanged, $sensePublishInUpdated);

                    $senseFieldsArray = $entryFieldsArray["senses"]->fields->getArrayCopy();
                    if (array_key_exists("examples", $senseFieldsArray)) {
                        print("\tAnalyzing Example Publish-In\n");
                        $this->RemoveFromArray("examplePublishIn", $senseFieldsArray["examples"]->fields, $projectChanged, $examplePublishInUpdated);
                        $this->RemoveFromArray("examplePublishIn", $senseFieldsArray["examples"]->fieldOrder, $projectChanged, $examplePublishInUpdated);
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
            print("\n-------------  $mode mode results\n");
            print "$fixCount projects were fixed\n";
            print "$sensePublishInUpdated instances of \"Sense publish in\" removed\n";
            print "$examplePublishInUpdated instances of \"Example publish in\" removed\n";
        } else {
            print "No projects needed fixing\n";
        }
    }

    /**
     * RemoveFromArray
     *
     * Remove a specific element from the fields array if it exists.
     * The fields array is replaced at the end of this function
     *
     * @param string $keyToRemove - key of the element to remove
     * @param ArrayOf &$fields - field array in config
     * @param bool &$projectChanged - flag indicating the project has a change
     * @param int &$fieldsUpdated - counter of the number of fields updated
     */
    private function RemoveFromArray($keyToRemove, &$fields, &$projectChanged, &$fieldsUpdated) {
        $fieldArray = $fields->getArrayCopy();

        if (array_key_exists($keyToRemove, $fieldArray)) {
            unset($fieldArray[$keyToRemove]);
            print("\t\tRemoving $keyToRemove\n");
            $projectChanged = true;
            $fieldsUpdated++;
            $fields->exchangeArray($fieldArray);
        }
    }
}

$obj = new FixPublishInViews();
$obj->run('run');