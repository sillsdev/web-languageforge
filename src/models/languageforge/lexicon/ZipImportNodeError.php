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

    protected function toErrorString()
    {
        $msg = "processing $this->type '$this->identifier'";
        foreach ($this->errors as $error) {
            switch ($error['error']) {
                case 'UnhandledLiftFile':
                    $msg .= ", unhandled LIFT file '" . $error['filename'] . "'";
                    break;
                default:
                    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing identifier '" . $this->identifier . "'");
            }
        }
        return $msg;
    }
}