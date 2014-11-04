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
    }

    /**
     *
     * @var LexiconProjectModel
     */
    private $projectModel;

    /**
     *
     * @var LiftImportNodeError
     */
    private $nodeError;

    /**
     * @param SimpleXMLElement $sxeNode
     * @param LexEntryModel $entry
     * @param LiftMergeRule $mergeRule
     * @throws \Exception
     */
    public function readEntry($sxeNode, $entry, $mergeRule = LiftMergeRule::CREATE_DUPLICATES)
    {
        $this->nodeError = new LiftImportNodeError(LiftImportNodeError::ENTRY, (string) $sxeNode['guid']);
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
                        $this->nodeError->addUnhandledNote($element['type']);
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
                            $this->nodeError->addUnhandledField($field['type'], 'etymology');
                        }
                    }
                    break;
                case 'pronunciation':
                    $entry->pronunciation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::PRONUNCIATION]->inputSystems);
                    if ($element->{'media'}) {
                        $this->nodeError->addUnhandledMedia($element->{'media'}['href'], 'pronunciation');
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
                            $this->nodeError->addUnhandledField($element['type']);
                    }
                    break;
                case 'trait':
                    switch ($element['name']) {
                        case 'morph-type':
                            $entry->morphologyType = (string)$element['value'];
                            break;
                        default:
                            $this->nodeError->addUnhandledTrait($element['name']);
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
                    $this->nodeError->addUnhandledElement($element->getName());
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
        $this->nodeError->addSubnodeError(new LiftImportNodeError(LiftImportNodeError::SENSE, (string) $sxeNode['id']));
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
                            $this->nodeError->currentSubnodeError()->addUnhandledField($element['type']);
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
                    $picture->caption = $this->readMultiText($element->{'label'}, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->inputSystems);
                    $sense->pictures[] =  $picture;
//                     $this->nodeError->currentSubnodeError()->addUnhandledMedia($element['href'], 'illustration');
                    break;
                case 'note':
                    switch($element['type']) {
                        case '':
                            $this->nodeError->currentSubnodeError()->addUnhandledNote($element['type']);
                            break;
                        default:
                            $this->nodeError->currentSubnodeError()->addUnhandledNote($element['type']);
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
                            $this->nodeError->currentSubnodeError()->addUnhandledTrait($element['name']);
                    }
                    break;

                default:
                    $this->nodeError->currentSubnodeError()->addUnhandledElement($element->getName());
            }
        }

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
        $this->nodeError->currentSubnodeError()->addSubnodeError(new LiftImportNodeError(LiftImportNodeError::EXAMPLE, (string) $sxeNode['id']));
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
            	case 'form':
                    $example->sentence = $this->readMultiText($sxeNode, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems);
            	    break;
                case 'translation':
                    $example->translation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems);
            	    break;
        	    default:
        	        $this->nodeError->currentSubnodeError()->currentSubnodeError()->addUnhandledElement($element->getName());
            }
        }

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
        if (isset($sxeNode->form)) {
            foreach ($sxeNode->form as $form) {
                $inputSystemTag = (string) $form['lang'];
                $multiText->form($inputSystemTag, $this->convertSpans($form->text));

                $this->projectModel->addInputSystem($inputSystemTag);
                // TODO InputSystems should extend ArrayOf (or Map) and become more useful. CP 2014-10
                if (isset($inputSystems)) {
                    // i.e. $inputSystems->ensureFieldHasInputSystem($inputSystemTag);
                    $inputSystems->value($inputSystemTag);
                }
            }
        }

        return $multiText;
    }

    /**
     * Converts <span> elements inside an XmlNode $textNode to strings
     * @param SimpleXMLElement $textNode
     * @return string
     */
    public function convertSpans($textNode)
    {
        if ($textNode->count()) {
            // Keep it simple for now: just treat $textNode->asXML() as a string,
            // and strip <text> from the front and </text> from the back of that string.
            $textStr = $textNode->asXML();
            return substr($textStr, 6, -7);
        } else {
            return (string) $textNode;
        }
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

    public function getImportNodeError() {
        return $this->nodeError;
    }
}
