<?php
namespace models\languageforge\lexicon;

class LiftRangeImportNodeError extends ImportNodeError
{

    const RANGE = 'lift range';

    /**
     *
     * @var array <LiftRangeImportNodeError>
     */
    protected $subnodeErrors;

    public function addRangeNotFound($rangeFilename)
    {
        $this->errors[] = array(
            'error' => 'RangeNotFound',
            'rangeFilename' => $rangeFilename
        );
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
            	case 'RangeNotFound':
            	    $msg .= ", range id '" . $this->identifier . "' was not found in referenced '" . $error['rangeFilename'] . "' file";
            	    break;
            	default:
            	    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
        }
        return $msg;
    }
}
