<?php
namespace models\languageforge\lexicon;

class ZipImportNodeError extends ImportNodeError
{

    const FILE = 'file';

    /**
     *
     * @var array <LiftImportNodeError>
     */
    protected $subnodeErrors;

    public function addUnhandledLiftFile($fileName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledLiftFile',
            'filename' => $fileName
        );
    }

    public function addUnhandledSubfolder($folderName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledSubfolder',
            'foldername' => $folderName
        );
    }

    protected function toErrorString()
    {
        $msg = "processing $this->type '$this->identifier'";
        foreach ($this->errors as $error) {
            switch ($error['error']) {
                case 'UnhandledLiftFile':
                    $msg .= ", unhandled LIFT file '" . $error['filename'] . "'";
                    break;
                case 'UnhandledSubfolder':
                    $msg .= ", unhandled subfolder '" . $error['foldername'] . "'";
                    break;
                default:
                    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
        }
        return $msg;
    }
}