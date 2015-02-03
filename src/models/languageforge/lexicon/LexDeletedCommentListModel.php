<?php
namespace models\languageforge\lexicon;

use models\ProjectModel;

class LexDeletedCommentListModel extends \models\mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'lexiconComments');
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
