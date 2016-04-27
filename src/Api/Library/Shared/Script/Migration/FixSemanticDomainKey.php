<?php
namespace Api\Library\Shared\Script\Migration;

    use Api\Model\Languageforge\Lexicon\LexEntryListModel;
    use Api\Model\Languageforge\Lexicon\LexEntryModel;
    use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
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
        $message = "Fix SemanticDomain Keys to only store numeric keys (like 1.1.1) \n\n";

        $projectlist = new ProjectListModel();
        $projectlist->read();
        $projectIds = array_map(function ($e) { return $e['id'];}, $projectlist->entries);

        foreach ($projectIds as $projectId) {

            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexiconProjectModel($projectId);
                $entryList = new LexEntryListModel($project);
                $entryList->read();

                foreach ($entryList->entries as $entryListItem) {
                    $entry = new LexEntryModel($project, $entryListItem['id']);
                    $entryModified = false;
                    if ($entry->hasSenses()) {

                        /** @var Sense $sense */
                        foreach ($entry->senses as $sense) {
                            $updatedSemDomArray = $sense->semanticDomain->values->getArrayCopy();

                            foreach ($sense->semanticDomain->values as $index => $semanticDomain) {
                                if (preg_match("/^\d+(\.\d)*/", $semanticDomain, $matches)) {
                                    $updatedSemDomArray[$index] = $matches[0];
                                    $entryModified = true;
                                }
                            }
                            if ($entryModified) {
                                $sense->semanticDomain->values->exchangeArray($updatedSemDomArray);
                            }
                        }
                    }
                    if ((!$testMode) && ($entryModified)) {
                        $message .= "  Saving migrated semantic domain key.\n";
                        $entry->write();
                    }
                }
            }
        }
        return $message;
    }
}
