<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Languageforge\Lexicon\Config\LexiconOptionListItem;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;

class LexOptionListModel extends \Api\Model\Mapper\MapperModel
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
     * @var ArrayOf<LexiconOptionListItem>
     */
    public $items;

    /**
     *
     * @var string
     */
    public $defaultItemKey;

    /**
     * @var bool
     */
    public $canDelete;

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'optionlists');
        }

        return $instance;
    }

    /**
     * @param \Api\Model\ProjectModel $projectModel
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
