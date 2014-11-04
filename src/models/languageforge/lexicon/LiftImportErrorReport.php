<?php
namespace models\languageforge\lexicon;

class LiftImportErrorReport
{

    public function __construct()
    {
        $this->nodeErrors = array();
    }

    /**
     *
     * @var array <LiftImportNodeError>
     */
    public $nodeErrors;

    public function hasError()
    {
        $hasError = false;
        foreach ($this->nodeErrors as $nodeError) {
            $hasError |= $nodeError->hasError();
        }
        return $hasError;
    }

    public function toString()
    {
        $msg = '';
        foreach ($this->nodeErrors as $nodeError) {
            if ($nodeError->hasError()) {
                $msg .= 'While ' . $nodeError->toString() . "\n";
            }
        }
        return $msg;
    }
}
