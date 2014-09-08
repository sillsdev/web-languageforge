<?php
namespace libraries\shared\scripts\migration;

use models\scriptureforge\SfchecksProjectModel;
use models\ProjectListModel;
use models\TextListModel;
use models\TextModel;
use libraries\shared\scripts\migration\models\TextModel_sf_v0_9_18;

require_once APPPATH . 'models/TextModel.php';

class FixTextAudio
{

    public function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "";

        $projectlist = new ProjectListModel();
        $projectlist->read();

        $textsExamined = 0;
        $textsUpdated = 0;

        // foreach existing project
        foreach ($projectlist->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new SfchecksProjectModel($projectId);
            $textlist = new TextListModel($project);
            $textlist->read();

            // foreach text in project
            foreach ($textlist->entries as $textParams) {
                $textsExamined++;
                $textId = $textParams['id'];
                $legacyText = new TextModel_sf_v0_9_18($project, $textId);
                $fileName = '';
                if ($legacyText->audioUrl) {
                    $text = new TextModel($project, $textId);
                    if (! $testMode) {
                        if (! $text->audioFileName) {

                            // legacy audioUrl format "assets/<projectId>/<textId>_<fileName>"
                            $fileNamePrefix = $textId . '_';
                            $pos = strpos($legacyText->audioUrl, $fileNamePrefix);
                            $text->audioFileName = substr($legacyText->audioUrl, $pos + strlen($fileNamePrefix));
                        }
                        $text->write();
                    }
                    $message .= "Changed text: $text->title\n";
                    $textsUpdated++;
                }
            }
            if (! $testMode) {
                TextModel_sf_v0_9_18::removeAudioProperty($project->databaseName());
                $message .= "Removed 'audioUrl' property from project: $project->projectName\n\n";
            }
        }
        if ($textsUpdated > 0) {
            $message .= "\n\nChanged $textsUpdated legacy texts to only store audio filename\n\n";
        } else {
            $message .= "\n\nNo legacy text audio were found/changed. $textsExamined texts examined.\n\n";
        }

        return $message;
    }
}
