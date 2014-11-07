<?php
namespace models\languageforge\lexicon;

class ZipImportErrorReport
{

    const FILE = 'file';

    /**
     * @var string name of zip file
     */
    public $name;

    /**
     * @var array of errors
     */
    private $errors;

    /**
     * @var string
     */
    private $type;

    public function __construct($type, $name)
    {
        $this->type = $type;
        $this->name = $name;
        $this->errors = array();
    }

    public function hasError()
    {
        return count($this->errors) > 0;
    }

    public function addUnhandledLiftFile($fileName)
    {
        $this->errors[] = array(
            'error' => 'UnhandledLiftFile',
            'name' => $fileName
        );
    }

    public function toString()
    {
        $msg = "While processing $this->type '$this->name'";
        foreach ($this->errors as $error) {
            switch ($error['error']) {
                case 'UnhandledLiftFile':
                    $msg .= ", unhandled LIFT file '" . $error['name'] . "'";
                    break;
                default:
                    throw new \Exception("Unknown error type '" . $error['error'] . "' while processing $this->type '$this->name'");
            }
        }
        return $msg;
    }
}