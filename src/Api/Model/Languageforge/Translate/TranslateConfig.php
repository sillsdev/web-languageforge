<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Languageforge\InputSystem;
use Api\Model\Shared\Mapper\ArrayOf;

class TranslateConfig
{
    public function __construct()
    {
        $this->source = new TranslateConfigDocType();
        $this->target = new TranslateConfigDocType();
        $this->documentSets = new TranslateConfigDocumentSets();
    }

    /** @var TranslateConfigDocType */
    public $source;

    /** @var TranslateConfigDocType */
    public $target;

    /** @var boolean */
    public $isTranslationDataShared;

    /** @var TranslateConfigDocumentSets */
    public $documentSets;
}

class TranslateConfigDocType
{
    public function __construct($tag = 'qaa', $name = '')
    {
        $this->inputSystem = new InputSystem($tag, $name);
    }

    /** @var InputSystem */
    public $inputSystem;
}

class TranslateConfigDocumentSets
{
//    const COLLECTION = 'realtime';

    public function __construct()
    {
        $this->idsOrdered = new ArrayOf();
    }

    /** @var ArrayOf<string $documentSetId> */
    public $idsOrdered;
}
