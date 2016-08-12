<?php
namespace Api\Library\Shared\Script\Migration;

    use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
    use Api\Model\Languageforge\Lexicon\LexEntryListModel;
    use Api\Model\Languageforge\Lexicon\LexEntryModel;
    use Api\Model\Languageforge\Lexicon\LexProjectModel;
    use Api\Model\Languageforge\Lexicon\LexSense;
    use Api\Model\ProjectListModel;
    use Api\Model\ProjectModel;

class FixSemanticDomainKey
{
    /**
     * Analyze a lexicon project and migrate the semantic domain keys in the senses
     * @param ProjectModelForUseWithSemanticDomainMigration $project
     * @param string $projectId
     * @param string $testMode
     * @param string $message
     */
    private function analyzeProject($project, $projectId, $testMode, &$message)
    {
        $entryModifiedCount = 0;
        $entryList = LexEntryCommands::listEntries($projectId);

        foreach ($entryList->entries as $entryListItem) {
            $entry = new LexEntryModel($project, $entryListItem['id']);
            $entryModified = false;
            if ($entry->hasSenses()) {

                /** @var LexSense $sense */
                foreach ($entry->senses as $sense) {
                    $this->migrateSemDomKey($sense, $project->projectName, $message, $entryModified);
                }
            }

            if ($entryModified) {
                $entryModifiedCount++;

                if (!$testMode) {
                    $entry->write();
                }
            }
        }
        if (!$testMode) {
            $project->hasMigratedSemanticDomainKeys = true;
            $project->write();
        }
        if ($entryModifiedCount > 0) {
            print "$entryModifiedCount entries with semantic domains were migrated\n";
        }
    }

    /**
     * Migrate the semantic domain keys within a sense
     * @param LexSense $sense
     * @param string $message
     * @param bool $entryModified
     */
    private function migrateSemDomKey($sense, $projectName, &$message, &$entryModified)
    {
        $senseModified = false;
        $updatedSemDomArray = $sense->semanticDomain->values->getArrayCopy();
        foreach ($sense->semanticDomain->values as $index => $originalSemDom) {
            // Extract the numeric semantic domain keys from a space-separated field
            if (preg_match("/\d+(\.\d)*/", $originalSemDom, $matches) && (strlen($originalSemDom) > strlen($matches[0]))) {
                $updatedSemDomArray[$index] = $matches[0];
                $senseModified = true;
                $entryModified = true;
            }
        }
        if ($senseModified && (count($updatedSemDomArray) > 0)) {
            print "   Change ";
            if ((key_exists('gloss', $sense)) && ($sense->gloss->count() > 0) && (reset($sense->gloss)->value)) {
                print reset($sense->gloss)->value;
            }
            print " semdom key(s)\n\tfrom: {" . implode(", ", $sense->semanticDomain->values->getArrayCopy()) .
                "}\n\tto: {" . implode(", ", $updatedSemDomArray) . "}\n";
            print "$projectName Memory usage: " . $this->getMemoryUsage() . "\n";
            $sense->semanticDomain->values->exchangeArray($updatedSemDomArray);
        }
    }

    public function run($userId, $mode = 'test')
    {
        ini_set('max_execution_time', 300); // Sufficient time to update semdom keys for every project
        $testMode = ($mode == 'test');
        $message = "Fix SemanticDomain Keys to only store numeric keys (like 1.1.1) \n";

        $projectlist = new ProjectListModel();
        $projectlist->read();

        // Because of the memory needed to process semdom keys for projects, we'll limit the
        // migration script to run in batches of this many projects per run.
        $maxNumProjects = 1;

        $lfProjectCount = 0; // Counter of LF projects analyzed
        $skippedProjects = 0;
        $totalProjectCount = $projectlist->count;

        foreach ($projectlist->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new ProjectModelForUseWithSemanticDomainMigration($projectId);
            if ($project->appName == 'lexicon' && !$project->hasMigratedSemanticDomainKeys) {
                print "\n-------------  $project->projectName.";
                print "\n";
                $lfProjectCount++;
                $this->analyzeProject($project, $projectId, $testMode, $message);
                print "Memory usage: " . $this->getMemoryUsage() . "\n";
            } else {
                $skippedProjects++;
            }

            // Summary
            if ($lfProjectCount >= $maxNumProjects) {
                print "Processed projects " . ($skippedProjects + 1) . " - " . ($skippedProjects + $lfProjectCount) .
                    " of $totalProjectCount projects\n";
                break;
            }
        } // foreach project
        if ($skippedProjects > 0) {
            print "Skipped $skippedProjects projects\n";
        }

        return $message;
    }

    /**
     * Utility to generate a string with units of the current memory usage
     * @return string Current memory usage
     */
    public function getMemoryUsage()
    {
        $size = memory_get_usage();
        $unit=array('b','kb','mb','gb','tb','pb');
        return @round($size/pow(1024,($i=floor(log($size,1024)))),2).' '.$unit[$i];
    }
}

    /**
     * Class ProjectModelForUseWithSemanticDomainMigration
     * Has a flag to store in Mongo about whether the semantic domain keys have been migrated
     * @package Api\Library\Shared\Script\Migration
     */
class ProjectModelForUseWithSemanticDomainMigration extends LexProjectModel {
    public $hasMigratedSemanticDomainKeys;
}
