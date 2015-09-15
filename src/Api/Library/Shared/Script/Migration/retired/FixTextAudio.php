<?php
namespace Api\Library\Shared\Script\Migration;

use Api\Model\Scriptureforge\SfchecksProjectModel;
use Api\Model\ProjectListModel;
use Api\Model\TextListModel;
use Api\Model\TextModel;
use Api\Library\Shared\Script\Migration\models\TextModel_sf_v0_9_18;
require_once APPPATH . 'Api/Model/TextModel.php';

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
            if ($projectParams['projectName'] == 'Jamaican Psalms') {
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
                    $message .= "Removed 'audioUrl' property from project: $project->projectName\n";
                }
            }
        }
        if ($textsUpdated > 0) {
            $message .= "\n\nChanged $textsUpdated legacy texts to only store audio filename\n\n";
        } else {
            $message .= "\n\nNo legacy text audio were found/changed. $textsExamined texts examined.\n\n";
        }

        // re-arrange assets folder
        // - remove <siteName> from path for LF
        // - add <appName> to path for SF and change <projectId> in path to <projectSlug (databaseName)>
        $message .= "\n\nRe-arrange assets folder\n~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
        $project = new SfchecksProjectModel();
        $assetsFolderPath = APPPATH . "assets";
        $assetsSubfolders = glob($assetsFolderPath . '/*');
        @mkdir($assetsFolderPath . '/lexicon');
        @mkdir($assetsFolderPath . '/sfchecks');
        foreach ($assetsSubfolders as $assetsSubfolder) {
            if (file_exists($assetsSubfolder) && is_dir($assetsSubfolder)) {
                $assetsSubfolderName = basename($assetsSubfolder);
                if (strpos($assetsSubfolderName, 'languageforge') !== false) {
                    $message .= "Move into lexicon: $assetsSubfolderName\n";
                    $oldFolderPath = $assetsSubfolder . '/lexicon';
                    $newFolderPath = $assetsFolderPath . '/lexicon';
                } elseif ($assetsSubfolderName == 'lexicon' || $assetsSubfolderName == 'sfchecks') {
                    $message .= "No change: $assetsSubfolderName\n";
                    $oldFolderPath = '';
                    $newFolderPath = '';
                    $assetsSubfolder = '';
                } elseif ($project->exists($assetsSubfolderName)) {
                    $message .= "Move into sfchecks: $assetsSubfolderName\n";
                    $oldFolderPath = $assetsSubfolder;
                    $project->read($assetsSubfolderName);
                    $projectSlug = $project->databaseName();
                    $newFolderPath = $assetsFolderPath . "/sfchecks/$projectSlug";
                    if (! $testMode) {}
                } else {
                    $message .= "Delete: $assetsSubfolderName\n";
                    $oldFolderPath = '';
                    $newFolderPath = '';
                }
                if (! $testMode) {
                    if (file_exists($oldFolderPath) && is_dir($oldFolderPath)) {
                        if (! @rename($oldFolderPath, $newFolderPath)) {
                            $oldFiles = glob($oldFolderPath . '/*');
                            foreach ($oldFiles as $oldFile) {
                                $newFile = $newFolderPath . '/' . basename($oldFile);
                                rename($oldFile, $newFile);
                            }
                        }
                    }
                    if (file_exists($assetsSubfolder) && is_dir($assetsSubfolder)) {
                        $this->recursiveRemoveFolder($assetsSubfolder);
                    }
                }
            }
        }

        return $message;
    }

    protected function recursiveRemoveFolder($folder)
    {
        foreach (glob("{$folder}/*") as $file) {
            if (is_dir($file)) {
                $this->recursiveRemoveFolder($file);
            } else {
                unlink($file);
            }
        }
        rmdir($folder);
    }
}
