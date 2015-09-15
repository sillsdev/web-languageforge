<?php

namespace Api\Model\Languageforge\Lexicon;

class LiftRange {
    // This is basically just a struct: no constructor, no methods.
    public $id;

    public $guid;
    public $href;

    public $description;
    public $rangeElements;
    public $label;
    public $abbrev;
}

class LiftRangeElement {
    // This basically just a struct: no constructor, no methods.
    public $id;

    public $parent; // String
    public $parentRef; // Reference to other LiftRangeElement object
    public $guid;

    public $description;
    public $label;
    public $abbrev;
}
