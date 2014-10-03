<?php
namespace models\languageforge\lexicon;

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
