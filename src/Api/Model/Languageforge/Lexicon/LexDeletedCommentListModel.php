<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\ProjectModel;

class LexDeletedCommentListModel extends \Api\Model\Mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'lexiconComments');
        }

        return $instance;
    }

    /**
     *
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        $lexProject = new LexiconProjectModel($projectModel->id->asString());

        if (!is_null($newerThanTimestamp)) {
            $startDate = new \MongoDate($newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => true, 'dateModified'=> array('$gte' => $startDate)), array());
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => true), array());
        }
    }
}
