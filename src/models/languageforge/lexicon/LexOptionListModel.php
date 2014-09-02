<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\config\LexiconOptionListItem;
use models\mapper\ArrayOf;
use models\mapper\Id;
use models\ProjectModel;

class LexOptionListModel extends \models\mapper\MapperModel
{
    /**
     * @var Id
     */
    public $id;

    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $code;

    /**
     * @var ArrayOf
     */
    public $items;

    /**
     * @var bool
     */
    public $canDelete;

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'optionlists');
        }

        return $instance;
    }

    /**
     * @param \models\ProjectModel $projectModel
     * @param string               $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->items = new ArrayOf(function ($data) {
            return new LexiconOptionListItem();
        });
        $this->id = new Id();
        $this->canDelete = true;
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    public function readFromJson($filePath)
    {
        if (file_exists($filePath)) {
            $json = json_decode(file_get_contents($filePath), true);

            if (count($json) > 0) {
                $this->items->exchangeArray(array());
            }
            foreach ($json as $item) {
                $this->items[] = new LexiconOptionListItem($item['value'], $item['key']);
            }
        } else {
            throw new \Exception("JSON file path $filePath does not exist!");
        }
    }

}
