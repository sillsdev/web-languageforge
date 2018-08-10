<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;

(php_sapi_name() == 'cli') or exit('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixCommentGuid
{
    /**
     * @param string $mode
     * @throws \Exception
     */
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Migrate ContextGuid created with 'inputSystem.abbreviation' to use 'inputSystem.tag'.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $projectCount = 0;
        $fixCommentCount = 0;
        foreach ($projectList->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = ProjectModel::getById($projectId);
            if ($project->appName == LexProjectModel::LEXICON_APP) {
                $projectCount++;
                /** @var LexProjectModel $project */
                print("\n-------------  $project->projectName ($project->projectCode, $projectId).\n");
                $commentList = new LexCommentListModel($project);
                $commentList->read();
                foreach($commentList->entries as $commentEntry) { // foreach comment in the project
                    $commentId = $commentEntry['id'];
                    if(!empty($commentEntry['contextGuid'])) {
                        $comment = new LexCommentModel($project, $commentId);
                        $contextTokens = explode(' ', $comment->contextGuid);
                        $contextTokenCount = count($contextTokens);
                        if ($contextTokenCount > 0 && !empty($lastToken = $contextTokens[$contextTokenCount - 1])) {
                            $fieldTokens =  explode('.', $lastToken);
                            if (count($fieldTokens) > 2) {
                                print("\nError: more than 2 field tokens in comment contextGuid - $comment->contextGuid, commentId - $commentId\n");
                                break 2; // quit
                            }

                            if (count($fieldTokens) === 2) {
                                $fieldTag = $fieldTokens[1];
                                foreach($project->inputSystems as $tag => $inputSystem) {
                                    if ($tag == $fieldTag) {
                                        continue 2; // good tag found, next comment
                                    }
                                }

                                $fixCommentCount++;
                                foreach($project->inputSystems as $tag => $inputSystem) {
                                    if ($inputSystem->abbreviation == $fieldTag) {
                                        print("Change from $comment->contextGuid");
                                        $fieldTokens[1] = $tag;
                                        $contextTokens[$contextTokenCount - 1] = implode('.', $fieldTokens);
                                        $comment->contextGuid = implode(' ', $contextTokens);
                                        print(" to $comment->contextGuid\n");

                                        if (!$testMode) {
                                            $comment->write();
                                        }
                                        continue 2;
                                    }
                                }

                                print("\nError: $comment->contextGuid no abbreviation found for inputSystem $fieldTag, commentId - $commentId\n\n");
                            }
                        }
                    }
                }
            }
        }

        if ($projectCount > 0) {
            print("\n- $mode mode results:\n");
            print("$projectCount lexicon projects.\n");
            print("$fixCommentCount comments needed fixing.\n");
        } else {
            print("\n- No projects needed fixing\n");
        }
    }
}

$mode = 'test';
if (isset($argv[1])) {
    $mode = $argv[1];
}
print "Running in $mode mode\n";
try {
    FixCommentGuid::run($mode);
} catch (\Exception $e) {
    $message = $e->getMessage();
    print('Exception ' . $message);
}
