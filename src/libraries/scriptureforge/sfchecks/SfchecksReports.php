<?php

namespace libraries\scriptureforge\sfchecks;


use models\ProjectModel;
use models\QuestionAnswersListModel;
use models\shared\rights\ProjectRoles;
use models\TextListModel;
use models\UserList_ProjectModel;
use models\UserModel;

class SfchecksReports {

    public static function UserEngagementReport($projectId) {
        $project = ProjectModel::getById($projectId);
        $output = str_pad('**** User Engagement Report ****', 120, " ", STR_PAD_BOTH) . "\n";
        $output .= str_pad(date(DATE_RFC2822), 120, " ", STR_PAD_BOTH) . "\n\n";
        $data = array();
        $activeUsers = array();
        $managerUsers = array();
        $inactiveUsers = array();
        $invalidUsers = array();


        $listModel = new UserList_ProjectModel($projectId);
        $listModel->read();
        if ($listModel->count > 0) {
            $textListModel = new TextListModel($project);
            $textListModel->read();
            $questions = array();
            foreach($textListModel->entries as $text) {
                $questionListModel = new QuestionAnswersListModel($project, $text['id']);
                $questionListModel->read();
                $questions = array_merge($questions, $questionListModel->entries);
            }

            $answerCtr = 0;
            $commentCtr = 0;

            foreach($listModel->entries as $user) {
                $userModel = new UserModel($user['id']);
                $user['isActive'] = $userModel->active;
                $user['questions'] = 0;
                $user['answers'] = 0;
                $user['comments'] = 0;
                $user['responses'] = 0;
                if (!$user['isActive']) {
                    array_push($invalidUsers, $user);
                    continue;
                }
                if ($project->users->offsetExists($user['id'])) {
                    $user['role'] = $project->users[$user['id']]->role;
                } else {
                    $user['role'] = ProjectRoles::NONE;
                }
                $answerCtr = 0;
                $commentCtr = 0;
                foreach($questions as $question) {
                    $responses = 0;
                    foreach($question['answers'] as $answer) {
                        $answerCtr++;
                        foreach($answer['comments'] as $comment) {
                            $commentCtr++;
                            if ($comment['userRef'] && $comment['userRef']->{'$id'} == $user['id']) {
                                $user['comments']++;
                                $user['responses']++;
                                $responses++;
                            }
                        }
                        if ($answer['userRef'] && $answer['userRef']->{'$id'} == $user['id']) {
                            $user['answers']++;
                            $user['responses']++;
                            $responses++;
                        }
                    }
                    if ($responses > 0) {
                        $user['questions']++;
                    }
                }
                if ($user['role'] == ProjectRoles::MANAGER) {
                    array_push($managerUsers, $user);
                }
                elseif ($user['responses'] > 0) {
                    array_push($activeUsers, $user);
                } else {
                    array_push($inactiveUsers, $user);
                }
            }

            $output .= $project->projectName . " Project\n";
            $output .= "Texts in Project: " . $textListModel->count . "\n";
            $output .= "Questions (Q's) in Project: " . count($questions) . "\n";
            $output .= "Responses (R's) in Project (Answers + Comments): " . ($answerCtr + $commentCtr) . "\n";
            $output .= "Answers (A's) in Project: " . $answerCtr . "\n";
            $output .= "Comments (C's) in Project: " . $commentCtr . "\n";
        } else {
            $output .= "This project has no users\n\n";
        }

        $sortByResponses = function($a, $b) {
            if ($a['responses'] > $b['responses']) {
                return -1;
            } elseif ($a['responses'] < $b['responses']) {
                return 1;
            } else {
                if ($a['answers'] > $b['answers']) {
                    return -1;
                } elseif ($a['answers'] < $b['answers']) {
                    return 1;
                } else {
                    if ($a['comments'] > $b['comments']) {
                        return -1;
                    } elseif ($a['comments'] < $b['comments']) {
                        return 1;
                    } else {
                        return strcmp($a['username'], $b['username']);
                    }
                }
            }
        };

        $sortByName = function($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        };

        usort($activeUsers, $sortByResponses);
        usort($managerUsers, $sortByResponses);
        usort($inactiveUsers, $sortByName);
        usort($invalidUsers, $sortByName);

        $output .= "\n\nManagers: " . count($managerUsers) . "\n" . str_pad("Name", 30) . str_pad("Email", 35) . str_pad("Username", 25) .
            str_pad("R's", 5) . str_pad("A's", 5) . str_pad("C's", 5) . str_pad("Q's", 5) . "\n\n";
        foreach($managerUsers as $user) {
            $output .= str_pad($user['name'], 30) . str_pad($user['email'], 35) . str_pad($user['username'], 25) .
                str_pad($user['responses'], 5) . str_pad($user['answers'], 5) . str_pad($user['comments'], 5) . str_pad($user['questions'], 5) . "\n";
        }

        $output .= "\n\nActive Users: " . count($activeUsers) . "\n" . str_pad("Name", 30) . str_pad("Email", 35) . str_pad("Username", 25) .
            str_pad("R's", 5) . str_pad("A's", 5) . str_pad("C's", 5) . str_pad("Q's", 5) . "\n\n";
        foreach($activeUsers as $user) {
            $output .= str_pad($user['name'], 30) . str_pad($user['email'], 35) . str_pad($user['username'], 25) .
                str_pad($user['responses'], 5) . str_pad($user['answers'], 5) . str_pad($user['comments'], 5) . str_pad($user['questions'], 5) . "\n";
        }

        $output .= "\n\nInactive Users (never engaged): " . count($inactiveUsers) . "\n" . str_pad("Name", 30) . str_pad("Email", 35) . str_pad("Username", 25) . "\n\n";
        foreach($inactiveUsers as $user) {
            $output .= str_pad($user['name'], 30) . str_pad($user['email'], 35) . str_pad($user['username'], 25) . "\n";
        }

        $output .= "\n\nInvited Users (but never validated or logged in): " . count($invalidUsers) . "\n" . str_pad("Name", 30) . str_pad("Email", 35) . str_pad("Username", 25) . "\n\n";
        foreach($invalidUsers as $user) {
            $output .= str_pad($user['name'], 30) . str_pad($user['email'], 35) . str_pad($user['username'], 25) . "\n";
        }

        $data['output'] = $output;
        $data['result'] = array('managerUsers' => $managerUsers, 'activeUsers' => $activeUsers, 'inactiveUsers' => $inactiveUsers, 'invitedUsers' => $invalidUsers);
        return $data;
    }



}