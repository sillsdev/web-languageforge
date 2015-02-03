<?php
namespace models\languageforge\lexicon;

class LiftImportErrorReport
{

    const ENTRY = 'entry';
    const SENSE = 'sense';
    const EXAMPLE = 'example';

    /**
     *
     * @var string guid of lift entry
     */
    public $guid;

    /**
     *
     * @var array of errors
     */
    private $errors;

    /**
     * @var string
     */
    private $type;

    public function __construct($type, $guid)
    {
        $this->type = $type;
        $this->guid = $guid;
        $this->errors = array();
    }

    public function hasError()
    {
        return count($this->errors) > 0;
    }

    public function addUnhandledElement($elementName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledElement',
            'element' => $elementName
        );
    }

    public function addUnhandledField($typeName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledField',
            'type' => $typeName
        );
    }

    public function addUnhandledTrait($traitName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledTrait',
            'name' => $traitName
        );
    }

    public function addUnhandledMedia($url, $context)
    {
        $this->errors[] = array(
            'error' => 'UnhandledMedia',
            'url' => $url,
            'context' => $context
        );
    }

    public function addUnhandledNote($noteType)
    {
        $this->errors[] = array(
            'error' => 'UnhandledNote',
            'type' => $noteType
        );
    }

    public function toString()
    {
        $msg = "While processing $this->type '$this->guid'";
        foreach ($this->errors as $error) {
            switch ($error['error']) {
                case 'UnhandledElement':
                    $msg .= ", unhandled element '" . $error['element'] . "'";
                    break;
                case 'UnhandledField':
                    $msg .= ", unhandled field '" . $error['type'] . "'";
                    break;
                case 'UnhandledTrait':
                    $msg .= ", unhandled trait '" . $error['name'] . "'";
                    break;
                case 'UnhandledNote':
                    $msg .= ", unhandled note '" . $error['type'] . "'";
                    break;
                case 'UnhandledMedia':
                    $msg .= ", unhandled media '" . $error['url'] . "' in " . $error['context'];
                    break;
                default:
                    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing guid '" . $this->guid . "'");
            }
        }
        return $msg;
    }
}