#!/usr/local/bin/php
<?php
/**
 * Taken from http://stackoverflow.com/questions/3111406/checking-if-process-still-running
 */

define("PID_FILE", sys_get_temp_dir() . "/mockLFMerge.pid");

file_put_contents(PID_FILE, posix_getpid());

function removePidFile()
{
    unlink(PID_FILE);
}

register_shutdown_function("removePidFile");

($runSeconds = $argv[1]) or ($runSeconds = 10);

sleep($runSeconds);

