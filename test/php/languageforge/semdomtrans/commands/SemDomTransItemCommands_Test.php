<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\semdomtrans\co
use models\languageforge\SemDomTransProjectModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexCommentCommands extends UnitTestCase
{

    public function __construct() {
        $this->save = array();
        parent::__construct();
    }

    /**
     * Data storage between tests
     *
     * @var array <unknown>
     */
    private $save;

    public function testSemDomItems_UpdateSemDomItem_EmptyItemAdded()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $semdomprojectmodel = new SemDomTransProjectModel($project->id->asString());
        $semdomprojectmodel->write();
        $userId = $e->createUser('joe', 'joe', 'joe');

        
        $sem = new LexCommentListModel($project);
        $commentList->read();
        $this->assertEqual($commentList->count, 0);

        I ::updateComment($project->id->asString(), $userId, $e->website, $data);

        $commentList->read();
        $this->assertEqual($commentList->count, 1);
        $commentArray = $commentList->entries[0];
        $this->assertEqual($commentArray['content'], $commentContent);
        $this->assertEqual($commentArray['regarding'], $regarding);
        $this->assertEqual($commentArray['score'], 0);
        $this->assertEqual($commentArray['status'], 'open');
    }
}
