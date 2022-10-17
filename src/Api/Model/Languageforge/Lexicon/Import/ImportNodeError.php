<?php

namespace Api\Model\Languageforge\Lexicon\Import;

class ImportNodeError
{
    public function __construct($type, $identifier)
    {
        $this->type = $type;
        $this->identifier = $identifier;
        $this->errors = [];
        $this->subnodeErrors = [];
    }

    /** @var string guid of lift entry, sense lift id, or attribute name */
    protected $identifier;

    /** @var array of errors */
    protected $errors;

    /** @var ImportNodeError[] */
    protected $subnodeErrors;

    /** @var string */
    protected $type;

    public function hasError()
    {
        return count($this->errors) > 0;
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
        $this->errors[] = [
            "error" => "UnhandledElement",
            "element" => $elementName,
        ];
    }

    public function addSubnodeError($subnodeError)
    {
        $this->subnodeErrors[] = $subnodeError;
    }

    public function currentSubnodeError()
    {
        return end($this->subnodeErrors);
    }

    public function getSubnodeError($index)
    {
        if ($index >= 0 && $index < count($this->subnodeErrors)) {
            return $this->subnodeErrors[$index];
        }
        return false;
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
    protected function toErrorString($termEnd = "", $dataStart = ", ", $dataEnd = "")
    {
        $msg = "processing $this->type '$this->identifier'" . $termEnd;
        foreach ($this->errors as $error) {
            $msg .= $dataStart;
            switch ($error["error"]) {
                case "UnhandledElement":
                    $msg .= "unhandled element '" . $error["element"] . "'";
                    break;
                default:
                    throw new \Exception(
                        "Unknown error type '" .
                            $error["error"] .
                            "' while processing identifier '" .
                            $this->identifier .
                            "'"
                    );
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
                $msg .= ", " . $subnodeError->toString();
            }
        }
        return $msg;
    }

    public function toFormattedString($level = 1)
    {
        $dataStart = "";
        for ($i = 1; $i <= $level; $i++) {
            $dataStart .= "\t";
        }
        $msg = $this->toErrorString("\n", $dataStart, "\n");
        $level++;
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasErrors()) {
                $msg .= $dataStart . $subnodeError->toFormattedString($level);
            }
        }
        return $msg;
    }

    public function toHtml()
    {
        $html = $this->toErrorString("</dt>", "<dd>", "</dd>");
        foreach ($this->subnodeErrors as $subnodeError) {
            if ($subnodeError->hasErrors()) {
                $html .= "<dd><dl><dt>" . $subnodeError->toHtml() . "</dl></dd>";
            }
        }
        return $html;
    }
}
