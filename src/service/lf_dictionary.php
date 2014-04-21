<?php

use libraries\lfdictionary\common\AsyncRunner;
use libraries\lfdictionary\common\LoggerFactory;
use libraries\lfdictionary\common\UserActionDeniedException;
use libraries\lfdictionary\common\UUIDGenerate;
use libraries\lfdictionary\dashboardtool\HistoricalHgDataFetcher;
use libraries\lfdictionary\dto\ListDTO;
use libraries\lfdictionary\dto\ProjectStateDTO;
use libraries\lfdictionary\dto\ResultDTO;
use libraries\lfdictionary\dto\UserDTO;
use libraries\lfdictionary\dto\UserListDTO;
use libraries\lfdictionary\environment\LanguageDepotImporter;
use libraries\lfdictionary\environment\EnvironmentMapper;
use libraries\lfdictionary\environment\LexProject;
use libraries\lfdictionary\environment\ProjectState;
use libraries\lfdictionary\environment\ProjectStates;
use libraries\lfdictionary\store\LexStore;
use libraries\lfdictionary\store\LexStoreController;
use libraries\lfdictionary\store\LexStoreMissingInfo;
use libraries\lfdictionary\store\LexStoreType;
use libraries\palaso\CodeGuard;
use models\commands\ActivityCommands;
use models\commands\LexEntryCommands;
use models\commands\ProjectCommands;
use models\DepotProjectModel;
use models\lex\LexEntryModel;
use models\mapper\JsonDecoder;
use models\ProjectModel;
use models\ProjectModelFixer;
use models\rights\Operation;
use models\rights\Domain;
use models\UserModel;

error_reporting ( E_ALL | E_STRICT );

require_once(APPPATH . 'helpers/loader_helper.php');
require_once(APPPATH . 'libraries/lfdictionary/Config.php');
require_once(APPPATH . 'libraries/recaptchalib.php');

/**
 * The main json-rpc Lexical API
 * Provides functions related to Lexicon management.
 * Lexical Entries can be created, updated, deleted, and queried.
 * Provides functions for enhancing and building a Lexicon; RapidWords, and WordPacks for gathering words; MissingInfo for adding
 * additional info to Lexical Entries.
 */

class LfDictionary {
	
	/**
	 *
	 * @var LexProject
	 */
	private $_lexProject;
	
	/**
	 *
	 * @var ProjectModel
	 */
	protected $_projectModel;
	
	/**
	 *
	 * @var UserModel
	 */
	private $_userModel;
	
	public function __construct($controller) {
		\libraries\lfdictionary\common\ErrorHandler::register();
		$this->_userId = (string) $controller->session->userdata('user_id');
		$this->_projectId = null;
		
		if (isset($_GET['p'])) {
			$this->_projectId = $_GET['p'];
		}
		
		$this->_userModel = new UserModel($this->_userId);
		if (! empty($this->_projectId)) {
			$this->_projectModel = new ProjectModel($this->_projectId);
			ProjectModelFixer::ensureVLatest($this->_projectModel);
		}
		
		$this->_logger = LoggerFactory::getLogger();
		$this->_logger->logInfoMessage("LFDictionaryAPI p:$this->_projectId u:$this->_userId");
		
		$userName = empty($userId) ? 'anon' : $this->_userModel->username;
		$projectName = empty($this->_projectId) ? 'no project' : $this->_projectModel->projectName;
		LoggerFactory::getLogger()->logInfoMessage(sprintf('LexAPI P=%s (%s) U=%s (%s)', $projectName, $this->_projectId, $userName, $this->_userId));
		$this->_lexProject = new LexProject($this->_projectModel);
		$this->_projectPath = $this->_lexProject->projectPath;
	}
	
	/**
	 * Creates a new project.
	 *
	 * @return ProjectStateDTO
	 */
	function create() {
		$this->_lexProject->create($this->_projectModel->languageCode);
		return $this->state();
	}
	
	/**
	 *
	 * @return bool
	 */
	private function isReadyOrThrow() {
		return $this->_lexProject->isReadyOrThrow();
	}
	
	/**
	 * Get word list
	 *
	 * @param int $start        	
	 * @param int $end        	
	 * @return \dto\ListDTO
	 */
	function getList($start, $end) {
		$this->isReadyOrThrow();
		$store = $this->getLexStore();
		$result = $store->readEntriesAsListDTO($start, $end - $start);
		return $result->encode();
	}
	
	/**
	 * Returns a list of suggestions that are similar to the $search term given.
	 * Up to $limit results are returned.
	 *
	 * @param string $field        	
	 * @param string $search        	
	 * @param int $indexFrom        	
	 * @param int $limit        	
	 * @return \dto\AutoListDTO
	 */
	function getWordsForAutoSuggest($field, $search, $indexFrom, $limit) {
		$this->isReadyOrThrow();
		
		$store = $this->getLexStore();
		$result = $store->readSuggestions($field, $search, $indexFrom, $limit);
		return $result->encode();
	}

	/**
	 * Create/Update a single Lexical Entry
	 * @param LexEntryModel $params        	
	 * @param Action $action        	
	 * @return string Id
	 */
	function entryUpdate($params, $action) {
		$this->isReadyOrThrow();
		return LexEntryCommands::updateEntry($params, $action, $this->_projectModel, $this->_userId);
	}
	
	/**
	 * Read a single lexical entry
	 * @param string $id        	
	 * @return LexEntryModel
	 */
	function entryRead($id) {
		$this->isReadyOrThrow();
		$entry = new LexEntryModel($this->_projectModel, $id);
		return JsonEncoder::encode($entry);
	}
	
	/**
	 * Delete lexical entries
	 * @param LexEntryIds $jsonIds
	 * @return int Total number of entries removed.
	 */
	function deleteEntries($jsonIds) {
		$this->isReadyOrThrow();
		return LexEntryCommands::deleteEntries($this->_projectModel, $this->_userId, $jsonIds);
	}
	
	/**
	 * Returns a ListDTO of entries that do not have data for $language in the given $field.
	 *
	 * @param MissingInfoType $field        	
	 * @see LexStoreMissingInfo
	 * @return dto\ListDTO
	 */
	function getMissingInfo($field) {
		$this->isReadyOrThrow();
		
		$store = $this->getLexStore();
		$result = $store->readMissingInfo($field);
		
		return $result->encode();
	}
	
	// Gather words from Text box
	function getGatherWords($words, $filename) {
		// NOTE: This is the gather words from text (or file) api.
		// TODO Rename. This would be better named gatherWordsFromText(...). CP 2013-12
		// TODO Enhance. This should all be in a command. CP 2013-12
		// TODO Enhance. The file upload should be implemented as per SF file uploads.  The post upload command should be called from there, not here. CP 2013-12
		$this->isReadyOrThrow ();
		
		$languageCode = $this->_projectModel->language;
		
		// get all from lift file.
		$existWordsList = $this->getList(1, PHP_INT_MAX);
		if (strlen(trim($filename)) > 3) {
			LoggerFactory::getLogger()->logDebugMessage($filename);
			// it is from uploaded file.
			$uploadedFolder = APPPATH . '/service/fileUploader/files/';
			$uploadedBinFile = $uploadedFolder . "/" . $filename;
			// read everything from uploaded file
			LoggerFactory::getLogger()->logDebugMessage($uploadedBinFile);
			$fileHandler = fopen($uploadedBinFile, 'r');
			if (! $fileHandler) {
				throw new \libraries\lfdictionary\common\UserActionDeniedException('File upload failed.');
			}
			if (filesize($uploadedBinFile) == 0) {
				$result = new ResultDTO(false, 0);
				return $result->encode();
			}
			$fileData = fread($fileHandler, filesize($uploadedBinFile));
			fclose($fileHandler);
			unlink($uploadedBinFile);
			// format conversion
			$words = \libraries\lfdictionary\common\TextFormatHelper::convertToUTF8String($fileData);
		}
		$existWords = array();
		$wordEntries = $existWordsList['entries'];
		for ($i = 0; $i <= $existWordsList['count']; $i ++) {
			if (array_key_exists($i, $wordEntries)) {
				if (array_key_exists('entry', $wordEntries[$i])) {
					if (array_key_exists($languageCode, $wordEntries[$i]['entry'])) {
						$existWords[] = $wordEntries[$i]['entry'][$languageCode];
					}
				}
			}
		}
		
		$command = new \libraries\lfdictionary\commands\GatherWordCommand($this->_lexProject->getLiftFilePath(), $languageCode, $existWords, $words, $this->getLexStore());
		
		$result = new ResultDTO(true, $command->execute());
		return $result->encode();
	}
	function getListForGatherWord() {
		$this->isReadyOrThrow();
		
		$wordPackFile = LEXICON_WORD_LIST_SOURCE . LEXICON_WORD_PACK_FILE_NAME;
		
		$store = $this->getLexStore();
		// read all exist words from DB
		$existWordListDto = $store->readEntriesAsListDTO(0, PHP_INT_MAX);
		
		$command = new \libraries\lfdictionary\commands\GetWordListFromWordPackCommand($existWordListDto, $wordPackFile);
		$result = $command->execute();
		return $result->encode();
	}
	function getEntryForGatherWord($guid) {
		$this->isReadyOrThrow();
		
		$wordPackFile = LEXICON_WORD_LIST_SOURCE . LEXICON_WORD_PACK_FILE_NAME;
		$command = new \libraries\lfdictionary\commands\GetWordCommand($wordPackFile, $guid);
		$result = $command->execute();
		return $result->encode();
	}
	function getDomainTreeList() {
		$this->isReadyOrThrow();
		
		$command = new \libraries\lfdictionary\commands\GetDomainTreeListCommand(\libraries\lfdictionary\environment\LexProject::locateSemanticDomainFilePath('en'), 'en');
		$result = $command->execute();
		return $result->encode();
	}
	function getDomainQuestion($guid) {
		$this->isReadyOrThrow();
		
		$command = new \libraries\lfdictionary\commands\GetDomainQuestionCommand(\libraries\lfdictionary\environment\LexProject::locateSemanticDomainFilePath('en'), 'en', $guid);
		$result = $command->execute();
		return $result->encode();
	}
	function getComments($messageStatus, $messageType, $startIndex, $limits, $isRecentChanges) {
		$this->isReadyOrThrow();
		
		$chorusNotesFilePath = $this->_lexProject->getChorusNotesFilePath();
		$command = new \libraries\lfdictionary\commands\GetCommentsCommand($chorusNotesFilePath, $messageStatus, $messageType, $startIndex, $limits, $isRecentChanges);
		$result = $command->execute();
		return $result->encode();
	}
	function saveNewComment($messageStatus, $isStatusReviewed, $isStatusTodo, $parentGuid, $commentMessage, $isRootMessage) {
		$this->isReadyOrThrow();
		
		$chorusNotesFilePath = $this->_lexProject->getChorusNotesFilePath();
		$now = new DateTime();
		$w3cDateString = $now->format(DateTime::W3C);
		$messageType = 0;
		$command = new \libraries\lfdictionary\commands\SaveCommentsCommand($chorusNotesFilePath, $messageStatus, $isStatusReviewed, $isStatusTodo, $messageType, $parentGuid, $commentMessage, $w3cDateString, $this->_userModel->username, $isRootMessage);
		$result = $command->execute();
		return $result->encode();
	}
	function getDashboardData($actRange) {
		$this->isReadyOrThrow();
		
		$command = new \libraries\lfdictionary\commands\GetDashboardDataCommand($this->getLexStore(), $this->_projectId, $this->_lexProject->getLiftFilePath(), $actRange);
		$result = $command->execute();
		return $result->encode();
	}
	function getDashboardUpdateRunning() {
		$command = new \libraries\lfdictionary\commands\UpdateDashboardCommand($this->_projectId, $this->_projectModel, $this->_lexProject);
		$result = new ResultDTO(true, strval($command->execute()));
		return $result->encode();
	}
	function getUserFieldsSetting($userId) {
		$userModel = new UserModel($userId);
		// use user name may not a good idea, Linux box is case sensitve,
		// so all user name will save in lowercase
		$strName = $userModel->username;
		$strName = mb_strtolower($strName, mb_detect_encoding($strName));
		$command = new \libraries\lfdictionary\commands\GetSettingUserFieldsSettingCommand($this->_lexProject, $strName);
		$result = $command->execute();
		return $result;
	}
	function getUserTasksSetting($userId) {
		$userModel = new UserModel($userId);
		// use user name may not a good idea, Linux box is case sensitve,
		// so all user name will save in lowercase
		$strName = $userModel->username;
		$strName = mb_strtolower($strName, mb_detect_encoding($strName));
		$command = new \libraries\lfdictionary\commands\GetSettingUserTasksSettingCommand($this->_lexProject, $strName);
		$result = $command->execute();
		return $result;
	}
	function getUserSettings($userId) {
		$resultTask = $this->getUserTasksSetting($userId);
		$resultFields = $this->getUserFieldsSetting($userId);
		$result = array(
				"tasks" => $resultTask["tasks"],
				"fields" => $resultFields["fields"] 
		);
		return $result;
	}
	function updateSettingTasks($userIds, $tasks) {
		// don't use rawurldecode here, because it does not decode "+" -> " "
		$tasks = urldecode($tasks);
		$userIds = urldecode($userIds);
		$userNames = array();
		if (! (stristr($userIds, '|') === FALSE)) {
			$userIdArray = explode('|', $userIds);
			
			// apply too all
			foreach ($userIdArray as &$userId) {
				if (is_numeric($userId)) {
					$userNames[] = $this->getUserNameById($userId);
				}
			}
		} else {
			// apply to special user
			$userNames[] = $this->getUserNameById($userIds);
		}
		$command = new \libraries\lfdictionary\commands\UpdateSettingUserTasksSettingCommand($this->_lexProject, $userNames, $tasks);
		$result = $command->execute();
		return $result;
	}
	function updateSettingFields($userIds, $fields) {
		// don't use rawurldecode here, because it does not decode "+" -> " "
		$fields = urldecode($fields);
		$userIds = urldecode($userIds);
		$userNames = array();
		if (! (stristr($userIds, '|') === FALSE)) {
			$userIdArray = explode('|', $userIds);
			
			// apply too all
			foreach ($userIdArray as &$userId) {
				if (is_numeric($userId)) {
					$userNames[] = $this->getUserNameById($userId);
				}
			}
		} else {
			// apply to special user
			$userNames[] = $this->getUserNameById($userIds);
		}
		$command = new \libraries\lfdictionary\commands\UpdateSettingUserFieldsSettingCommand($this->_lexProject, $userNames, $fields);
		$result = $command->execute();
		return $result;
	}
	
	/**
	 * get the exemplarCharacters index of language of current project.
	 */
	function getTitleLetterList() {
		CodeGuard::checkTypeAndThrow($this->_projectModel, 'models\ProjectModel');
		
		// get project language : FieldSettings.fromWindow().value("Word").getAbbreviations().get(0);
		
		// looking for ldml which has <exemplarCharacters type="index">
		// example: 'zh_Hans_CN' -NO-> 'zh_Hans' -NO-> 'zh' ->FOUND!
		$languageCode = $this->_projectModel->languageCode;
		$fileName = preg_replace('/-+/', '_', $languageCode);
		while (true) {
			$fileFullPath = LF_LIBRARY_PATH . "/data/ldml-core-common-main/" . $fileName . ".xml";
			if (file_exists($fileFullPath)) {
				$xml_str = file_get_contents($fileFullPath);
				$doc = new \DOMDocument();
				$doc->preserveWhiteSpace = FALSE;
				$doc->loadXML($xml_str);
				$xpath = new \DOMXPath($doc);
				$entries = $xpath->query('//ldml/characters/exemplarCharacters[@type="index"]');
				if ($entries->length == 1) {
					$exemplarValues = $entries->item(0)->nodeValue;
					$exemplarValues = str_replace('[', '', $exemplarValues);
					$exemplarValues = str_replace(']', '', $exemplarValues);
					$exemplars = explode(" ", $exemplarValues);
					$exemplarsArray = array();
					foreach ($exemplars as $value) {
						$exemplarsArray[] = $value;
					}
					return array("tl" => $exemplarsArray);
				}
			}
			if (strpos($fileName, '_') !== FALSE) {
				// remove some sub-categroy info from file name
				$fileNameParts = explode("_", $fileName);
				$fileName = "";
				array_pop($fileNameParts); // remove last part
				foreach ($fileNameParts as $value) {
					if (strlen($fileName) > 1) {
						$fileName = $fileName . '_';
					}
					$fileName = $fileName . $value;
				}
			} else {
				// no more.
				return array ("tl" => array());
			}
		}
		
		return array ("tl" => array());
	}
	
	/**
	 * get words
	 */
	function getWordsByTitleLetter($letter) {
		$this->isReadyOrThrow();
		$store = $this->getLexStore();
		$result = $store->searchEntriesAsWordList($this->_projectModel->languageCode, trim($letter), null, null);
		return $result->encode();
	}
	
	/**
	 *
	 * @param string $type 'LanguageDepot'
	 * @param string $soruceURI        	
	 * @param string $sourceCredentials        	
	 * @return ProjectStateDTO
	 */
	function import($type, $soruceURI, $user, $password) {
		// For now we're assuming type is LanguageDepot
		$currentState = $this->_lexProject->projectState->getState();
		switch ($currentState) {
			case ProjectStates::Error :
			case '' :
				// Have another go at importing
				break;
			default :
				return $this->state();
		}
		
		$this->_lexProject->projectState->setState(ProjectStates::Importing, "Importing from LanguageDepot");
		
		$importer = new \libraries\lfdictionary\environment\LanguageDepotImporter($this->_projectId);
		$importer->cloneRepository($user, $password, $soruceURI);
		$importer->importContinue($this->_lexProject->projectState);
		return $this->state();
	}
	
	/**
	 *
	 * @return ProjectStateDTO
	 */
	function state() {
		$currentState = $this->_lexProject->projectState->getState();
		$progress = 0;
		switch ($currentState) {
			case \libraries\lfdictionary\environment\ProjectStates::Importing :
				$importer = new \environment\LanguageDepotImporter($this->_projectId);
				$importer->importContinue($this->_lexProject->projectState);
				$progress = $importer->progress();
				break;
		}
		$state = $this->_lexProject->projectState->getState();
		$message = $this->_lexProject->projectState->getMessage();
		$dto = new \libraries\lfdictionary\dto\ProjectStateDTO($state, $message);
		$dto->Progress = $progress;
		return $dto->encode();
	}
	
	/**
	 *
	 * @var LexStore
	 */
	private $_lexStore;
	
	private function getLexStore() {
		if (! isset($this->_lexStore)) {
			$this->_lexStore = new LexStoreController(LexStoreType::STORE_MONGO, $this->_projectModel->databaseName(), $this->_lexProject);
		}
		return $this->_lexStore;
	}
	
	// Reviewed This can stay here
	function getIANAData() {
		$JSONFile = LF_LIBRARY_PATH . "/data/IANA.js";
		$result = file_get_contents($JSONFile);
		return json_decode($result);
	}
	
	// Reviewed This can stay here
	function getSettingInputSystems() {
		$command = new \libraries\lfdictionary\commands\GetSettingInputSystemsCommand($this->_lexProject);
		$result = $command->execute();
		return $result;
	}
	
	// Reviewed This is ok here CP
	function updateSettingInputSystems($inputSystems) {
		// don't use rawurldecode here, because it does not decode "+" -> " "
		$inputSystems = urldecode($inputSystems);
		$command = new \libraries\lfdictionary\commands\UpdateSettingInputSystemsCommand($this->_lexProject, $inputSystems);
		$command->execute();
		return $this->getSettingInputSystems();
	}
	protected function getUserNameById($userId) {
		$userModel = new UserModel($userId);
		// use user name may not a good idea, Linux box is case sensitve,
		// so all user name will save in lowercase
		$strName = $userModel->username;
		return mb_strtolower($strName, mb_detect_encoding($strName));
	}
	
	/**
	 * List User
	 */
	function listUsersInProject($projectId) {
		$projectModel = new ProjectModel($projectId);
		$userList = $projectModel->listUsers();
		$result = new UserListDTO();
		for ($i = 0; $i < count($userList->entries); $i ++) {
			$userId = $userList->entries[$i]['id'];
			$userDto = new UserDTO(new UserModel($userId));
			$result->addListUser($userDto);
		}
		return $result->encode();
	}
	
	/**
	 * simply count the word in database and return.
	 */
	function getWordCountInDatabaseAction() {
		$this->isReadyOrThrow();
		$store = $this->getLexStore();
		$wordCount = $store->entryCount();
		$result = new \libraries\lfdictionary\dto\ResultDTO(true, strval($wordCount));
		return $result->encode();
	}
	
	public function depot_begin_import($model) {		
		
		/*
		 * HERE start the clone only
		 */
		$depotproject = new DepotProjectModel();
		JsonDecoder::decode($depotproject, $model);
		
		//TODO: ---- YOUR Private KEY GOES HERE ----
		$privatekey = "6LfxQecSAAAAAMjuC5FKBw6zZrGSOF-KBqWdi1IL";
		$resp = recaptcha_check_answer(
			$privatekey,
			$_SERVER["REMOTE_ADDR"],
			$depotproject->captcha_challenge,
			$depotproject->captcha_response
		);
		
		if (!$resp->is_valid) {
			// What happens when the CAPTCHA was entered incorrectly
			$dto = new ResultDTO(false, "CAPTCHA was entered incorrectly");
			return $dto->encode();
		} else {
			$lfProjectSlug = ProjectModel::makeProjectSlug($depotproject->projectlanguagecode, $depotproject->projectName, ProjectModel::PROJECT_LIFT);
			$languageDepotImporter = new LanguageDepotImporter($lfProjectSlug);
			$languageDepotImporter->cloneRepository($depotproject->projectusername, $depotproject->projectpassword, $depotproject->projectcode);
			$projectState = new ProjectState($lfProjectSlug);
			$languageDepotImporter->importContinue($projectState);
			$resultDTO = new ResultDTO(true);
			return $resultDTO->encode();
		}		
	}
	
	public function depot_check_import_states($model) {
		$depotproject = new DepotProjectModel();
		JsonDecoder::decode($depotproject, $model);
		$lfProjectSlug = ProjectModel::makeProjectSlug($depotproject->projectlanguagecode, $depotproject->projectName, ProjectModel::PROJECT_LIFT);
		$languageDepotImporter = new LanguageDepotImporter($lfProjectSlug);
		// LanguageDepotImporter::progress($projectSlug);
		
		$resultDTO = null;
		
		if ($languageDepotImporter->isComplete()) {
			if ($languageDepotImporter->error()) {
				$resultDTO = new ResultDTO(true, $languageDepotImporter->error(), true);
			} else {
				// create new project
				$newProjectModel = ProjectModel::create($depotproject->projectName, $depotproject->projectlanguagecode);
				$resultText = ProjectCommands::createOrUpdateProject($newProjectModel, $this->_userModel->id->asString(), true);
				$resultDTO = new ResultDTO(true, $resultText);
			}
			$languageDepotImporter->clear();
		} else {
			$resultDTO = new ResultDTO(false, $languageDepotImporter->progress());
		}
		
		return $resultDTO->encode();
	}
	
}

?>
