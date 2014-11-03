<?php
namespace models\languageforge\lexicon;

class LiftImportNodeError
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
     * @var LiftImportNodeError
     */
    public $subNodeError;

    /**
     *
     * @var array of errors
     */
    private $errors;

    /**
     *
     * @var array <LiftImportNodeError>
     */
    private $subNodes;

    /**
     * @var string
     */
    private $type;

    public function __construct($type, $guid)
    {
        $this->type = $type;
        $this->guid = $guid;
        $this->errors = array();
        $this->subNodes = array();
    }

    public function hasError()
    {
        $hasError = count($this->errors) > 0 ;
        if (isset($this->subNodeError)) {
            $hasError |= $this->subNodeError->hasError();
        }
        foreach ($this->subNodes as $subNodeError) {
            $hasError |= $subNodeError->hasError();
        }
        return $hasError;
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

    public function addCurrentSubNodeError() {
        $this->subNodes[] = $this->subNodeError;
        unset($this->subNodeError);
    }

    public function currentSubNodeError() {
        return end($this->subNodes);
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
        foreach ($this->subNodes as $subNodeError) {
            $msg .= $subNodeError->toString();
        }
        if (isset($this->subNodeError)) {
            $msg .= $this->subNodeError->toString();
        }
        return $msg;
    }
}
