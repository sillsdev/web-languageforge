<?php

namespace Api\Model\Languageforge\Lexicon\Import;

class LiftRangeImportNodeError extends ImportNodeError
{
    const FILE = "file";
    const RANGE = "lift range";

    /** @var LiftRangeImportNodeError[] */
    protected $subnodeErrors;

    public function addRangeFileNotFound($liftFilename)
    {
        $this->errors[] = [
            "error" => "RangeFileNotFound",
            "liftFilename" => $liftFilename,
        ];
    }

    public function addRangeNotFound($rangeId)
    {
        $this->errors[] = [
            "error" => "RangeNotFound",
            "rangeId" => $rangeId,
        ];
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
                case "RangeFileNotFound":
                    $msg .=
                        "range file '" .
                        $this->identifier .
                        "' was not found alongside the '" .
                        $error["liftFilename"] .
                        "' file";
                    break;
                case "RangeNotFound":
                    $msg .= "the lift range '" . $error["rangeId"] . "' was not found in the current file";
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
}
