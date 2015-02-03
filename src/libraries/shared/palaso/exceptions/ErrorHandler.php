<?php

namespace libraries\shared\palaso\exceptions;

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
