<?php

namespace Api\Model\Languageforge\Lexicon\Dto;
use Api\Model\Shared\Mapper\MongoQueries;
use Api\Model\Shared\Mapper\MongoStore;

class LexStatsDto
{
    /**
     * @param ProjectModel $project
     * @throws \Exception
     * @return array
     */
    public static function encode($project)
    {
        $db = MongoStore::connect($project->databaseName());
        $num_entries = MongoQueries::countEntries($db, "lexicon");
        $num_entries_with_pictures = MongoQueries::countEntriesWithPictures($db, "lexicon");
        $num_unresolved_comments = MongoQueries::countUnresolvedComments($db, "lexiconComments");
        return [
            "num_entries" => $num_entries,
            "num_entries_with_pictures" => $num_entries_with_pictures,
            "num_unresolved_comments" => $num_unresolved_comments,
        ];
    }
}
