<?php

use Api\Model\Languageforge\Translate\Command\TranslateProjectCommands;
use Api\Model\Languageforge\Translate\Dto\TranslateProjectDto;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use GuzzleHttp\Client;
use GuzzleHttp\Message\Response;
use GuzzleHttp\Subscriber\Mock;
//use PHPUnit\Framework\TestCase;

class TranslateProjectCommandsTest extends PHPUnit_Framework_TestCase
{
    public function testUpdateConfig_UpdatedConfig_ConfigPersists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $config = json_decode(json_encode(TranslateProjectDto::encode($projectId)['project']['config']), true);

        $this->assertEquals('qaa', $config['source']['inputSystem']['tag']);
        $this->assertEquals('qaa', $config['target']['inputSystem']['tag']);

        $config['source']['inputSystem']['tag'] = 'es';
        $config['target']['inputSystem']['tag'] = 'en';

        $client = new Client();
        $mock = new Mock([new Response(200), new Response(200)]);
        $client->getEmitter()->attach($mock);

        TranslateProjectCommands::updateConfig($projectId, $config, $client);

        $project2 = new TranslateProjectModel($projectId);

        // test for updated values
        $this->assertEquals('es', $project2->config->source->inputSystem->tag);
        $this->assertEquals('en', $project2->config->target->inputSystem->tag);
    }

    public function testUpdateProject_UpdateConfig_ConfigPersists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $config = json_decode(json_encode(TranslateProjectDto::encode($projectId)['project']['config']), true);

        $this->assertEquals('qaa', $config['source']['inputSystem']['tag']);
        $this->assertEquals('qaa', $config['target']['inputSystem']['tag']);

        $config['source']['inputSystem']['tag'] = 'es';
        $config['target']['inputSystem']['tag'] = 'en';
        $data['config'] = $config;

        $client = new Client();
        $mock = new Mock([new Response(200)]);
        $client->getEmitter()->attach($mock);

        TranslateProjectCommands::updateProject($projectId, $userId, $data, $client);

        $project2 = new TranslateProjectModel($projectId);

        // test for updated values
        $this->assertEquals('es', $project2->config->source->inputSystem->tag);
        $this->assertEquals('en', $project2->config->target->inputSystem->tag);
    }
}
