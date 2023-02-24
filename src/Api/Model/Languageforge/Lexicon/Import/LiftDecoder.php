<?php

namespace Api\Model\Languageforge\Lexicon\Import;

use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\Config\LexConfigFieldList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiOptionList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiText;
use Api\Model\Languageforge\Lexicon\Config\LexConfigOptionList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiParagraph;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexMultiText;
use Api\Model\Languageforge\Lexicon\LexMultiValue;
use Api\Model\Languageforge\Lexicon\LexParagraph;
use Api\Model\Languageforge\Lexicon\LexPicture;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;
use Palaso\Utilities\FileUtilities;

class LiftDecoder
{
    /**
     * @param LexProjectModel $project
     */
    public function __construct($project)
    {
        $this->project = $project;
        $this->nodeErrors = [];
        $this->knownUnhandledNodes = [];
    }

    /** @var array */
    public $liftFields;

    /** @var LexProjectModel */
    private $project;

    /**
     * node error stack
     *
     * @var LiftImportNodeError[]
     */
    private $nodeErrors;

    /** @var array <string => boolean> key is node identifier */
    private $knownUnhandledNodes;

    /**
     * @param \SimpleXMLElement $sxeNode
     * @param LexEntryModel $entry
     * @param string $mergeRule
     * @throws \Exception
     */
    public function readEntry($sxeNode, $entry, $mergeRule = LiftMergeRule::CREATE_DUPLICATES)
    {
        $this->nodeErrors = [];
        $this->nodeErrors[] = new LiftImportNodeError(LiftImportNodeError::ENTRY, (string) $sxeNode["guid"]);
        /** @var \SimpleXMLElement $element */
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case "lexical-unit":
                    if ($mergeRule != LiftMergeRule::IMPORT_LOSES || Id::isEmpty($entry->id)) {
                        $entry->guid = (string) $sxeNode["guid"];
                        $entry->authorInfo->createdDate = UniversalTimestamp::fromStringTimestamp(
                            (string) $sxeNode["dateCreated"]
                        );
                        $entry->authorInfo->modifiedDate = UniversalTimestamp::fromStringTimestamp(
                            (string) $sxeNode["dateModified"]
                        );
                        $entry->lexeme = $this->readMultiText(
                            $element,
                            $this->project->config->entry->fields[LexConfig::LEXEME]->inputSystems
                        );
                    }
                    break;
                case "citation":
                    $entry->citationForm = $this->readMultiText(
                        $element,
                        $this->project->config->entry->fields[LexConfig::CITATIONFORM]->inputSystems
                    );
                    break;
                case "note":
                    if ($element["type"] == "") {
                        $entry->note = $this->readMultiText(
                            $element,
                            $this->project->config->entry->fields[LexConfig::NOTE]->inputSystems
                        );
                    } else {
                        $this->addKnownUnhandledElement("Note: " . $element["type"]);
                    }
                    break;
                case "etymology":
                    $entry->etymology = $this->readMultiText(
                        $element,
                        $this->project->config->entry->fields[LexConfig::ETYMOLOGY]->inputSystems,
                        true
                    );
                    if ($element->{'gloss'}) {
                        $this->readMultiTextGloss(
                            $element->{'gloss'}[0],
                            $entry->etymologyGloss,
                            $this->project->config->entry->fields[LexConfig::ETYMOLOGYGLOSS]->inputSystems
                        );
                    }
                    foreach ($element->{'field'} as $field) {
                        if ($field["type"] == "comment") {
                            $entry->etymologyComment = $this->readMultiText(
                                $field,
                                $this->project->config->entry->fields[LexConfig::ETYMOLOGYCOMMENT]->inputSystems
                            );
                        } else {
                            $this->currentNodeError()->addUnhandledField("etymology: " . $field["type"]);
                        }
                    }
                    break;
                case "pronunciation":
                    $entry->pronunciation = $this->readMultiText(
                        $element,
                        $this->project->config->entry->fields[LexConfig::PRONUNCIATION]->inputSystems,
                        true
                    );
                    if ($element->{'media'}) {
                        $this->addKnownUnhandledElement("pronunciation: media");
                    }
                    break;
                case "field":
                    switch ($element["type"]) {
                        case "literal-meaning":
                            $entry->literalMeaning = $this->readMultiText(
                                $element,
                                $this->project->config->entry->fields[LexConfig::LITERALMEANING]->inputSystems
                            );
                            break;
                        case "summary-definition":
                            $entry->summaryDefinition = $this->readMultiText(
                                $element,
                                $this->project->config->entry->fields[LexConfig::SUMMARYDEFINITION]->inputSystems
                            );
                            break;
                        case "import-residue": // Currently ignored in LanguageForge
                            break;
                        default:
                            if ($this->isEntryCustomField($element["type"])) {
                                $this->addEntryCustomField($element, $element["type"], $entry);
                            } else {
                                $this->currentNodeError()->addUnhandledField($element["type"]);
                            }
                    }
                    break;
                case "trait":
                    switch ($element["name"]) {
                        case "morph-type":
                            $entry->morphologyType = \Normalizer::normalize((string) $element["value"]);
                            break;
                        case "do-not-publish-in":
                        case "DoNotUseForParsing":
                            $this->addKnownUnhandledElement("trait: " . $element["name"]);
                            break;
                        default:
                            if ($this->isEntryCustomField($element["name"])) {
                                $this->addEntryCustomField($element, $element["name"], $entry);
                            } else {
                                $this->currentNodeError()->addUnhandledTrait($element["name"]);
                            }
                    }
                    break;
                case "sense":
                    $liftId = "";
                    if (isset($element["id"])) {
                        $liftId = (string) $element["id"];
                    }
                    $existingSenseIndex = $entry->searchSensesFor("liftId", $liftId);
                    if ($existingSenseIndex >= 0) {
                        switch ($mergeRule) {
                            case LiftMergeRule::CREATE_DUPLICATES:
                                $sense = new LexSense("");
                                $entry->senses[] = $this->readSense($element, $sense);
                                break;
                            case LiftMergeRule::IMPORT_WINS:
                                $sense = new LexSense($liftId, Guid::extract($liftId));
                                $entry->senses[$existingSenseIndex] = $this->readSense($element, $sense);
                                break;
                            case LiftMergeRule::IMPORT_LOSES:
                                break;
                            default:
                                throw new \Exception("unknown LiftMergeRule " . $mergeRule);
                        }
                    } else {
                        $sense = new LexSense($liftId, Guid::extract($liftId));
                        $entry->senses[] = $this->readSense($element, $sense);
                    }
                    break;
                case "variant":
                case "relation":
                    $this->addKnownUnhandledElement("Element: " . $element->getName());
                    break;
                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        if (!$this->currentNodeError()->hasErrors()) {
            unset($this->nodeErrors[count($this->nodeErrors) - 1]);
        }
    }

    /**
     * Reads a Sense from the XmlNode $sxeNode
     *
     * @param \SimpleXMLElement $sxeNode
     * @param LexSense $sense
     * @return LexSense
     */
    public function readSense($sxeNode, $sense)
    {
        $this->addAndPushSubnodeError(LiftImportNodeError::SENSE, (string) $sxeNode["id"]);
        /** @var \SimpleXMLElement $element */
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case "definition":
                    $sense->definition = $this->readMultiText(
                        $element,
                        $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DEFINITION]
                            ->inputSystems
                    );
                    break;
                case "example":
                    $sense->examples[] = $this->readExample($element);
                    break;
                case "field":
                    switch ($element["type"]) {
                        case "import-residue": // Currently ignored by LanguageForge
                            break;
                        case "scientific-name":
                            $sense->scientificName = $this->readMultiText(
                                $element,
                                $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[
                                    LexConfig::SCIENTIFICNAME
                                ]->inputSystems
                            );
                            break;
                        default:
                            if ($this->isSenseCustomField($element["type"])) {
                                $this->addSenseCustomField($element, $element["type"], $sense);
                            } else {
                                $this->currentNodeError()->addUnhandledField($element["type"]);
                            }
                    }
                    break;
                case "gloss":
                    $this->readMultiTextGloss(
                        $element,
                        $sense->gloss,
                        $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GLOSS]
                            ->inputSystems
                    );
                    break;
                case "grammatical-info":
                    // Grammatical Category
                    $sense->partOfSpeech->value = \Normalizer::normalize((string) $element["value"]);
                    break;
                case "illustration":
                    $picture = new LexPicture();
                    $picture->fileName = \Normalizer::normalize((string) $element["href"]);
                    /** @var \SimpleXMLElement $child */
                    foreach ($element as $child) {
                        switch ($child->getName()) {
                            case "label":
                                $picture->caption = $this->readMultiText(
                                    $child,
                                    $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[
                                        LexConfig::PICTURES
                                    ]->inputSystems
                                );
                                break;
                            default:
                                $this->currentNodeError()->addUnhandledElement($child->getName());
                        }
                    }
                    $sense->pictures[] = $picture;
                    break;
                case "trait":
                    switch ($element["name"]) {
                        case "semantic-domain-ddp4":
                            if (preg_match("/^\d+(\.\d)*/", (string) $element["value"], $matches)) {
                                $sense->semanticDomain->value((string) $matches[0]);
                            }
                            break;
                        case "anthro-code":
                            $sense->anthropologyCategories->value((string) $element["value"]);
                            break;
                        case "domain-type":
                            $sense->academicDomains->value((string) $element["value"]);
                            break;
                        case "sense-type":
                            $sense->senseType->value((string) $element["value"]);
                            break;
                        case "status":
                            $sense->status->value((string) $element["value"]);
                            break;
                        case "usage-type":
                            $sense->usages->value((string) $element["value"]);
                            break;
                        case "do-not-publish-in":
                        case "DoNotUseForParsing":
                            $this->addKnownUnhandledElement("trait: " . $element["name"]);
                            break;
                        default:
                            if ($this->isSenseCustomField($element["name"])) {
                                $this->addSenseCustomField($element, $element["name"], $sense);
                            } else {
                                $this->currentNodeError()->addUnhandledTrait($element["name"]);
                            }
                    }
                    break;
                case "relation":
                case "reversal":
                    $this->addKnownUnhandledElement("Element: " . $element->getName());
                    break;
                case "note":
                    $this->addKnownUnhandledElement("Note: " . $element["type"]);
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
     * @param \SimpleXMLElement $sxeNode
     * @return LexExample
     */
    public function readExample($sxeNode)
    {
        $example = new LexExample((string) $sxeNode["source"]);
        $this->addAndPushSubnodeError(LiftImportNodeError::EXAMPLE, (string) $sxeNode["source"]);

        $example->sentence = $this->readMultiText(
            $sxeNode,
            $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[
                LexConfig::EXAMPLE_SENTENCE
            ]->inputSystems,
            true
        );
        /** @var \SimpleXMLElement $element */
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case "form":
                    // this is handled above when reading Example Sentence MultiText
                    break;
                case "translation":
                    $example->translation = $this->readMultiText(
                        $element,
                        $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]
                            ->fields[LexConfig::EXAMPLE_TRANSLATION]->inputSystems
                    );
                    break;
                case "field":
                    if ($this->isExampleCustomField($element["type"])) {
                        $this->addExampleCustomField($element, $element["type"], $example);
                    } else {
                        $this->currentNodeError()->addUnhandledField($element["type"]);
                    }
                    break;
                case "trait":
                    if ($this->isExampleCustomField($element["name"])) {
                        $this->addExampleCustomField($element, $element["name"], $example);
                    } else {
                        $this->currentNodeError()->addUnhandledTrait($element["name"]);
                    }
                    break;
                case "note":
                    $this->addKnownUnhandledElement("Note: " . $element["type"]);
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
     * @param \SimpleXMLElement $sxeNode
     * @param ArrayOf $inputSystems
     * @param bool $ignoreErrors
     * @return LexMultiText
     */
    public function readMultiText($sxeNode, $inputSystems = null, $ignoreErrors = false)
    {
        $multiText = new LexMultiText();
        $this->addAndPushSubnodeError(LiftImportNodeError::MULTITEXT, $sxeNode->getName());
        /** @var \SimpleXMLElement $element */
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case "form":
                    $inputSystemTag = \Normalizer::normalize((string) $element["lang"]);
                    $value = self::sanitizeSpans(
                        dom_import_simplexml($element->{'text'}[0]),
                        $inputSystemTag,
                        $this->currentNodeError()
                    );
                    $multiText->form($inputSystemTag, $value);
                    $this->project->addInputSystem($inputSystemTag);
                    if (isset($inputSystems)) {
                        $inputSystems->ensureValueExists($inputSystemTag);
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
     * @param \SimpleXMLElement $sxeNode
     * @param LexMultiText $multiText
     * @param ArrayOf $inputSystems
     * @throws \Exception
     */
    public function readMultiTextGloss($sxeNode, $multiText, $inputSystems = null)
    {
        CodeGuard::checkTypeAndThrow($multiText, "Api\Model\Languageforge\Lexicon\LexMultiText");
        if ($sxeNode->getName() != "gloss") {
            throw new \Exception("'" . $sxeNode->getName() . "' is not a gloss");
        }
        $inputSystemTag = \Normalizer::normalize((string) $sxeNode["lang"]);
        // Some LIFT files can have multiple <gloss> elements which are supposed to be separated by a semicolon-space
        // pair, so we use appendForm() here instead of form(). 2019-09 RM
        $multiText->appendForm($inputSystemTag, (string) $sxeNode->{'text'}, "; ");

        $this->project->addInputSystem($inputSystemTag);
        if (isset($inputSystems)) {
            $inputSystems->ensureValueExists($inputSystemTag);
        }
    }

    /**
     * Reads a MultiParagraph from the XmlNode $sxeNode given by the element 'form'
     *
     * @param \SimpleXMLElement $sxeNode
     * @return LexMultiParagraph
     */
    public function readMultiParagraph($sxeNode)
    {
        // paragraph separator character U+2029
        $paraSeparator = mb_convert_encoding("&#x2029;", "UTF-8", "HTML-ENTITIES");
        $multiParagraph = new LexMultiParagraph();
        $this->addAndPushSubnodeError(LiftImportNodeError::MULTIPARAGRAPH, $sxeNode->getName());
        /** @var \SimpleXMLElement $element */
        foreach ($sxeNode as $element) {
            switch ($element->getName()) {
                case "form":
                    $inputSystemTag = \Normalizer::normalize((string) $element["lang"]);
                    $multiParagraph->inputSystem = $inputSystemTag;
                    $value = self::sanitizeSpans(
                        dom_import_simplexml($element->{'text'}[0]),
                        $inputSystemTag,
                        $this->currentNodeError()
                    );
                    foreach (explode($paraSeparator, $value) as $content) {
                        $paragraph = new LexParagraph();
                        if ($content) {
                            $paragraph->content = $content;
                        }
                        $multiParagraph->paragraphs->append($paragraph);
                    }
                    $this->project->addInputSystem($inputSystemTag);
                    break;
                default:
                    $this->currentNodeError()->addUnhandledElement($element->getName());
            }
        }
        array_pop($this->nodeErrors);

        return $multiParagraph;
    }

    /**
     * Recursively sanitizes the element only allowing <span> elements through; coverts everything else to text
     *  - also removes native language spans, i.e those that match the input system tag
     *
     * @param \DOMElement $textDom
     * @param string $inputSystemTag
     * @param LiftImportNodeError $currentNodeError
     * @return string
     */
    public static function sanitizeSpans($textDom, $inputSystemTag, $currentNodeError = null)
    {
        $textStr = "";
        foreach ($textDom->childNodes as $child) {
            if ($child->nodeType == XML_TEXT_NODE) {
                $childTextStr = \Normalizer::normalize($child->textContent);
            } else {
                if ($currentNodeError && $child->nodeName != "span") {
                    $currentNodeError->addUnhandledElement($child->nodeName);
                }

                // recurse to sanitize child node
                $childTextStr = self::sanitizeSpans($child, $inputSystemTag, $currentNodeError);
            }
            if ($child->nodeName == "span") {
                $spanTag = "<span";
                $isNativeSpan = false;
                foreach ($child->attributes as $attribute) {
                    $spanTag .= " " . $attribute->name . '="' . $attribute->value . '"';
                    if ($attribute->name == "lang" && $attribute->value == $inputSystemTag) {
                        $isNativeSpan = true;
                    }
                }
                $spanTag .= ">";
                if ($isNativeSpan) {
                    $textStr .= $childTextStr;
                } else {
                    $textStr .= $spanTag . $childTextStr . "</span>";
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
    public function isEntryCustomField($nodeId)
    {
        return $this->isCustomField($nodeId, "LexEntry");
    }

    /**
     * Check if the supplied sense node is listed in the custom LIFT fields
     *
     * @param string $nodeId
     * @return boolean
     */
    public function isSenseCustomField($nodeId)
    {
        return $this->isCustomField($nodeId, "LexSense");
    }

    /**
     * Check if the supplied example node is listed in the custom LIFT fields
     *
     * @param string $nodeId
     * @return boolean
     */
    public function isExampleCustomField(string $nodeId)
    {
        return $this->isCustomField($nodeId, "LexExampleSentence");
    }

    /**
     * Check if the supplied node is listed in the custom LIFT fields given the Lex level Class
     *
     * @param string $nodeId
     * @param string $levelClass
     * @return boolean
     */
    private function isCustomField(string $nodeId, string $levelClass)
    {
        $fieldType = FileUtilities::replaceSpecialCharacters($nodeId);
        $customFieldSpecs = $this->getCustomFieldSpecs($fieldType);
        if (
            array_key_exists("Class", $customFieldSpecs) &&
            $customFieldSpecs["Class"] == $levelClass &&
            $this->isCustomFieldType($customFieldSpecs)
        ) {
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
    private function isCustomFieldType($customFieldSpecs)
    {
        if (
            array_key_exists("Type", $customFieldSpecs) &&
            ($customFieldSpecs["Type"] == "MultiUnicode" ||
                $customFieldSpecs["Type"] == "String" ||
                $customFieldSpecs["Type"] == "OwningAtom" ||
                $customFieldSpecs["Type"] == "ReferenceAtom" ||
                $customFieldSpecs["Type"] == "ReferenceCollection")
        ) {
            return true;
        }
        return false;
    }

    /**
     * Add node as a custom entry field
     *
     * @param \SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param LexEntryModel $entry
     */
    public function addEntryCustomField($sxeNode, $nodeId, $entry)
    {
        $this->addCustomField($sxeNode, $nodeId, "customField_entry_", $this->project->config->entry, $entry);
    }

    /**
     * Add node as a custom sense field
     *
     * @param \SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param LexSense $sense
     */
    public function addSenseCustomField($sxeNode, $nodeId, $sense)
    {
        $this->addCustomField(
            $sxeNode,
            $nodeId,
            "customField_senses_",
            $this->project->config->entry->fields[LexConfig::SENSES_LIST],
            $sense
        );
    }

    /**
     * Add node as a custom example field
     *
     * @param \SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param LexExample $example
     */
    public function addExampleCustomField($sxeNode, $nodeId, $example)
    {
        $this->addCustomField(
            $sxeNode,
            $nodeId,
            "customField_examples_",
            $this->project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST],
            $example
        );
    }

    /**
     * Add node as a custom field
     *
     * @param \SimpleXMLElement $sxeNode
     * @param string $nodeId
     * @param string $customFieldNamePrefix
     * @param LexConfigFieldList $levelConfig
     * @param LexEntryModel|LexSense|LexExample $item
     */
    private function addCustomField($sxeNode, $nodeId, $customFieldNamePrefix, $levelConfig, $item)
    {
        $fieldType = \Normalizer::normalize(FileUtilities::replaceSpecialCharacters($nodeId));
        $customFieldSpecs = $this->getCustomFieldSpecs($fieldType);
        $customFieldName = $this->createCustomField(
            $fieldType,
            $customFieldNamePrefix,
            $customFieldSpecs,
            $levelConfig
        );
        if ($customFieldSpecs["Type"] == "ReferenceAtom") {
            $item->customFields[$customFieldName] = new LexValue();
            $item->customFields[$customFieldName]->value((string) $sxeNode["value"]);
        } elseif ($customFieldSpecs["Type"] == "ReferenceCollection") {
            if (!$item->customFields->offsetExists($customFieldName)) {
                $item->customFields[$customFieldName] = new LexMultiValue();
            }
            $item->customFields[$customFieldName]->value((string) $sxeNode["value"]);
        } elseif ($customFieldSpecs["Type"] == "OwningAtom") {
            $item->customFields[$customFieldName] = $this->readMultiParagraph($sxeNode);
        } else {
            $item->customFields[$customFieldName] = $this->readMultiText(
                $sxeNode,
                $levelConfig->fields[$customFieldName]->inputSystems
            );
        }
    }

    /**
     * Create custom field config
     *
     * @param string $fieldType
     * @param string $customFieldNamePrefix
     * @param array $customFieldSpecs
     * @param LexConfigFieldList $levelConfig
     * @return string $customFieldName
     */
    private function createCustomField($fieldType, $customFieldNamePrefix, $customFieldSpecs, $levelConfig)
    {
        $customFieldName = $customFieldNamePrefix . str_replace(" ", "_", $fieldType);
        $levelConfig->fieldOrder->ensureValueExists($customFieldName);
        if (!$levelConfig->fields->offsetExists($customFieldName)) {
            if ($customFieldSpecs["Type"] == "ReferenceAtom") {
                $levelConfig->fields[$customFieldName] = new LexConfigOptionList();
                $levelConfig->fields[$customFieldName]->listCode = $customFieldSpecs["range"];
            } elseif ($customFieldSpecs["Type"] == "ReferenceCollection") {
                $levelConfig->fields[$customFieldName] = new LexConfigMultiOptionList();
                $levelConfig->fields[$customFieldName]->listCode = $customFieldSpecs["range"];
            } elseif ($customFieldSpecs["Type"] == "OwningAtom") {
                $levelConfig->fields[$customFieldName] = new LexConfigMultiParagraph();
            } else {
                $levelConfig->fields[$customFieldName] = new LexConfigMultiText();
            }
            $levelConfig->fields[$customFieldName]->label = $fieldType;
            $levelConfig->fields[$customFieldName]->hideIfEmpty = false;
        }

        LexProjectCommands::createNewCustomFieldViews(
            $customFieldName,
            $customFieldSpecs["Type"],
            $this->project->config
        );

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
    private function getCustomFieldSpecs($fieldType)
    {
        $specs = [];
        if (
            array_key_exists($fieldType, $this->liftFields) &&
            array_key_exists("qaa-x-spec", $this->liftFields[$fieldType])
        ) {
            $specsList = explode("; ", $this->liftFields[$fieldType]["qaa-x-spec"]);
            foreach ($specsList as $spec) {
                $items = explode("=", $spec);
                $specs[$items[0]] = $items[1];
            }
        }
        return $specs;
    }

    /**
     * Returns the current node error
     *
     * @return LiftImportNodeError
     */
    public function currentNodeError()
    {
        return end($this->nodeErrors);
    }

    /**
     * Add and push the new subnode error
     *
     * @param string $type
     * @param string $identifier
     * @return LiftImportNodeError
     */
    public function addAndPushSubnodeError($type, $identifier)
    {
        $subnodeError = new LiftImportNodeError($type, $identifier);
        $this->currentNodeError()->addSubnodeError($subnodeError);
        $this->nodeErrors[] = $subnodeError;
        return $this->currentNodeError();
    }

    /**
     * Returns the import node error. If import is in progress it returns an empty node error.
     *
     * @return LiftImportNodeError
     */
    public function getImportNodeError()
    {
        if (count($this->nodeErrors) == 1) {
            return $this->currentNodeError();
        }
        return new LiftImportNodeError("", "");
    }

    /**
     * @param string $name
     */
    public function addKnownUnhandledElement($name)
    {
        $index = (string) $name;
        if (!array_key_exists($index, $this->knownUnhandledNodes)) {
            $this->knownUnhandledNodes[$index] = true;
            $this->currentNodeError()->addUnhandledElement($index);
        }
    }
}
