<?php
namespace models\languageforge\lexicon;

class ImportNodeError
{

    /**
     *
     * @var string guid of lift entry, sense lift id, or attribute name
     */
    protected $identifier;

    /**
     *
     * @var array of errors
     */
    protected $errors;

    /**
     *
     * @var array <ImportNodeError>
     */
    protected $subnodeErrors;

    /**
     * @var string
     */
    protected $type;

    public function __construct($type, $identifier)
    {
        $this->type = $type;
        $this->identifier = $identifier;
        $this->errors = array();
        $this->subnodeErrors = array();
    }

    public function hasError()
    {
        return count($this->errors) > 0 ;
    }

    public function hasErrors()
    {
        $hasErrors = $this->hasError();
        foreach ($this->subnodeErrors as $subnodeError) {
            $hasErrors |= $subnodeError->hasErrors();
        }
        return $hasErrors;
    }

    public function addUnhandledElement($elementName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledElement',
            'element' => $elementName
        );
    }

    public function addSubnodeError($subnodeError) {
        $this->subnodeErrors[] = $subnodeError;
    }

    public function currentSubnodeError() {
        return end($this->subnodeErrors);
    }

    /**
     * Creates the specific string for each of $errors
     * This should be overwritten by each parent class
     *
     * @throws \Exception
     * @return string
     */
    protected function toErrorString() {
        $msg = "processing $this->type '$this->identifier'";
        foreach ($this->errors as $error) {
            switch ($error['error']) {
            	case 'UnhandledElement':
            	    $msg .= ", unhandled element '" . $error['element'] . "'";
            	    break;
            	default:
            	    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
        }
        return $msg;
    }

    public function toString()
    {
        $msg = $this->toErrorString();
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasErrors()) {
                $msg .= ', ' . $subnodeError->toString();
            }
        }
        return $msg;
    }
}
