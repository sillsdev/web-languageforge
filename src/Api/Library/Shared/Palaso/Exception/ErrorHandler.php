<?php

namespace Api\Library\Shared\Palaso\Exception;

class ErrorHandler extends \Exception
{
    protected $severity;

    public function __construct($message, $code, $severity, $filename, $lineno)
    {
        $this->message = $message;
        $this->code = $code;
        $this->severity = $severity;
        $this->file = $filename;
        $this->line = $lineno;
    }

    public function getSeverity()
    {
        return $this->severity;
    }
}
