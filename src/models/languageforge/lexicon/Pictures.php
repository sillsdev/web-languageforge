<?php
namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

function _createPicture($data)
{
    return new Picture();
}

class Pictures extends ArrayOf
{
    public function __construct()
    {
        parent::__construct('\models\languageforge\lexicon\_createPicture');
    }

}

class Picture
{
    public function __construct($fileName = '')
    {
        $this->fileName = $fileName;
        $this->caption = new MultiText();
    }

    /**
     * @var string
     */
    public $fileName;

    /**
     * @var MultiText
     */
    public $caption;

}
