<?php

namespace Api\Library\Shared\Palaso;

class DbScriptLogger
{
    public function __construct($makeChanges)
    {
        $this->output = "";
        $this->makeChanges = $makeChanges;
        if ($makeChanges) {
            $this->yell("-------------- Database WILL be modified --------------------");
        } else {
            $this->yell("-------------- Test mode - no changes will be made --------------------");
        }
    }

    /** @var string */
    protected $output;

    /** @var boolean */
    protected $makeChanges;

    /**
     * Output an informational message
     * @param string $message
     */
    protected function info($message = "\n")
    {
        $this->output .= "$message\n";
    }

    /**
     * Output an important message
     * @param mixed $message
     */
    protected function yell($message)
    {
        $this->output .= "\nIMPORTANT: $message\n\n";
    }

    /**
     * Output a warning
     * @param mixed $message
     */
    protected function warn($message)
    {
        $this->output .= "\nWARNING: $message\n\n";
    }

    /**
     * Output a message about something that has been automatically fixed
     * @param mixed $message
     */
    protected function fix($message)
    {
        $this->output .= "\nFIXED: $message\n\n";
    }

    /**
     * @return string - the output
     */
    public function flushOutput()
    {
        $output = $this->output;
        $this->output = "";
        return $output;
    }
}
