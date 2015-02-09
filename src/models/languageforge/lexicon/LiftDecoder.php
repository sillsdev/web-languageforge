<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\config\LexiconConfigObj;
use models\mapper\ArrayOf;
use Palaso\Utilities\CodeGuard;
use models\mapper\Id;

class LiftDecoder
{

    /**
     *
     * @param LexiconProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        $this->projectModel = $projectModel;
        $this->nodeErrors = array();
    }

    /**
     *
     * @var LexiconProjectModel
     */
    private $projectModel;

    /**
     * node error stack
     *
     * @var array <LiftImportNodeError>
     */
    private $nodeErrors;

    /**
     * @param SimpleXMLElement $sxeNode
     * @param LexEntryModel $entry
     * @param LiftMergeRule $mergeRule
     * @throws \Exception
     */
    public function readEntry($sxeNode, $entry, $mergeRule = LiftMergeRule::CREATE_DUPLICATES)
    {
        $this->nodeErrors = array();
        $this->nodeErrors[] = new LiftImportNodeError(LiftImportNodeError::ENTRY, (string) $sxeNode['guid']);
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case 'lexical-unit':
                    if ($mergeRule != LiftMergeRule::IMPORT_LOSES || Id::isEmpty($entry->id)) {
                        $entry->guid = (string) $sxeNode['guid'];
                        $entry->authorInfo->createdDate = new \DateTime((string) $sxeNode['dateCreated']);
                        $entry->authorInfo->modifiedDate = new \DateTime((string) $sxeNode['dateModified']);
                        $entry->lexeme = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems);
                    }
                    break;
                case 'citation':
                    $entry->citationForm = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::CITATIONFORM]->inputSystems);
                    break;
                case 'note':
                    if ($element['type'] == '') {
                        $entry->note = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::NOTE]->inputSystems);
                    } else {
                        $this->currentNodeError()->addUnhandledNote($element['type']);
                    }
                    break;
                case 'etymology':
                   $entry->etymology = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::ETYMOLOGY]->inputSystems);
                    if ($element->{'gloss'}) {
                        $this->readMultiTextGloss($element->gloss, $entry->etymologyGloss, $this->projectModel->config->entry->fields[LexiconConfigObj::ETYMOLOGYGLOSS]->inputSystems);
                    }
                    foreach ($element->{'field'} as $field) {
                        if ($field['type'] == 'comment') {
                            $entry->etymologyComment = $this->readMultiText($field, $this->projectModel->config->entry->fields[LexiconConfigObj::ETYMOLOGYCOMMENT]->inputSystems);
                        } else {
                            $this->currentNodeError()->addUnhandledField($field['type'], 'etymology');
                        }
                    }
                    break;
                case 'pronunciation':
                    $entry->pronunciation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::PRONUNCIATION]->inputSystems);
                    if ($element->{'media'}) {
                        $this->currentNodeError()->addUnhandledMedia($element->{'media'}['href'], 'pronunciation');
                    }
                    break;
                case 'field':
                    switch ($element['type']) {
                        case 'literal-meaning':
                            $entry->literalMeaning = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::LITERALMEANING]->inputSystems);
                            break;
                        case 'summary-definition':
                            $entry->summaryDefinition = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SUMMARYDEFINITION]->inputSystems);
                            break;
                        case 'import-residue': // Currently ignored in LanguageForge
                            break;
                        default:
                            $this->currentNodeError()->addUnhandledField($element['type']);
                    }
                    break;
                case 'trait':
                    switch ($element['name']) {
                        case 'morph-type':
                            $entry->morphologyType = (string)$element['value'];
                            break;
                        default:
                            $this->currentNodeError()->addUnhandledTrait($element['name']);
                    }
                    break;
                case 'sense':
                    $liftId = '';
                    if (isset($element['id'])) {
                        $liftId = (string) $element['id'];
                    }
                    $existingSenseIndex = $entry->searchSensesFor('liftId', $liftId);
                    if ($existingSenseIndex >= 0) {
                        switch ($mergeRule) {
                            case LiftMergeRule::CREATE_DUPLICATES:
                                $sense = new Sense('');
                                $entry->senses[] = $this->readSense($element, $sense);
                                break;
                            case LiftMergeRule::IMPORT_WINS:
                                $sense = $entry->senses[$existingSenseIndex];
                                $entry->senses[$existingSenseIndex] = $this->readSense($element, $sense);
                                break;
                            case LiftMergeRule::IMPORT_LOSES:
                                break;
                            default:
                                throw new \Exception("unknown LiftMergeRule " . $mergeRule);
                        }
                    } else {
                        $sense = new Sense($liftId);
                        $entry->senses[] = $this->readSense($element, $sense);
                    }
                    break;
                case 'relation':
                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
    }

    /**
     * Reads a Sense from the XmlNode $sxeNode
     * @param SimpleXMLElement $sxeNode
     * @param Sense $sense
     * @return Sense
     */
    public function readSense($sxeNode, $sense)
    {
        $this->pushSubnodeError(LiftImportNodeError::SENSE, (string) $sxeNode['id']);
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case 'definition':
                    $sense->definition = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems);
                    break;
                case 'example':
                    $sense->examples[] = $this->readExample($element);
                    break;
                case 'field':
                    switch ($element['type']) {
                        case 'import-residue': // Currently ignored by LanguageForge
                            break;
                        case 'scientific-name':
                            $sense->scientificName = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SCIENTIFICNAME]->inputSystems);
                            break;
                        default:
                            $this->currentNodeError()->addUnhandledField($element['type']);
                    }
                    break;
                case 'gloss':
                    $this->readMultiTextGloss($element, $sense->gloss, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems);
                    break;
                case 'grammatical-info':
                    // Part Of Speech
                    $sense->partOfSpeech->value = (string)$element['value'];
                    break;
                case 'illustration':
                    $picture = new Picture();
                    $picture->fileName = (string) $element['href'];
                    foreach ($element as $child) {
                        switch($child->getName()) {
                        	case 'label':
                    	        $picture->caption = $this->readMultiText($child, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->inputSystems);
                        	    break;
                        	default:
                        	    $this->currentNodeError()->addUnhandledElement($child->getName());
                        }
                    }
                    $sense->pictures[] =  $picture;
                    break;
                case 'note':
                    switch($element['type']) {
                        case '':
                            $this->currentNodeError()->addUnhandledNote($element['type']);
                            break;
                        default:
                            $this->currentNodeError()->addUnhandledNote($element['type']);
                    }
                    break;
                case 'trait':
                    switch ($element['name']) {
                        case 'semantic-domain-ddp4':
                            $sense->semanticDomain->value((string) $element['value']);
                            break;
                        case 'anthro-code':
                            $sense->anthropologyCategories->value((string) $element['value']);
                            break;
                        case 'domain-type':
                            $sense->academicDomains->value((string) $element['value']);
                            break;
                        case 'sense-type':
                            $sense->senseType->value((string) $element['value']);
                            break;
                        case 'status':
                            $sense->status->value((string) $element['value']);
                            break;
                        case 'usage-type':
                            $sense->usages->value((string) $element['value']);
                            break;
                        default:
                            $this->currentNodeError()->addUnhandledTrait($element['name']);
                    }
                    break;

                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        array_pop($this->nodeErrors);

        return $sense;
    }

    /**
     * Reads an Example from the XmlNode $sxeNode
     * @param SimpleXMLElement $sxeNode
     * @return Example
     */
    public function readExample($sxeNode)
    {
        $example = new Example($sxeNode['id']);
        $this->pushSubnodeError(LiftImportNodeError::EXAMPLE, (string) $sxeNode['id']);

        // create copy with only form elements to use with readMultiText as unhandled elements are reported here
        $formsSxeNode = clone $sxeNode;
        $formsDomNode = dom_import_simplexml($formsSxeNode);
        $nodesToRemove = array();
        foreach ($formsDomNode->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE and $child->nodeName !== 'form') {
                    $nodesToRemove[] = $child;
            }
        }
        foreach ($nodesToRemove as $node) {
            $formsDomNode->removeChild($node);
        }
        unset($nodesToRemove); // so nodes can be garbage-collected

        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
            	case 'form':
                    $example->sentence = $this->readMultiText($formsSxeNode, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems);
            	    break;
                case 'translation':
                    $example->translation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems);
            	    break;
        	    default:
        	        $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        array_pop($this->nodeErrors);

        return $example;
    }

    /**
     * Reads a MultiText from the XmlNode $sxeNode given by the elemetn 'form'
     * @param SimpleXMLElement $sxeNode
     * @param ArrayOf $inputSystems
     * @return MultiText
     */
    public function readMultiText($sxeNode, $inputSystems = null)
    {
        $multiText = new MultiText();
        $this->pushSubnodeError(LiftImportNodeError::MULTITEXT, $sxeNode->getName());
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
            	case 'form':
            	    $inputSystemTag = (string) $element['lang'];
            	    $multiText->form($inputSystemTag, $this->sanitizeSpans(dom_import_simplexml($element->text)));

            	    $this->projectModel->addInputSystem($inputSystemTag);
            	    // TODO InputSystems should extend ArrayOf (or Map) and become more useful. CP 2014-10
            	    if (isset($inputSystems)) {
            	        // i.e. $inputSystems->ensureFieldHasInputSystem($inputSystemTag);
            	        $inputSystems->value($inputSystemTag);
            	    }
            	    break;
        	    default:
        	        $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        array_pop($this->nodeErrors);

        return $multiText;
    }

    /**
     * Recursively sanitizes the element only allowing <span> elements through; coverts everthing else to text
     * @param DOMDocument $textDom
     * @return string
     */
    public function sanitizeSpans($textDom)
    {
        $textStr = '';
        foreach ($textDom->childNodes as $child) {
            if ($child->nodeType == XML_TEXT_NODE) {
                $childTextStr = $child->textContent;
            } else {
                if ($child->nodeName != 'span') {
                    $this->currentNodeError()->addUnhandledElement($child->nodeName);
                }

                // recurse to sanitize child node
                $childTextStr = $this->{__FUNCTION__}($child);
            }
            if ($child->nodeName == 'span') {
                $spanTag = '<span';
                foreach ($child->attributes as $attribute) {
                    $spanTag .= ' ' . $attribute->name . '="' . $attribute->value . '"';
                }
                $spanTag .= '>';
                $textStr .= $spanTag . $childTextStr . '</span>';
            } else {
                $textStr .= $childTextStr;
            }
        }
        return $textStr;
    }

    /**
     * Reads a MultiText from the XmlNode $sxeNode given by the element 'gloss'
     * @param SimpleXMLElement $sxeNode
     * @param MultiText $multiText
     * @param ArrayOf $inputSystems
     * @return MultiText
     */
    public function readMultiTextGloss($sxeNode, $multiText, $inputSystems = null)
    {
        CodeGuard::checkTypeAndThrow($multiText, 'models\languageforge\lexicon\MultiText');
        if ($sxeNode->getName() != 'gloss') {
            throw new \Exception("'" . $sxeNode->getName() . "' is not a gloss");
        }
        $inputSystemTag = (string) $sxeNode['lang'];
        $multiText->form($inputSystemTag, (string) $sxeNode->text);

        $this->projectModel->addInputSystem($inputSystemTag);
        // TODO InputSystems should extend ArrayOf (or Map) and become more useful. CP 2014-10
        if (isset($inputSystems)) {
            // i.e. $inputSystems->ensureFieldHasInputSystem($inputSystemTag);
            $inputSystems->value($inputSystemTag);
        }
    }

    /**
     * Returns the current node error
     *
     * @return \models\languageforge\lexicon\LiftImportNodeError
     */
    public function currentNodeError() {
        return end($this->nodeErrors);
    }

    /**
     * Add and push the new subnode error
     *
     * @param string $type
     * @param string $identifier
     * @return \models\languageforge\lexicon\LiftImportNodeError
     */
    public function pushSubnodeError($type, $identifier) {
        $subnodeError = new LiftImportNodeError($type, $identifier);
        $this->currentNodeError()->addSubnodeError($subnodeError);
        $this->nodeErrors[] = $subnodeError;
        return $this->currentNodeError();
    }

    /**
     * Returns the import node error. If import is in progress it returns an empty node error.
     *
     * @return \models\languageforge\lexicon\LiftImportNodeError
     */
    public function getImportNodeError() {
        if (count($this->nodeErrors) == 1) {
            return $this->currentNodeError();
        }
        return new LiftImportNodeError('', '');
    }
}
