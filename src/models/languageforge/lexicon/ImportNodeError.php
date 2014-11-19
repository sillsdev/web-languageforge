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
     * @param string $termEnd
     * @param string $dataStart
     * @param string $dataEnd
     * @throws \Exception
     * @return string
     */
    protected function toErrorString($termEnd = '', $dataStart = ', ', $dataEnd = '') {
        $msg = "processing $this->type '$this->identifier'" . $termEnd;
        foreach ($this->errors as $error) {
    	    $msg .= $dataStart;
            switch ($error['error']) {
            	case 'UnhandledElement':
            	    $msg .= "unhandled element '" . $error['element'] . "'";
            	    break;
            	default:
            	    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
            $msg .= $dataEnd;
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

    public function toFormattedString()
    {
        $html = $this->toErrorString("\n", "\t", "\n");
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasErrors()) {
                $html .= "\t" . $subnodeError->toFormattedString() . "\n";
            }
        }
        return $html;
    }

    public function toHtml()
    {
        $html = $this->toErrorString('</dt>', '<dd>', '</dd>');
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasErrors()) {
                $html .= '<dd><dl><dt>' . $subnodeError->toHtml() . '</dl></dd>';
            }
        }
        return $html;
    }
}
