<?php

namespace Api\Model\Languageforge\Lexicon\Import;

class ZipImportNodeError extends ImportNodeError
{
    const FILE = "file";

    /** @var LiftImportNodeError[] */
    protected $subnodeErrors;

    public function addUnhandledLiftFile($fileName)
    {
        $this->errors[] = [
            "error" => "UnhandledLiftFile",
            "filename" => $fileName,
        ];
    }

    public function addUnhandledSubfolder($folderName)
    {
        $this->errors[] = [
            "error" => "UnhandledSubfolder",
            "foldername" => $folderName,
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
                case "UnhandledLiftFile":
                    $msg .= "unhandled LIFT file '" . $error["filename"] . "'";
                    break;
                case "UnhandledSubfolder":
                    $msg .= "unhandled subfolder '" . $error["foldername"] . "'";
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
