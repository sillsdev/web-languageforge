<?php

use Api\Model\Languageforge\Lexicon\Command\LexOptionListCommands;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use PHPUnit\Framework\TestCase;

class LexOptionListCommandsTest extends TestCase
{
    public function testUpdateList_newList_createsOK()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $optionLists = new LexOptionListListModel($project);
        $optionLists->read();

        // Initial project has no optionlists populated
        $this->assertEquals(0, $optionLists->count);

        // Initialized project has grammatical category optionlist defined
        $project->initializeNewProject();
        $optionLists->read();
        $this->assertEquals(1, $optionLists->count);
        $initialValue = $optionLists->entries[0]["items"][0]["value"];
        $this->assertEquals("Adjective (adj)", $initialValue);

        // Swap first and last items of parts of speech list
        $count = count($optionLists->entries[0]["items"]);
        $swap = $optionLists->entries[0]["items"][0];
        $optionLists->entries[0]["items"][0] = $optionLists->entries[0]["items"][$count - 1];
        $optionLists->entries[0]["items"][$count - 1] = $swap;
        LexOptionListCommands::updateList($project->id->asString(), $optionLists->entries[0]);

        $optionLists->read();
        $newValue = $optionLists->entries[0]["items"][0]["value"];
        $this->assertEquals("Verb (v)", $newValue);

        // Create grammatical category list for fruits
        $fruits = [
            ["key" => "a", "value" => "apple"],
            ["key" => "b", "value" => "berry"],
            ["key" => "c", "value" => "cherry"],
            ["key" => "g", "value" => "grape"],
            ["key" => "m", "value" => "mango"],
            ["key" => "p", "value" => "pineapple"],
        ];
        $data = [
            "id" => "",
            "name" => "List of Fruits",
            "code" => "fruits",
            "items" => $fruits,
            "canDelete" => false,
        ];
        LexOptionListCommands::updateList($project->id->asString(), $data);
        $optionLists->read();

        $this->assertEquals(2, $optionLists->count);
    }
}
