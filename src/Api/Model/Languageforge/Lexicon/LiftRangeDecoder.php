<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;

class LiftRangeError {
    public function __construct($msg, $rangeId)
    {
        $this->msg = $msg;
        $this->rangeId = $rangeId;
    }

    public $msg;
    public $rangeId;
}

class LiftRangeElementError {
    // This is basically a glorified struct with a constructor. Variables are deliberately public.
    public function __contruct($msg, $rangeId, $rangeElementId)
    {
        $this->msg = $msg;
        $this->rangeId = $rangeId;
        $this->rangeElementId = $rangeElementId;
    }

    public $msg;
    public $rangeId;
    public $rangeElementId;
}

// TODO: Should we inherit from LiftDecoder?
class LiftRangeDecoder {
    public function __construct($projectModel)
    {
        $this->_projectModel = $projectModel;
        $this->_errors = array();
    }

    /**
     *
     * @var LexiconProjectModel
     */
    private $_projectModel;

    /**
     *
     * @var array(RangeError / RangeElementError)
     */
    private $_errors;

    /**
     * @param SimpleXMLElement $sxeNode
     * @return Array of Range objects, keyed by id
     */
    public function decode($sxeNode)
    {
        $ranges = array();
        foreach ($sxeNode->range as $rangeNode) {
            $range = $this->readRange($rangeNode);
            $ranges[$range->id] = $range;
        }
        return $ranges;
    }

    /**
     * Reads a Range from the XmlNode $sxeNode
     * @param SimpleXMLElement $sxeNode
     * @return Range
     */
    public function readRange($sxeNode, $existingRange = null)
    {
        //CodeGuard::assertKeyExistsOrThrow('id', $sxeNode->attributes(), 'range attributes');
        if (isset($existingRange)) {
            $range = $existingRange;
        } else {
            $range = new LiftRange();
        }
        $range->id = (string) $sxeNode['id'];
        if (isset($sxeNode['guid'])) {
            $range->guid = (string) $sxeNode['guid'];
        }
        if (isset($sxeNode['href'])) {
            $range->href = (string) $sxeNode['href'];
        }
        foreach (array('description', 'label', 'abbrev') as $name) {
            if (isset($sxeNode->{$name})) {
                if (isset($range->{$name})) {
                    $existingMultiText = $range->{$name};
                } else {
                    $existingMultiText = null;
                }
                $range->{$name} = $this->readMultiText($sxeNode->{$name}, $existingMultiText);
            }
        }

        $elementsById = array();
        foreach ($sxeNode->{'range-element'} as $rangeElementNode) {
            $rangeElement = $this->readRangeElement($rangeElementNode);
            $elementsById[$rangeElement->id] = $rangeElement;
        }
        // Now that all range-element nodes have been read, connect up the $parent references
        foreach ($elementsById as $element) {
            if (isset($element->parent)) {
                if (array_key_exists($element->parent, $elementsById)) {
                    $element->parentRef = $elementsById[$element->parent];
                } else {
                    $errorMsg = "Parent '$element->parent' not found";
                    $this->_errors[] = new RangeElementError($errorMsg, $range->id, $element->id);
                    // TODO: When parsing is done, collect all errors and report them somehow. 2014-09 RM
                }
            }
        }
        if (isset($range->rangeElements)) {
            $range->rangeElements = array_merge($range->rangeElements, $elementsById);
        } else {
            $range->rangeElements = $elementsById;
        }

        return $range;
    }

    public function readRangeElement($sxeNode)
    {
        //CodeGuard::assertKeyExistsOrThrow('id', $sxeNode, 'range-element attributes');
        $rangeElement = new LiftRangeElement();
        $rangeElement->id = (string) $sxeNode['id'];
        if (isset($sxeNode['guid'])) {
            $rangeElement->guid = (string) $sxeNode['guid'];
        }
        if (isset($sxeNode['parent'])) {
            $rangeElement->parent = (string) $sxeNode['parent'];
            // $rangeElement->parentRef will be set later
        }
        foreach (array('description', 'label', 'abbrev') as $name) {
            if (isset($sxeNode->{$name})) {
                $rangeElement->{$name} = $this->readMultiText($sxeNode->{$name});
            }
        }
        return $rangeElement;
    }

    /**
     * Reads a MultiText from the XmlNode $sxeNode
     * @param SimpleXMLElement $sxeNode
     * @param MultiText $existingMultiText
     * @param ArrayOf $inputSystems
     * @return MultiText
     */
    // TODO: If we don't use $this->_projectModel (and I think we shouldn't), this can be
    // converted to a static method so other code could use it.
    public function readMultiText($sxeNode, $existingMultiText = null, $inputSystems = null)
    {
        if (isset($existingMultiText)) {
            $multiText = $existingMultiText;
        } else {
            $multiText = new MultiText();
        }
        if (isset($sxeNode->form)) {
            foreach ($sxeNode->form as $form) {
                $inputSystemTag = (string) $form['lang'];
                $multiText->form($inputSystemTag, (string) $form->text);
                // TODO: Do we need to count input systems found in LIFT ranges? I think no, because
                // the input systems found in ranges are ones for which an interface translation has
                // been defined, which is not the same concept as "ones for which data exists". 2014-09 RM
                //$this->_projectModel->addInputSystem($inputSystemTag);
                if (isset($inputSystems)) {
                    $inputSystems->value($inputSystemTag);
                }
            }
        }
        return $multiText;
    }
}
