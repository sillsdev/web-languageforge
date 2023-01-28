<?php

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;

class Analytics
{
    public static $columnNames = [
        "AddEntry" => ActivityModel::ADD_ENTRY,
        "UpdateEntry" => ActivityModel::UPDATE_ENTRY,
        "DeleteEntry" => ActivityModel::DELETE_ENTRY,
        "AddComment" => ActivityModel::ADD_LEX_COMMENT,
        "UpdateComment" => ActivityModel::UPDATE_LEX_COMMENT,
        "DeleteComment" => ActivityModel::DELETE_LEX_COMMENT,
        "AddReply" => ActivityModel::ADD_LEX_REPLY,
        "UpdateReply" => ActivityModel::UPDATE_LEX_REPLY,
        "DeleteReply" => ActivityModel::DELETE_LEX_REPLY,
        "AddUserToProject" => ActivityModel::ADD_USER_TO_PROJECT,
    ];

    /**
     * @return array of objects representing the row
     */
    private static function ActivityTypesByDay(array $allProjectModels, array $dates)
    {
        $rows = [];
        $columnNamesFlipped = \array_flip(self::$columnNames);

        // initialize rows array indexed by date with 0 for each column
        foreach ($dates as $date) {
            $rows[$date] =
                [
                    "Date" => $date,
                ] +
                \array_map(function () {
                    return 0;
                }, self::$columnNames);
        }

        foreach ($allProjectModels as $projectModel) {
            $activityListModel = new ActivityListModel($projectModel);
            $activityListModel->read();
            foreach ($activityListModel->entries as $event) {
                $eventDate = $event["date"]->toDateTime()->format("Y-m-d");
                if (\array_key_exists($eventDate, $rows) && \array_key_exists($event["action"], $columnNamesFlipped)) {
                    $rows[$eventDate][$columnNamesFlipped[$event["action"]]]++;
                }
            }
        }
        return $rows;
    }

    /**
     * return a row representing a project
     * @return array
     */
    private static function MonthlyActivityByProjectWithEventType(array $months, string $id, string $eventType = "all")
    {
        $projectModel = new ProjectModel($id);
        $activityListModel = new ActivityListModel($projectModel);
        $activityListModel->read();

        // initialize row array with project name and each month
        $row = ["ProjectName" => "", "ProjectCode" => ""];
        foreach ($months as $month) {
            $row[$month] = 0;
        }
        foreach ($activityListModel->entries as $event) {
            $eventMonth = $event["date"]->toDateTime()->format("Y-m");
            if (\array_key_exists($eventMonth, $row)) {
                if ($eventType != "all" && $event["action"] == self::$columnNames[$eventType]) {
                    $row[$eventMonth]++;
                } else {
                    $row[$eventMonth]++;
                }
            }
        }
        return $row;
    }

    private static function MonthlyActivityByProject(array $months, string $id)
    {
        return self::MonthlyActivityByProjectWithEventType($months, $id, "all");
    }

    private static function MonthlyEntriesByProject(array $months, string $id)
    {
        return self::MonthlyActivityByProjectWithEventType($months, $id, "AddEntry");
    }

    private static function InsightsByProject($id)
    {
        $appName = LfProjectModel::LEXICON_APP;
        $project = new LexProjectModel($id);

        $row = [];

        // basic attributes
        $row["projectName"] = $project->projectName;
        $row["projectCode"] = $project->projectCode;
        $row["interfaceLanguageCode"] = $project->interfaceLanguageCode;
        $row["isArchived"] = $project->isArchived;
        $row["dateModified"] = $project->dateModified->asDateTimeInterface()->format(\DateTime::ISO8601);
        $row["dateCreated"] = $project->dateCreated->asDateTimeInterface()->format(\DateTime::ISO8601);
        $row["url"] = "/app/{$project->appName}/$project->id/";

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
        $row["ownerUserName"] = $owner["username"];
        $row["ownerEmail"] = $owner["email"];
        $row["ownerName"] = $owner["name"];
        $row["ownerRole"] = $owner["role"];

        // user data
        $row["userCount"] = count($project->users);
        $row["managers"] = 0;
        $row["contributors"] = 0;
        $row["techSupport"] = 0;
        $row["noRole"] = 0;
        // last two roles are LF-specific and will only be added to DTO for LF projects
        $commenters = 0;
        $observers = 0;
        foreach ($project->users as $user) {
            // LF projects have LF-specific roles, but SF projects do not, so LF roles are a superset of SF roles
            $role = $user->role;
            if ($role === ProjectRoles::MANAGER) {
                $row["managers"]++;
            } elseif ($role === ProjectRoles::CONTRIBUTOR) {
                $row["contributors"]++;
            } elseif ($role === ProjectRoles::TECH_SUPPORT) {
                $row["techSupport"]++;
            } elseif ($role === ProjectRoles::NONE) {
                $row["noRole"]++;
            } elseif ($role === LexRoles::OBSERVER) {
                $observers++;
            } elseif ($role === LexRoles::OBSERVER_WITH_COMMENT) {
                $commenters++;
            }
        }

        // activity data
        $projectActivity = new ActivityListModel($project);
        $projectActivity->read();
        $row["activityCount"] = $projectActivity->count;

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
        $row["activeUsers"] = 0;
        foreach ($users as $actvityCount) {
            if ($actvityCount >= 2) {
                $row["activeUsers"]++;
            }
        }
        $row["recentUsers"] = count($recentUsers);
        $row["lastActivityDate"] = $lastActivityDate ? $lastActivityDate->format(\DateTime::ISO8601) : null;

        $row["lastEntryModifiedDate"] = $project->lastEntryModifiedDate
            ->asDateTimeInterface()
            ->format(\DateTime::ISO8601);
        $row["commenters"] = $commenters;
        $row["observers"] = $observers;
        $row["languageCode"] = $project->languageCode;

        $entryList = new LexEntryList($project);
        $entryList->readCounts();
        $row["entries"] = $entryList->count;

        $entriesWithPictures = new LexEntryList($project, [
            "senses.pictures" => ['$exists' => true, '$not' => ['$size' => 0]],
        ]);
        $entriesWithPictures->readCounts();
        $row["pictures"] = $entriesWithPictures->count;

        $commentList = new LexCommentList($project);
        $commentList->readCounts();
        $row["comments"] = $commentList->count;

        $row["lastSyncedDate"] = $project->lastSyncedDate
            ? $project->lastSyncedDate->asDateTimeInterface()->format(\DateTime::ISO8601)
            : null;
        $row["inputSystems"] = count($project->inputSystems);

        return $row;
    }

    /**
     * A PHP function that takes a start and end date
     * @author ChatGPT
     * @return array of dates in the format YYYY-MM-DD
     */
    private static function getDatesBetween(string $start, string $end)
    {
        $dates = [];
        $current = strtotime($start);
        $end = strtotime($end);
        while ($current <= $end) {
            $dates[] = date("Y-m-d", $current);
            $current = strtotime("+1 day", $current);
        }
        return $dates;
    }

    /** A PHP function that takes a start and end date
     * @author ChatPGT
     * @param string start - starting month in format YYYY-MM
     * @param string end - ending month in format YYYY-MM
     * @return array of months in the format YYYY-MM
     */
    private static function getMonthsBetweenDates(string $start, string $end)
    {
        $start = new \DateTime($start . "-01");
        $end = new \DateTime($end . "-01");
        $end = $end->modify("last day of this month");
        $interval = new \DateInterval("P1M");
        $period = new \DatePeriod($start, $interval, $end);
        $months = [];
        foreach ($period as $month) {
            $months[] = $month->format("Y-m");
        }
        return $months;
    }

    public static function csvDataToFolder($folderName)
    {
        \mkdir($folderName);
        $types = ["InsightsByProject", "ActivityTypesByDay", "MonthlyActivityByProject", "MonthlyEntriesByProject"];
        print "\nReports are written to the $folderName directory.\n";
        foreach ($types as $type) {
            $filePointer = fopen("$folderName/$type.csv", "w");
            self::writeDataToCsvFilePointer($filePointer, $type);
            fclose($filePointer);
        }
        print "\n\n";
    }

    private static function writeDataToCsvFilePointer($filePointer, $type)
    {
        $rows = [];
        $projectListModel = new ProjectListModel();
        $projectListModel->read();
        if ($type == "ActivityTypesByDay") {
            $startOfCovid19 = "2020-01-01";
            $today = date("Y-m-d");
            $allProjectModels = \array_map(function ($project) {
                return new ProjectModel($project["id"]);
            }, $projectListModel->entries);

            $dates = self::getDatesBetween($startOfCovid19, $today);
            $rows = self::ActivityTypesByDay($allProjectModels, $dates);
        } elseif (strstr($type, "Monthly")) {
            $months = self::getMonthsBetweenDates("2020-01", date("Y-m"));
            $rows = \array_map(function ($project) use ($months, $type) {
                return self::$type($months, $project["id"]);
            }, $projectListModel->entries);
        } else {
            $rows = \array_map(function ($project) use ($type) {
                return self::$type($project["id"]);
            }, $projectListModel->entries);
        }

        // convert camelCase keys to sentence case for table headings
        $headings = \array_map(function ($key) {
            return ucfirst(strtolower(join(" ", preg_split("/(?=[A-Z])/", $key))));
        }, \array_keys(reset($rows)));

        // in order to get automatic escaping of CSV we have to write to a "file"
        fputcsv($filePointer, $headings);
        foreach ($rows as $row) {
            fputcsv($filePointer, array_values($row));
        }
        print "$type.csv report has " . count($rows) . " rows and " . count($headings) . " columns.\n";
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
        parent::__construct(new MongoMapper($project->databaseName(), "activity"), [], ["userRef", "date", "action"]);
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
