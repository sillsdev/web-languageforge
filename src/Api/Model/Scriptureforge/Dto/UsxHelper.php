<?php

namespace Api\Model\Scriptureforge\Dto;

class UsxHelper
{
    private $_parser;

    private $_usx;

    private $_out;

    private $_capturedOutput;

    private $_tagStack;

    private $_footnoteNumber;
    private $_footnoteCaller;
    private $_footnoteStyle;
    private $_footnotes;

    /**
     *
     * @var array
     */
    private $_info;

    // States
    private $_stateCData;
    private $_stateCapturing;

    public function __construct($usx)
    {
        $this->_usx = $usx;
        $this->_parser = xml_parser_create('UTF-8');
        xml_set_object($this->_parser, $this);
        xml_set_element_handler($this->_parser, "onTagOpen", "onTagClose");
        xml_set_character_data_handler($this->_parser, "onCData");
        $this->_info = array(
            'startChapter' => null,
            'startVerse' => null,
            'endChapter' => null,
            'endVerse' => null,
            'bookCode' => null
        );
        $this->_footnotes = array();
        $this->_tagStack = array();
    }

    public function toHtml()
    {
        $this->_out = '';
        $this->_capturedOutput = '';
        $this->_tagStack = array();
        $this->_stateCData = false;
        $this->_stateCapturing = false;
        $this->_footnoteNumber = 0;
        $this->_footnoteCaller = '';
        $this->_footnotes = array();
        xml_parse($this->_parser, $this->_usx);
        //echo $this->_out;
        return $this->_out;
    }

    public function getMetadata()
    {
        if (is_null($this->_info['startChapter'])) {
            // parse the USX if we haven't already
            $this->toHtml();
        }

        return $this->_info;
    }

    private function onTagOpen($parser, $tag, $attributes)
    {
        array_push($this->_tagStack, $tag);
        switch ($tag) {
            case 'PARA':
                $this->onParagraphOpen($attributes['STYLE']);
                break;
            case 'VERSE':
                $this->onVerse($attributes['NUMBER'], $attributes['STYLE']);
                break;
            case 'CHAPTER':
                $this->onChapter($attributes['NUMBER'], $attributes['STYLE']);
                break;
            case 'CHAR':
                $this->onChar($attributes['STYLE']);
                break;
            case 'BOOK':
                $this->onBook($attributes['CODE']);
                break;
            case 'NOTE':
                $this->onNote($attributes['CALLER'], $attributes['STYLE']);
                break;
            default:
//                 echo 'to:';
//                 var_dump($tag, $attributes);

        }
    }

    private function onTagClose($parser, $tag)
    {
        switch ($tag) {
            case 'PARA':
                $this->onParagraphClose();
                break;
            case 'NOTE':
                $this->onNoteClose();
                break;
            case 'CHAPTER':
            case 'VERSE':
                break;
            case 'CHAR':
                $this->onCharClose();
                break;
            case 'USX':
                $this->onUsxClose();
                break;
            default:
//                 echo 'tc:';
//                 var_dump($tag);

        }
        array_pop($this->_tagStack);
    }

    private function outputText($text)
    {
        if ($this->_stateCapturing) {
            $this->_capturedOutput .= $text;
        } else {
            $this->_out .= $text;
        }
    }

    private function startCapturing()
    {
        $this->_capturedOutput = '';
        $this->_stateCapturing = true;
    }

    private function stopCapturing()
    {
        $this->_stateCapturing = false;

        return $this->_capturedOutput;
    }

    private function onCData($parser, $cdata)
    {
//         echo 'cd:';
//         var_dump($cdata);
        if ($this->_stateCData) {
            $this->outputText($cdata);
        }
    }

    // Handlers
    private function onParagraphOpen($style)
    {
        if ($style == 'ide') {
            $this->_stateCData = false;

            return;
        }
        $this->_stateCData = true;
        if ($style != 'p') {
            $this->outputText("<p class=\"$style\">");
        } else {
            $this->outputText("<p>");
        }
    }

    private function onParagraphClose()
    {
        $this->outputText("</p>");
        $this->_stateCData = false;
    }

    private function onChapter($number, $style)
    {
        if (is_null($this->_info['startChapter'])) {
            $this->_info['startChapter'] = $number;
        }
        $this->_info['endChapter'] = $number;
        $this->outputText("<div class=\"$style\">Chapter $number</div>");
    }

    private function onVerse($number, $style)
    {
        if (is_null($this->_info['startVerse'])) {
            $this->_info['startVerse'] = $number;
        }
        $this->_info['endVerse'] = $number;
        $this->outputText("<sup>$number</sup>");
    }

    private function onChar($style)
    {
        $this->outputText("<span class=\"$style\">");
    }

    private function onCharClose()
    {
        $this->outputText("</span>");
    }

    private function nextFootnoteNumber()
    {
        $this->_footnoteNumber++;

        return $this->_footnoteNumber;
    }
    private function num2alpha($n)
    {
        // Based on http://stackoverflow.com/a/5554413/2314532 but without bugs
        for ($result = ""; $n > 0; $n = intval(($n-1) / 26)) {
            $result = chr(($n-1) % 26 + 0x61) . $result;
        }

        return $result;
    }
    // NOTE: That works great for Latin-based scripts. What about other scripts,
    // where footnote markers based on their own alphabet would be more appropriate?
    // For now, we're going with simple. If that feature is requested, we can add it later.

    private function onNote($caller, $style)
    {
        if ($caller == "-") {
            // USFM spec says this "indicates that no caller should be generated, and is not used." We will ignore these notes.
            $fnChar = "";
        } elseif ($style == "x") {
            // We will not process cross-reference footnotes either
            $fnChar = "";
        } elseif ($caller == "+") {
            // USFM spec says this "indicates that the caller should be generated automatically"
            $fnNum = $this->nextFootnoteNumber();
            $fnChar = $this->num2alpha($fnNum);
        } else {
            $fnChar = $caller;
        }
        $this->startCapturing();
        $this->_footnoteCaller = $fnChar;
        $this->_footnoteStyle = $style;
    }

    private function onNoteClose()
    {
        $fnText = $this->stopCapturing();
        if ($this->_footnoteCaller == "") {
            // Notes with no caller should be ignored
            return;
        }
        $fnText = str_replace('"', "&quot;", $fnText);
        $this->outputText("<a data-ng-click=\"\" tooltip-html-unsafe=\"$fnText\"><sup>$this->_footnoteCaller</sup></a>");
        $footnote = array("fnCaller" => $this->_footnoteCaller, "fnText" => $fnText);
        $this->_footnotes[] = $footnote;
    }

    private function onUsxClose()
    {
        if (!empty($this->_footnotes)) {
            $this->outputText("<div id=\"footnotes\"><hr><p>");
            foreach ($this->_footnotes as $footnote) {
                $fnText = $footnote["fnText"];
                $fnCaller = $footnote["fnCaller"];
                $this->outputText("<a data-ng-click=\"\">$fnCaller</a>. " . $fnText . "<br>");
                }
            $this->outputText("</p></div>");
            }
        }

    private function onBook($code)
    {
        $this->_info['bookCode'] = $code;
    }

}
