<?php

namespace models\languageforge\dto;

class EntryHelper
{
    private $_entry;
    public function __construct($entry)
    {
        $this->_entry = $entry;
    }
    public function getPartData($type, $guid, $language)
    {
        $type = trim ( strtoupper ( $type ) );
        $senses = $this->_entry["senses"];
        switch ($type) {
            case "ENTRYLEXICALFORM" :
                return  $this->_entry["entry"][$language];
            case "DEFINITION" :
                foreach ($senses as $sense) {
                    if ($sense["id"]==$guid) {
                        if (array_key_exists($language, $sense["definition"])) {
                            return $sense["definition"][$language];
                        }
                    }
                }

                return "";
            case "POS" :
                foreach ($senses as $sense) {
                    if ($sense["id"]==$guid) {
                        if (array_key_exists("POS", $sense)) {
                            return $sense["POS"];
                        }
                    }
                }

                return "";
            case "EXAMPLESENTENCE" :
                foreach ($senses as $sense) {
                    if (array_key_exists ( "examples", $sense )) {
                        $examples = $sense ["examples"];
                        foreach ($examples as $example) {
                            if ($example ["id"] == $guid) {
                                if (array_key_exists ("example", $example )) {
                                    if (array_key_exists ("$language", $example["example"] )) {
                                        return $example["example"][$language];
                                    }
                                }
                            }
                        }
                    }
                }

                return "";
            case "EXAMPLETRANSLATION" :
                foreach ($senses as $sense) {
                    if (array_key_exists ( "examples", $sense )) {
                        $examples = $sense ["examples"];
                        foreach ($examples as $example) {
                            if ($example ["id"] == $guid) {
                                if (array_key_exists ("translation", $example )) {
                                    if (array_key_exists ("$language", $example["translation"])) {
                                        return $example["translation"][$language];
                                    }
                                }
                            }
                        }
                    }
                }

                return "";
            default :
                return "";
        }
    }
}
