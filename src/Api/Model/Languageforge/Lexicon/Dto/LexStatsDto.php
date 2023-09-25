<?php

namespace Api\Model\Languageforge\Lexicon\Dto;
use Api\Model\Shared\Mapper\MongoQueries;

class LexStatsDto
{
    /**
     * @param ProjectModel $project
     * @throws \Exception
     * @return array
     */
    public static function encode($project)
    {
        $dbName = $project->databaseName();
        $num_entries = MongoQueries::countEntries($dbName, "lexicon");
        $num_entries_with_pictures = MongoQueries::countEntriesWithPictures($dbName, "lexicon");
        $num_unresolved_comments = MongoQueries::countUnresolvedComments($dbName, "lexiconComments");
        return [
            "num_entries" => $num_entries,
            "num_entries_with_pictures" => $num_entries_with_pictures,
            "num_unresolved_comments" => $num_unresolved_comments,
        ];
    }
}
