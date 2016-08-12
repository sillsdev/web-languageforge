<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MongoMapper;

class LexOptionListModel extends MapperModel
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
     * @var ArrayOf<LexOptionListItem>
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

    /**
     * @param string $databaseName
     * @return MongoMapper
     */
    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'optionlists');
        }

        return $instance;
    }

    /**
     * @param \Api\Model\ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->items = new ArrayOf(function () {
            return new LexOptionListItem();
        });
        $this->id = new Id();
        $this->canDelete = true;
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /**
     * @param LexProjectModel $projectModel
     * @param string $fieldName
     * @param string $jsonFilePath
     * @return bool true on success, false otherwise
     * @throws \Exception
     */
    public static function CreateFromJson($projectModel, $fieldName, $jsonFilePath)
    {
        $optionList = new LexOptionListModel($projectModel);
        $listCode = LexConfig::flexOptionlistCode($fieldName);
        if (!$optionList->readByProperty('code', $listCode)) {
            $optionList->name = LexConfig::flexOptionlistName($listCode);
            $optionList->code = $listCode;
            $optionList->canDelete = false;
            $optionList->readFromJson($jsonFilePath);
            $optionList->write();
            return true;
        }
        return false;
    }

    /**
     * @param string $filePath
     * @throws \Exception
     */
    private function readFromJson($filePath)
    {
        if (!file_exists($filePath)) {
            throw new \Exception("JSON file path $filePath does not exist!");
        }

        $json = json_decode(file_get_contents($filePath), true);
        if (count($json) <= 0) return;

        $this->items->exchangeArray(array());
        foreach ($json as $item) {
            $optionListItem = new LexOptionListItem($item['value'], $item['key']);
            if (array_key_exists('abbreviation', $item)) {
                $optionListItem->abbreviation = $item['abbreviation'];
            }
            if (array_key_exists('guid', $item)) {
                $optionListItem->guid = $item['guid'];
            }
            $this->items[] = $optionListItem;
        }
    }

}
