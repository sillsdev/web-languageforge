<?php
namespace Api\Library\Shared\Script\Migration;

    use Api\Model\Languageforge\Lexicon\LexEntryListModel;
    use Api\Model\Languageforge\Lexicon\LexEntryModel;
    use Api\Model\Languageforge\Lexicon\LexiconMultiValueField;
    use Api\Model\Languageforge\Lexicon\Sense;
    use Api\Model\Mapper\ArrayOf;
    use Api\Model\ProjectListModel;
    use Api\Model\ProjectModel;

class FixSemanticDomainKey
{
    public function run($mode = 'test')
    {
        $testMode = ($mode == 'test');
        $message = "Fix SemanticDomain Keys to only store numbers\n\n";

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $projectIds = array_map(function ($e) { return $e['id'];}, $projectlist->entries);

        foreach ($projectIds as $projectId) {
            $projectModel = new ProjectModel($projectId);
            $message .= "----------------\nA new project: $projectModel->projectCode id: $projectId\n";

            $entryList = new LexEntryListModel($projectModel);
            $entryList->read();

            foreach ($entryList->entries as $entryListItem) {
                $entry = new LexEntryModel($projectModel, $entryListItem['id']);
                $message .= "Entry Id: " . $entryListItem['id'] . "\n";
                if ($entryListItem['id'] == '571454d6cdf43a052c190ad4') {
                    $message .= "Entry Id found\n\n";
                }

                if ($entry->hasSenses()) {
                    /** @var Sense $sense */
                    foreach ($entry->senses as $index => $sense) {
                        if ($sense->gloss->hasForm('en')) {
                            $gloss = (string)$sense->gloss['en']->value;
                            $message .= "English gloss: $gloss:\n";

                        }

//                        if ($sense->liftId == "eea9c29f-244f-4891-81db-c8274cd61f0c") {
                        if ($entryListItem['senses'][$index]['liftId'] == "eea9c29f-244f-4891-81db-c8274cd61f0c") {
                            $message .= "Semantic Domain: with data\n\n";
                        }

                        if ($sense->semanticDomain) {
//                            $message .= "has offset\n";

                            $semanticDomainString = $sense->semanticDomain->values;
                            //foreach ($semanticDomainString as $s) {
                            $s = implode(" ", $sense->semanticDomain->values->getArrayCopy());
                            if (strlen($s) > 0) {
                                $message .= "Has Semantic Domain $s:\n\n";
                            }
                        }

                        foreach ($sense->semanticDomain->values as $semanticDomain) {
                            $semDomString = (string)$semanticDomain;
                            $message .= "Semantic Domain: $semDomString\n\n";
                        }
                    }
                }
                $message .= "\n";
            }
            if (!$testMode) {
                $projectModel->write();
            }
        }
        return $message;
    }
}
