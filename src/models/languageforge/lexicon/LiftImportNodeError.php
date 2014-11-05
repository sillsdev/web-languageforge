<?php
namespace models\languageforge\lexicon;

class LiftImportNodeError
{

    const ENTRY = 'entry';
    const SENSE = 'sense';
    const EXAMPLE = 'example';
    const MULTITEXT = 'multitext';

    /**
     *
     * @var string guid of lift entry, sense lift id, or attribute name
     */
    private $identifier;

    /**
     *
     * @var array of errors
     */
    private $errors;

    /**
     *
     * @var array <LiftImportNodeError>
     */
    private $subnodeErrors;

    /**
     * @var string
     */
    private $type;

    public function __construct($type, $identifier)
    {
        $this->type = $type;
        $this->identifier = $identifier;
        $this->errors = array();
        $this->subnodeErrors = array();
    }

    public function hasError()
    {
        $hasError = count($this->errors) > 0 ;
        foreach ($this->subnodeErrors as $subnodeError) {
            $hasError |= $subnodeError->hasError();
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

    public function addSubnodeError($subnodeError) {
        $this->subnodeErrors[] = $subnodeError;
    }

    public function currentSubnodeError() {
        return end($this->subnodeErrors);
    }

    public function toString()
    {
        $msg = "processing $this->type '$this->identifier'";
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
                    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
        }
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasError()) {
                $msg .= ', ' . $subnodeError->toString();
            }
        }
        return $msg;
    }
}
