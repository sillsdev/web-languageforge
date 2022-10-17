<?php

namespace Api\Model\Shared;

use Api\Library\Shared\Website;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoEncoder;
use Api\Model\Shared\Mapper\MongoMapper;

class UserTypeaheadModel extends MapperListModel
{
    /**
     * @param string $term
     * @param string | array $projectIdOrIds
     * @param Website $website
     * @param bool $include
     */
    public function __construct($term, $projectIdOrIds = "", $website, $include = false)
    {
        $query = [
            '$or' => [
                ["name" => ['$regex' => $term, '$options' => "-i"]],
                ["username" => ['$regex' => $term, '$options' => "-i"]],
                ["email" => strtolower($term)],
            ],
        ];
        if (!empty($projectIdOrIds)) {
            // Allow $projectIdOrIds to be either an array or a single ID
            if (is_array($projectIdOrIds)) {
                $idsForQuery = $projectIdOrIds;
            } else {
                $idsForQuery = [$projectIdOrIds];
            }
            // If passed string IDs, convert to MongoID objects
            $idsForQuery = array_map(function ($id) {
                if (is_string($id)) {
                    return MongoMapper::mongoID($id);
                } else {
                    return $id;
                }
            }, $idsForQuery);
            $inOrNotIn = $include ? '$in' : '$nin';
            $query["projects"] = [$inOrNotIn => $idsForQuery];
            //error_log("Query: " . print_r($query, true));
        }
        // Filter for only users on the current site
        $encodedDomain = $website->domain;
        MongoEncoder::encodeDollarDot($encodedDomain);
        $query["siteRole." . $encodedDomain] = ['$exists' => true];
        parent::__construct(UserModelMongoMapper::instance(), $query, ["username", "name", "avatarRef"]);
        // If we were called with a project filter that excluded certain users, also
        // return a list of specifically which users were excluded. Which happens to
        // be another typeahead search with the same query term, but *including* only
        // the ones matching this project.
        if ($projectIdOrIds && !$include) {
            $this->excludedUsers = new UserTypeaheadModel($term, $projectIdOrIds, $website, true);
            $this->excludedUsers->read();
        }
        //echo("Result: " . print_r($this, true));
    }

    /** @var UserTypeaheadModel */
    public $excludedUsers;
}
