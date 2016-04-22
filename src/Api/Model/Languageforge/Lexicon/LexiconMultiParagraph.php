<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;

function _createMultiParagraphItem() {
    return new LexiconMultiParagraphItem();
}


class LexiconMultiParagraph
{
    use \LazyProperty\LazyPropertiesTrait;
    
    public function __construct()
    {
        $this->initLazyProperties(['paragraphs'], false);
    }
    
    protected function createProperty($name) {
       switch ($name) {
           case 'paragraphs':
               return new ArrayOf('\Api\Model\Languageforge\Lexicon\_createMultiParagraphItem');
       }
    }

    public $inputSystem;

    /**
     * @var ArrayOf LexiconMultiParagraphItem
     */
    public $paragraphs;


}
