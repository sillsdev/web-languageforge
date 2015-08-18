<?php

namespace Api\Model\Scriptureforge\Dto;

class UsxTrimHelper
{
    private $_parser;
    private $_usx;
    private $_out;
    private $_tagStack;

    // States
    private $_stateCData;
    private $_stateDrop;
    private $_currentChapter;
    private $_currentVerse;

    // Start and end are both inclusive
    private $_startChapter;
    private $_startVerse;
    private $_endChapter;
    private $_endVerse;

    public function __construct($usx, $startCh, $startVs, $endCh, $endVs)
    {
        $this->_usx = $usx;

        // Empty strings or nulls will become 0, which is perfect for start chapters/verses
        $this->_startChapter = (int) $startCh;
        $this->_startVerse = (int) $startVs;
        // But for end chapters/verses, we should use MAXINT for empty/null
        $this->_endChapter = (int) $endCh;
        $this->_endVerse = (int) $endVs;
        if ($this->_endChapter == 0) {
            $this->_endChapter = PHP_INT_MAX;
        }
        if ($this->_endVerse == 0) {
            $this->_endVerse = PHP_INT_MAX;
        }

        $this->_parser = xml_parser_create('UTF-8');
        xml_set_object($this->_parser, $this);
        xml_set_element_handler($this->_parser, "onTagOpen", "onTagClose");
        xml_set_character_data_handler($this->_parser, "onCData");
    }

    public function trimUsx()
    {
        $this->_out = '';
        $this->_tagStack = array();
        // Keep all front matter; only start dropping when first chapter tag reached
        $this->_stateDrop = true;
        // Special-case: if start chapter & verse are 0 (we're starting from
        // the beginning of the supplied USX), keep all front matter
        if ($this->_startChapter == 0 && $this->_startVerse == 0) {
            $this->_stateDrop = false;
        }
        $this->_stateRecreateTagStack = false;
        xml_parse($this->_parser, $this->_usx);
        //echo $this->_out;
        return $this->_out;
    }

    private function onTagOpen($parser, $tag, $attrs)
    {
        array_push($this->_tagStack, $tag);
        array_push($this->_tagStack, $attrs);
        switch ($tag) {
            case 'USX':
                $this->outputStartTag($tag, $attrs);
                array_pop($this->_tagStack); // Do not leave <usx> tag on stack
                array_pop($this->_tagStack);

                return; // And do not output it below
            case 'VERSE':
                $this->onVerse($attrs);
                break;
            case 'CHAPTER':
                $this->onChapter($attrs);
                break;
            default:
//                 echo 'to:';
//                 var_dump($tag, $attrs);

        }
        if (!$this->_stateDrop) {
            $this->outputStartTag($tag, $attrs);
        }
    }

    private function onTagClose($parser, $tag)
    {
        switch ($tag) {
            case 'USX':
                $this->outputEndTag('usx');

                return;
            case 'VERSE':
                break;
            default:
//                 echo 'tc:';
//                 var_dump($tag);

        }
        $originalAttrs = array_pop($this->_tagStack);
        $originalTag = array_pop($this->_tagStack);
        if (!$this->_stateDrop) {
            $this->outputEndTag($tag);
        }
    }

    private function onCData($parser, $cdata)
    {
//         echo 'cd:';
//         var_dump($cdata);
        if (!$this->_stateDrop) {
            $this->_out .= $cdata;
        }
    }

    // Handlers
    private function startDropping()
    {
        $oldstate = $this->_stateDrop;
        if (!$oldstate) {
            // We just went from "keep" to "drop". Issue close tags
            // for everything on the current tag stack.
            $finalAttrs = array_pop($this->_tagStack); // Don't close the <verse> tag that made us stop outputting, since we're dropping it
            $finalTag = array_pop($this->_tagStack);
            while (!empty($this->_tagStack)) {
                $attrs = array_pop($this->_tagStack);
                $tag = array_pop($this->_tagStack);
                $this->outputEndTag($tag);
            }
        }
        $this->_stateDrop = true;
    }

    private function stopDropping()
    {
        $oldstate = $this->_stateDrop;
        if ($oldstate) {
            // We just went from "drop" to "keep". Reconstruct the tag stack
            // that should have gone before this element.
            $finalAttrs = array_pop($this->_tagStack); // Don't duplicate the <verse> tag that made us start outputting
            $finalTag = array_pop($this->_tagStack);
            foreach (array_chunk($this->_tagStack, 2) as $pair) {
                $tag   = $pair[0];
                $attrs = $pair[1];
                $this->outputStartTag($tag, $attrs);
            }
            array_push($this->_tagStack, $finalTag);
            array_push($this->_tagStack, $finalAttrs);
        }
        $this->_stateDrop = false;
    }

    private function outputStartTag($tag, $attrs, $selfclosing = false)
    {
        $tag = strtolower($tag);
        $this->_out .= "<$tag";
        foreach ($attrs as $name => $val) {
            $name = strtolower($name);
            $this->_out .= " $name=\"$val\"";
        }
        if ($selfclosing) {
            $this->_out .= " /";
        }
        $this->_out .= ">";
    }

    private function outputEndTag($tag)
    {
        $tag = strtolower($tag);
        $this->_out .= "</$tag>";
    }

    private function setDropStateByChapter()
    {
        if (($this->_currentChapter < $this->_startChapter) ||
            ($this->_currentChapter > $this->_endChapter)) {
            $this->startDropping();
        }
        if (($this->_currentChapter > $this->_startChapter) &&
            ($this->_currentChapter < $this->_endChapter)) {
            $this->stopDropping();
        }
    }

    private function setDropStateByVerse()
    {
        if ($this->_startChapter == $this->_endChapter) {
            // One-chapter section ...
            if ($this->_currentChapter == $this->_startChapter) {
                // ... and we're in that chapter: check start and end verses
                if (($this->_currentVerse < $this->_startVerse) ||
                    ($this->_currentVerse > $this->_endVerse)) {
                    $this->startDropping();
                }
                if (($this->_currentVerse >= $this->_startVerse) &&
                    ($this->_currentVerse <= $this->_endVerse)) {
                    $this->stopDropping();
                }
            } else {
                // ... but we're not in that chapter: check only chapter number
                $this->setDropStateByChapter();
            }
        } else {
            // Multi-chapter section...
            if ($this->_currentChapter == $this->_startChapter) {
                // ... and we're in the start chapter: check only start verse
                if ($this->_currentVerse < $this->_startVerse) {
                    $this->startDropping();
                } else {
                    $this->stopDropping();
                }
            } elseif ($this->_currentChapter == $this->_endChapter) {
                // ... and we're in the end chapter: check only end verse
                if ($this->_currentVerse > $this->_endVerse) {
                    $this->startDropping();
                } else {
                    $this->stopDropping();
                }
            } else {
                // ... and we're not in a boundary chapter: check only chapter number
                $this->setDropStateByChapter();
            }
        }

                // Boundary chapter; need to check verses
    }

    private function onChapter($attrs)
    {
        $number = (int) $attrs['NUMBER'];
        $this->_currentChapter = (int) $number;
        $this->setDropStateByChapter();
        if ($this->_currentChapter == $this->_startChapter) {
            // Special case: output the chapter marker for this one, but
            // don't change drop/keep state yet. (Wait til we reach the verse.)
            $attrs = array_pop($this->_tagStack);
            array_push($this->_tagStack, $attrs);
            $this->outputStartTag("chapter", $attrs);
            $this->outputEndTag("chapter", $attrs);
        }
    }

    private function onVerse($attrs)
    {
        $number = (int) $attrs['NUMBER'];
        $this->_currentVerse = (int) $number;
        $this->setDropStateByVerse();
    }

}
