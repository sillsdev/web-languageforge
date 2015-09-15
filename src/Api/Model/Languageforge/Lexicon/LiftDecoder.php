<?php

namespace Api\Model\Languageforge\Lexicon;

use Palaso\Utilities\CodeGuard;
use Palaso\Utilities\FileUtilities;
use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Languageforge\Lexicon\Config\LexiconFieldListConfigObj;
use Api\Model\Languageforge\Lexicon\Config\LexiconMultiOptionlistConfigObj;
use Api\Model\Languageforge\Lexicon\Config\LexiconMultitextConfigObj;
use Api\Model\Languageforge\Lexicon\Config\LexiconOptionlistConfigObj;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;

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
        $this->knownUnhandledNodes = array();
    }

    /**
     *
     * @var array
     */
    public $liftFields;

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
     *
     * @var array <string => boolean> key is node identifier
     */
    private $knownUnhandledNodes;

    /**
     *
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
                        $this->addKnownUnhandledElement('Note: ' . $element['type']);
                    }
                    break;
                case 'etymology':
                   $entry->etymology = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::ETYMOLOGY]->inputSystems, true);
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
                    $entry->pronunciation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::PRONUNCIATION]->inputSystems, true);
                    if ($element->{'media'}) {
                        $this->addKnownUnhandledElement('pronunciation: media');
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
                            if ($this->isEntryCustomField($element['type'])) {
                                $this->addEntryCustomField($element, $element['type'], $entry);
                            } else {
                                $this->currentNodeError()->addUnhandledField($element['type']);
                            }
                    }
                    break;
                case 'trait':
                    switch ($element['name']) {
                        case 'morph-type':
                            $entry->morphologyType = (string)$element['value'];
                            break;
                        case 'do-not-publish-in':
                        case 'DoNotUseForParsing':
                            $this->addKnownUnhandledElement('trait: ' . $element['name']);
                            break;
                        default:
                            if ($this->isEntryCustomField($element['name'])) {
                                $this->addEntryCustomField($element, $element['name'], $entry);
                            } else {
                                $this->currentNodeError()->addUnhandledTrait($element['name']);
                            }
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
                                $sense = new Sense($liftId);
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
                case 'variant':
                case 'relation':
                    $this->addKnownUnhandledElement('Element: ' . $element->getName());
                    break;
                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        if (!$this->currentNodeError()->hasErrors()) {
            unset($this->nodeErrors[count($this->nodeErrors)-1]);
        }
    }

    /**
     * Reads a Sense from the XmlNode $sxeNode
     *
     * @param SimpleXMLElement $sxeNode
     * @param Sense $sense
     * @return Sense
     */
    public function readSense($sxeNode, $sense)
    {
        $this->addAndPushSubnodeError(LiftImportNodeError::SENSE, (string) $sxeNode['id']);
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
                            if ($this->isSenseCustomField($element['type'])) {
                                $this->addSenseCustomField($element, $element['type'], $sense);
                            } else {
                                $this->currentNodeError()->addUnhandledField($element['type']);
                            }
                    }
                    break;
                case 'gloss':
                    $this->readMultiTextGloss($element, $sense->gloss, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems);
                    break;
                case 'grammatical-info':
                    // Part Of Speech
                    $sense->partOfSpeech->value = (string) $element['value'];
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
                        case 'do-not-publish-in':
                        case 'DoNotUseForParsing':
                            $this->addKnownUnhandledElement('trait: ' . $element['name']);
                            break;
                        default:
                            if ($this->isSenseCustomField($element['name'])) {
                                $this->addSenseCustomField($element, $element['name'], $sense);
                            } else {
                                $this->currentNodeError()->addUnhandledTrait($element['name']);
                            }
                    }
                    break;
                case 'relation':
                case 'reversal':
                    $this->addKnownUnhandledElement('Element: ' . $element->getName());
                    break;
                case 'note':
                    $this->addKnownUnhandledElement('Note: ' . $element['type']);
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
     *
     * @param SimpleXMLElement $sxeNode
     * @return Example
     */
    public function readExample($sxeNode)
    {
        $example = new Example((string) $sxeNode['source']);
        $this->addAndPushSubnodeError(LiftImportNodeError::EXAMPLE, (string) $sxeNode['source']);

        $example->sentence = $this->readMultiText($sxeNode, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems, true);
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case 'form':
                    // this is handled above when reading Example Sentence MultiText
                    break;
                case 'translation':
                    $example->translation = $this->readMultiText($element, $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems);
                    break;
                case 'field':
                    if ($this->isExampleCustomField($element['type'])) {
                        $this->addExampleCustomField($element, $element['type'], $example);
                    } else {
                        $this->currentNodeError()->addUnhandledField($element['type']);
                    }
                    break;
                case 'trait':
                    if ($this->isExampleCustomField($element['name'])) {
                        $this->addExampleCustomField($element, $element['name'], $example);
                    } else {
                        $this->currentNodeError()->addUnhandledTrait($element['name']);
                    }
                    break;
                case 'note':
                    $this->addKnownUnhandledElement('Note: ' . $element['type']);
                    break;
                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        array_pop($this->nodeErrors);

        return $example;
    }

    /**
     * Reads a MultiText from the XmlNode $sxeNode given by the element 'form'
     *
     * @param SimpleXMLElement $sxeNode
     * @param ArrayOf $inputSystems
     * @param bool $ignoreErrors
     * @return MultiText
     */
    public function readMultiText($sxeNode, $inputSystems = null, $ignoreErrors = false)
    {
        $multiText = new MultiText();
        $this->addAndPushSubnodeError(LiftImportNodeError::MULTITEXT, $sxeNode->getName());
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case 'form':
                    $inputSystemTag = (string) $element['lang'];
                    $multiText->form($inputSystemTag, $this->sanitizeSpans(dom_import_simplexml($element->text), $inputSystemTag));

                    $this->projectModel->addInputSystem($inputSystemTag);
                    // TODO InputSystems should extend ArrayOf (or Map) and become more useful. CP 2014-10
                    if (isset($inputSystems)) {
                        // i.e. $inputSystems->ensureFieldHasInputSystem($inputSystemTag);
                        $inputSystems->value($inputSystemTag);
                    }
                    break;
                default:
                    if (!$ignoreErrors) {
                        $this->currentNodeError()->addUnhandledElement($element->getName());
                    }
            }
        }
        array_pop($this->nodeErrors);

        return $multiText;
    }

    /**
     * Reads a MultiText from the XmlNode $sxeNode given by the element 'gloss'
     *
     * @param SimpleXMLElement $sxeNode
     * @param MultiText $multiText
     * @param ArrayOf $inputSystems
     * @return MultiText
     */
    public function readMultiTextGloss($sxeNode, $multiText, $inputSystems = null)
    {
        CodeGuard::checkTypeAndThrow($multiText, 'Api\Model\Languageforge\Lexicon\MultiText');
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
     * Recursively sanitizes the element only allowing <span> elements through; coverts everthing else to text
     *  - also removes native language spans, i.e those that match the input system tag
     *
     * @param DOMDocument $textDom
     * @param string $inputSystemTag
     * @return string
     */
    public function sanitizeSpans($textDom, $inputSystemTag)
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
                $childTextStr = $this->{__FUNCTION__}($child, $inputSystemTag);
            }
            if ($child->nodeName == 'span') {
                $spanTag = '<span';
                $isNativeSpan = false;
                foreach ($child->attributes as $attribute) {
                    $spanTag .= ' ' . $attribute->name . '="' . $attribute->value . '"';
                    if ($attribute->name == 'lang' && $attribute->value == $inputSystemTag) {
                        $isNativeSpan = true;
                    }
                }
                $spanTag .= '>';
                if ($isNativeSpan) {
                    $textStr .= $childTextStr;
                } else {
                    $textStr .= $spanTag . $childTextStr . '</span>';

                }
            } else {
                $textStr .= $childTextStr;
            }
        }
        return $textStr;
    }

    /**
     * Check if the supplied entry node is listed in the custom LIFT fields
     *
     * @param string $nodeId
     * @return boolean
     */
    public function isEntryCustomField($nodeId) {
        return $this->isCustomField($nodeId, 'LexEntry');
    }

    /**
     * Check if the supplied sense node is listed in the custom LIFT fields
     *
     * @param string $nodeId
     * @return boolean
     */
    public function isSenseCustomField($nodeId) {
        return $this->isCustomField($nodeId, 'LexSense');
    }

    /**
     * Check if the supplied example node is listed in the custom LIFT fields
     *
     * @param string $nodeId
     * @return boolean
     */
    public function isExampleCustomField($nodeId) {
        return $this->isCustomField($nodeId, 'LexExampleSentence');
    }

    /**
     * Check if the supplied node is listed in the custom LIFT fields given the Lex level Class
     *
     * @param string $nodeId
     * @param string $levelClass
     * @return boolean
     */
    private function isCustomField($nodeId, $levelClass) {
        $fieldType = FileUtilities::replaceSpecialCharacters($nodeId);
        $customFieldSpecs = $this->getCustomFieldSpecs($fieldType);
        if (array_key_exists('Class', $customFieldSpecs) &&
            $customFieldSpecs['Class'] == $levelClass &&
            $this->isCustomFieldType($customFieldSpecs)) {
            return true;
        }
        return false;
    }

    /**
     * Check if the supplied node is a supported custom LIFT field type
     *
     * @param array<string> $customFieldSpecs
     * @return boolean
     */
    private function isCustomFieldType($customFieldSpecs) {
        if (array_key_exists('Type', $customFieldSpecs) &&
            ($customFieldSpecs['Type'] == 'MultiUnicode' ||
                $customFieldSpecs['Type'] == 'String' ||
                $customFieldSpecs['Type'] == 'OwningAtom' ||
                $customFieldSpecs['Type'] == 'ReferenceAtom' ||
                $customFieldSpecs['Type'] == 'ReferenceCollection')) {
            return true;
        }
        return false;
    }

    /**
     * Add node as a custom entry field
     *
     * @param SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param LexEntryModel $entry
     */
    public function addEntryCustomField($sxeNode, $nodeId, $entry) {
        $this->addCustomField($sxeNode, $nodeId, 'customField_entry_', $this->projectModel->config->entry, $entry);
    }

    /**
     * Add node as a custom sense field
     *
     * @param SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param Sense $sense
     */
    public function addSenseCustomField($sxeNode, $nodeId, $sense) {
        $this->addCustomField($sxeNode, $nodeId, 'customField_senses_', $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST], $sense);
    }

    /**
     * Add node as a custom example field
     *
     * @param SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param Example $example
     */
    public function addExampleCustomField($sxeNode, $nodeId, $example) {
        $this->addCustomField($sxeNode, $nodeId, 'customField_examples_', $this->projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST], $example);
    }

    /**
     * Add node as a custom field
     *
     * @param SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param string $customFieldNamePrefix
     * @param array $customFieldSpecs
     * @param LexiconFieldListConfigObj $levelConfig
     * @param LexEntryModel|Sense|Example $item
     */
    private function addCustomField($sxeNode, $nodeId, $customFieldNamePrefix, $levelConfig, $item) {
        $fieldType = FileUtilities::replaceSpecialCharacters($nodeId);
        $customFieldSpecs = $this->getCustomFieldSpecs($fieldType);
        $customFieldName = $this->createCustomField($nodeId, $fieldType, $customFieldNamePrefix, $customFieldSpecs, $levelConfig);
        if ($customFieldSpecs['Type'] == 'ReferenceAtom') {
            $item->customFields[$customFieldName] = new LexiconField();
            $item->customFields[$customFieldName]->value = (string) $sxeNode['value'];
        } elseif ($customFieldSpecs['Type'] == 'ReferenceCollection') {
            if (! array_key_exists($customFieldName, $item->customFields)) {
                $item->customFields[$customFieldName] = new LexiconMultiValueField();
            }
            $item->customFields[$customFieldName]->value((string) $sxeNode['value']);
        } elseif ($customFieldSpecs['Type'] == 'OwningAtom') {
            $multiText = $this->readMultiText($sxeNode, $levelConfig->fields[$customFieldName]->inputSystems);
            $item->customFields[$customFieldName] = self::convertMultiParaMultiText($multiText);
        } else {
            $item->customFields[$customFieldName] = $this->readMultiText($sxeNode, $levelConfig->fields[$customFieldName]->inputSystems);
        }
    }

    /**
     * Create custom field config
     *
     * @param string $nodeId
     * @param string $fieldType
     * @param string $customFieldNamePrefix
     * @param array $customFieldSpecs
     * @param LexiconFieldListConfigObj $levelConfig
     * @return string $customFieldName
     */
    private function createCustomField($nodeId, $fieldType, $customFieldNamePrefix, $customFieldSpecs, $levelConfig) {
        $customFieldName = $customFieldNamePrefix . str_replace(' ', '_', $fieldType);
        $levelConfig->fieldOrder->value($customFieldName);
        if (! array_key_exists($customFieldName, $levelConfig->fields)) {
            if ($customFieldSpecs['Type'] == 'ReferenceAtom') {
                $levelConfig->fields[$customFieldName] = new LexiconOptionlistConfigObj();
                $levelConfig->fields[$customFieldName]->listCode = $customFieldSpecs['range'];
            } elseif ($customFieldSpecs['Type'] == 'ReferenceCollection') {
                $levelConfig->fields[$customFieldName] = new LexiconMultiOptionlistConfigObj();
                $levelConfig->fields[$customFieldName]->listCode = $customFieldSpecs['range'];
            } else {
                $levelConfig->fields[$customFieldName] = new LexiconMultitextConfigObj();
                if ($customFieldSpecs['Type'] == 'OwningAtom') {
                    $levelConfig->fields[$customFieldName]->displayMultiline = true;
                }
            }
            $levelConfig->fields[$customFieldName]->label = $fieldType;
            $levelConfig->fields[$customFieldName]->hideIfEmpty = false;
        }
        foreach ($this->projectModel->config->roleViews as $role => $roleView) {
            if (! array_key_exists($customFieldName, $roleView->fields)) {
                if ($customFieldSpecs['Type'] == 'ReferenceAtom') {
                    $roleView->fields[$customFieldName] = new LexViewFieldConfig();
                } else {
                    $roleView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                }
                if ($role == LexiconRoles::MANAGER) {
                    $roleView->fields[$customFieldName]->show = true;
                }
            }
        }
        foreach ($this->projectModel->config->userViews as $userId => $userView) {
            if (! array_key_exists($customFieldName, $userView->fields)) {
                if ($customFieldSpecs['Type'] == 'ReferenceAtom') {
                    $userView->fields[$customFieldName] = new LexViewFieldConfig();
                } else {
                    $userView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                }
            }
        }

        return $customFieldName;
    }

    /**
     * Parse custom field specs list and return keyed array
     * Example specs = 'Class=LexEntry; Type=ReferenceAtom; DstCls=CmPossibility; range=domain-type'
     * Return array(
     *      'Class' => 'LexEntry',
     *      'Type' => 'ReferenceAtom',
     *      'DstCls' => 'CmPossibility',
     *      'range' => 'domain-type'
     *  );
     *
     * @param string $fieldType
     * @return array
     */
    private function getCustomFieldSpecs($fieldType) {
        $specs = array();
        if (array_key_exists($fieldType, $this->liftFields) &&
            array_key_exists('qaa-x-spec', $this->liftFields[$fieldType])) {
            $specsList = explode('; ', $this->liftFields[$fieldType]['qaa-x-spec']);
            foreach ($specsList as $spec) {
                $items = explode('=', $spec);
                $specs[$items[0]] = $items[1];
            }
        }
        return $specs;
    }

    /**
     * Convert MuiltPara fields from FLEx by adding paragraph markup
     *
     * @param MultiText $multiText
     * @return MultiText
     */
    public static function convertMultiParaMultiText($multiText) {
        $paraSeparator = mb_convert_encoding('&#x2029;', 'UTF-8', 'HTML-ENTITIES');
        foreach ($multiText as $tag => $text) {
            // replace paragraph separator character U+2029 with paragraph markup
            $text->value = "<p>" . $text->value . "</p>";
            $text->value = str_replace($paraSeparator, "</p><p>", $text->value);
        }
        return $multiText;
    }

    /**
     * Returns the current node error
     *
     * @return \Api\Model\Languageforge\Lexicon\LiftImportNodeError
     */
    public function currentNodeError() {
        return end($this->nodeErrors);
    }

    /**
     * Add and push the new subnode error
     *
     * @param string $type
     * @param string $identifier
     * @return \Api\Model\Languageforge\Lexicon\LiftImportNodeError
     */
    public function addAndPushSubnodeError($type, $identifier) {
        $subnodeError = new LiftImportNodeError($type, $identifier);
        $this->currentNodeError()->addSubnodeError($subnodeError);
        $this->nodeErrors[] = $subnodeError;
        return $this->currentNodeError();
    }

    /**
     * Returns the import node error. If import is in progress it returns an empty node error.
     *
     * @return \Api\Model\Languageforge\Lexicon\LiftImportNodeError
     */
    public function getImportNodeError() {
        if (count($this->nodeErrors) == 1) {
            return $this->currentNodeError();
        }
        return new LiftImportNodeError('', '');
    }

    public function addKnownUnhandledElement($name) {
        $index = (string)$name;
        if (!array_key_exists($index, $this->knownUnhandledNodes)) {
            $this->knownUnhandledNodes[$index] = true;
            $this->currentNodeError()->addUnhandledElement($index);
        }
    }
}
