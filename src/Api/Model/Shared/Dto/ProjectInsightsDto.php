<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use stdClass;

class ProjectInsightsDto
{
    public static function singleProjectInsights($id)
    {
        $appName = LfProjectModel::LEXICON_APP;
        $project = new LexProjectModel($id);

        $projectData = new stdClass();

        // basic attributes
        $projectData->projectName = $project->projectName;
        $projectData->projectCode = $project->projectCode;
        $projectData->interfaceLanguageCode = $project->interfaceLanguageCode;
        $projectData->isArchived = $project->isArchived;
        $projectData->dateModified = $project->dateModified->asDateTimeInterface()->format(\DateTime::RFC2822);
        $projectData->dateCreated = $project->dateCreated->asDateTimeInterface()->format(\DateTime::RFC2822);
        $projectData->url = "/app/{$project->appName}/$project->id/";

        // owner data
        try {
            $owner = UserCommands::readUser($project->ownerRef->asString());
        } catch (\Exception $e) {
            # there appears to be a dangling owner ref in our data
            $owner = [
                "username" => "unknown",
                "email" => "unknown",
                "name" => "unknown",
                "role" => "unknown",
            ];
        }
        $projectData->ownerUserName = $owner["username"];
        $projectData->ownerEmail = $owner["email"];
        $projectData->ownerName = $owner["name"];
        $projectData->ownerRole = $owner["role"];

        // user data
        $projectData->userCount = count($project->users);
        $projectData->managers = 0;
        $projectData->contributors = 0;
        $projectData->techSupport = 0;
        $projectData->noRole = 0;
        // last two roles are LF-specific and will only be added to DTO for LF projects
        $commenters = 0;
        $observers = 0;
        foreach ($project->users as $user) {
            // LF projects have LF-specific roles, but SF projects do not, so LF roles are a superset of SF roles
            $role = $user->role;
            if ($role === ProjectRoles::MANAGER) {
                $projectData->managers++;
            } elseif ($role === ProjectRoles::CONTRIBUTOR) {
                $projectData->contributors++;
            } elseif ($role === ProjectRoles::TECH_SUPPORT) {
                $projectData->techSupport++;
            } elseif ($role === ProjectRoles::NONE) {
                $projectData->noRole++;
            } elseif ($role === LexRoles::OBSERVER) {
                $observers++;
            } elseif ($role === LexRoles::OBSERVER_WITH_COMMENT) {
                $commenters++;
            }
        }

        // activity data
        $projectActivity = new ActivityListModel($project);
        $projectActivity->read();
        $projectData->activityCount = $projectActivity->count;

        $users = [];
        $recentUsers = [];
        $lastActivityDate = null;
        foreach ($projectActivity->entries as $event) {
            if (array_key_exists("userRef", $event)) {
                $userId = (string) $event["userRef"];
                $users[$userId] = array_key_exists($userId, $users) ? $users[$userId] + 1 : 1;
                if ($event["date"]->toDateTime() > date_create()->modify("-180 days")) {
                    $recentUsers[$userId] = true;
                }
            }
            $lastActivityDate =
                $lastActivityDate === null
                    ? $event["date"]->toDateTime()
                    : max($event["date"]->toDateTime(), $lastActivityDate);
        }
        $projectData->activeUsers = 0;
        foreach ($users as $actvityCount) {
            if ($actvityCount >= 2) {
                $projectData->activeUsers++;
            }
        }
        $projectData->recentUsers = count($recentUsers);
        $projectData->lastActivityDate = $lastActivityDate ? $lastActivityDate->format(\DateTime::RFC2822) : null;

        $projectData->lastEntryModifiedDate = $project->lastEntryModifiedDate
            ->asDateTimeInterface()
            ->format(\DateTime::RFC2822);
        $projectData->commenters = $commenters;
        $projectData->observers = $observers;
        $projectData->languageCode = $project->languageCode;

        $entryList = new LexEntryList($project);
        $entryList->readCounts();
        $projectData->entries = $entryList->count;

        $entriesWithPictures = new LexEntryList($project, [
            "senses.pictures" => ['$exists' => true, '$not' => ['$size' => 0]],
        ]);
        $entriesWithPictures->readCounts();
        $projectData->pictures = $entriesWithPictures->count;

        $commentList = new LexCommentList($project);
        $commentList->readCounts();
        $projectData->comments = $commentList->count;

        $projectData->lastSyncedDate = $project->lastSyncedDate
            ? $project->lastSyncedDate->asDateTimeInterface()->format(\DateTime::RFC2822)
            : null;
        $projectData->inputSystems = count($project->inputSystems);

        return $projectData;
    }

    public static function allProjectInsights()
    {
        $appName = LfProjectModel::LEXICON_APP;

        $projectList = new ProjectListModel();
        $projectList->read();

        $insights = new stdClass();
        $insights->appName = $appName;
        $insights->projectList = [];

        foreach ($projectList->entries as $project) {
            if ($project["appName"] !== $appName) {
                continue;
            }
            $insights->projectList[] = ProjectInsightsDto::singleProjectInsights($project["id"]);
        }
        return $insights;
    }

    public static function csvInsights()
    {
        $filePointer = fopen("php://memory", "r+");
        self::writeInsightsToCsvFilePointer($filePointer);
        rewind($filePointer);
        $csv = stream_get_contents($filePointer);
        fclose($filePointer);
        return $csv;
    }

    public static function csvInsightsToFile($filename)
    {
        $filePointer = fopen($filename, "w");
        $count = self::writeInsightsToCsvFilePointer($filePointer);
        fclose($filePointer);
        print "Wrote $count insights to CSV file $filename\n";
    }

    private static function writeInsightsToCsvFilePointer($filePointer)
    {
        $insights = ProjectInsightsDto::allProjectInsights();

        // convert camelCase properties to sentence case for table headings
        $properties = array_key_exists(0, $insights->projectList)
            ? array_keys(get_object_vars($insights->projectList[0]))
            : [];
        $headings = [];
        foreach ($properties as $property) {
            $headings[] = ucfirst(strtolower(join(" ", preg_split("/(?=[A-Z])/", $property))));
        }

        // in order to get automatic escaping of CSV we have to write to a "file"
        fputcsv($filePointer, $headings);
        foreach ($insights->projectList as $row) {
            fputcsv($filePointer, array_values((array) $row));
        }
        return count($insights->projectList);
    }
}

/**
 * ActivityListModel was created because using ActivityListDto::getActivityForProject was too slow.
 * With 9 projects it cut the overall time from c. 2000ms to c. 160ms, though the time for handling activity data was
 * cut from c. 1850ms to 10-20ms.
 */
class ActivityListModel extends MapperListModel
{
    public function __construct($project)
    {
        parent::__construct(new MongoMapper($project->databaseName(), "activity"), [], ["userRef", "date"]);
    }
}

class LexEntryList extends MapperListModel
{
    public function __construct($project, $query = [])
    {
        parent::__construct(new MongoMapper($project->databaseName(), "lexicon"), ["isDeleted" => false] + $query);
    }
}

class LexCommentList extends MapperListModel
{
    public function __construct($project)
    {
        parent::__construct(new MongoMapper($project->databaseName(), "lexiconComments"), ["isDeleted" => false]);
    }
}
