<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Languageforge\InputSystem;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;

class TranslateConfig
{
    public function __construct()
    {
        $this->source = new TranslateConfigDocType();
        $this->target = new TranslateConfigDocType();
        $this->documentSets = new TranslateConfigDocumentSets();
        $this->confidenceThreshold = 0.2;
        $this->usersPreferences = new MapOf(function () {
            return new TranslateUserPreferences();
        });
        $this->metrics = new TranslateConfigMetrics();
    }

    /** @var TranslateConfigDocType */
    public $source;

    /** @var TranslateConfigDocType */
    public $target;

    /** @var boolean */
    public $isTranslationDataShared;

    /** @var boolean */
    public $isTranslationDataScripture;

    /** @var TranslateConfigDocumentSets */
    public $documentSets;

    /** @var float */
    public $confidenceThreshold;

    /** @var MapOf <TranslateUserPreferences> key is userId */
    public $usersPreferences;

    /** @var TranslateConfigMetrics */
    public $metrics;
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

class TranslateUserPreferences
{
    public function __construct()
    {
        $this->selectedDocumentSetId = '';
        $this->isDocumentOrientationTargetRight = true;
        $this->hasConfidenceOverride = false;
    }

    /** @var string */
    public $selectedDocumentSetId;

    /** @var boolean */
    public $isDocumentOrientationTargetRight;

    /** @var boolean */
    public $hasConfidenceOverride;

    /** @var float */
    public $confidenceThreshold;
}

class TranslateConfigMetrics
{
    public function __construct()
    {
        $this->activeEditTimeout = 5; // s
        $this->editingTimeout = 20*60; // s
    }

    /** @var int [s] */
    public $activeEditTimeout;

    /** @var int [s] */
    public $editingTimeout;
}
