<?php

namespace Api\Library\Languageforge\Lexicon;

interface LanguageServerApiInterface
{
    /**
     * @param string $url
     * @param string $queryData
     * @param string $method
     * @return array
     */
    public function getWebMetaData($url, $queryData, $method = 'POST');

    /**
     * @param $url
     * @param $method
     * @param $queryData
     * @return mixed
     */
    public function getWebContent($url, $method = 'GET', $queryData = array());
}
