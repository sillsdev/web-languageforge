<?php

namespace Api\Library\Shared\Palaso;

class StringUtil
{
    /**
     * see http://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
     * @param string $haystack
     * @param string $needle
     * @return bool
     */
    public static function startsWith($haystack, $needle)
    {
        // search backwards starting from haystack length characters from the end
        return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
    }

    /**
     * see http://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
     * @param string $haystack
     * @param string $needle
     * @return bool
     */
    public static function endsWith($haystack, $needle)
    {
        // search forward starting from end minus needle length characters
        return $needle === "" ||
            (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
    }
}
