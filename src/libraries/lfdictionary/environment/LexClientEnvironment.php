<?php
namespace libraries\lfdictionary\environment;

use libraries\lfdictionary\dto\ClientEnvironmentDto;
use libraries\lfdictionary\environment\LexProjectUserSettings;
use libraries\lfdictionary\common\LoggerFactory;
use models\UserModel;
use models\ProjectModel;
use models\ProjectModelFixer;

class LexClientEnvironment
{
	
	/**
	 * @var ProjectModel
	 */
	public $_projectModel;
	
	/**
	 * @var UserModel
	 */
	public $_userModel;
	
	/**
	 * @var LexProject
	 */
	private $_lexProject;
	
	/**
	 * @param string $projectId
	 * @param UserModel $userModel
	 */
	public function __construct($projectId, $userModel) {
		$this->_projectModel = new ProjectModel($projectId);
		ProjectModelFixer::ensureVLatest($this->_projectModel);
		
		$this->_userModel = $userModel;
		$this->_lexProject = new LexProject($this->_projectModel);
		LexProjectFixer::fixProjectVLatest($this->_lexProject);
		
		LoggerFactory::getLogger()->logInfoMessage(sprintf('LexClientEnvironment P=%s (%s) U=%s (%s)',
			$this->_projectModel->projectname,
			$projectId,
			$this->_userModel->username,
			$this->_userModel->id->asString()
		));
		
	}
	
	/**
	 * Returns the javascript settings variables for use by the Lexical Client application
	 * @return string
	 */
	public function getSettings() {
		$userModel = $this->_userModel;
		$projectModel = $this->_projectModel;
		$clientEnvironmentDto = new ClientEnvironmentDto($this->_projectModel, $this->_userModel);
		$lexProjectUserSettings = new LexProjectUserSettings($this->_projectModel, $this->_userModel);
		$partOfSpeechSettingsModel = new PartOfSpeechSettingsModel();
		
		$settingsString = '<script type="text/javascript" language="javascript">' . "\n" .
			'var settingsPartOfSpeech = ' . json_encode($partOfSpeechSettingsModel->encode()) . ";\n" .
			'var clientEnvironment = ' . json_encode($clientEnvironmentDto->encode()) . ";\n" .
			'var taskSettings = ' . json_encode($lexProjectUserSettings->encodeTasks()) . ";\n" .
			'var fieldSettings = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_BASE)) . ";\n" .
			'var fieldSettingsForAddMeaning = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_ADD_MEANING_MODEL)) . ";\n" .
			'var fieldSettingsForAddPOS = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_ADD_POS_MODEL)) . ";\n" .
			'var fieldSettingsForAddExample = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_ADD_EXAMPLE_MODEL)) . ";\n" .
			'var fieldSettingsForGatherWordFromList = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_GATHER_WORD_FROM_WORD_LIST)) . ";\n" .
			'var fieldSettingsForGatherWordFromSemanticDomain = ' . json_encode($lexProjectUserSettings->encodeFields(LexProjectUserSettings::FOR_GATHER_WORD_FROM_SEMANTIC_DOMAIN)) . ";\n" .
			'</script>';

		return $settingsString;
	}

}

?>