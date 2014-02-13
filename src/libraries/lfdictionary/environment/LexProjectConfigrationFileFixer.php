<?php
namespace libraries\lfdictionary\environment;

class LexProjectConfigrationFileFixer
{
	function __construct($doc, $filename) {
		// just start fix configration in construct.
		//Review
		$xpath = new \DOMXPath($doc);

		//Review
		$entries = $xpath->query('//configuration/tasks/task[@taskName="Review"]');
		$dataChanges = FALSE;
		if ($entries->length<1)
		{
			$node = $doc->getElementsByTagName("tasks")->item(0);
			if ($node->childNodes) {
				$newReviewTask = $doc->createElement("task");
				$node->appendChild($newReviewTask);
				$newReviewTask->setAttribute("taskName", "Review");
				$newReviewTask->setAttribute("visible", "false");
			}
			$dataChanges = TRUE;
		}


		// index fix should always be last one
		$dataChanges = $this->settingIndexFix($doc);
		if ($dataChanges===TRUE){
			$doc->save($filename);
		}
	}

	private function settingIndexFix($doc)
	{
		//check do all fields / tasks have index, if not then fill it.
		//tasks
		$node = $doc->getElementsByTagName("tasks")->item(0);
		$indexMissing = FALSE;
		$dataChanges = FALSE;
		//check loop
		foreach ($node->childNodes as $child) {
			if (!$child->hasAttribute("index")){
				$indexMissing = TRUE;
				$dataChanges = TRUE;
				break;
			}
		}
		if ($indexMissing===TRUE)
		{
			//fill index
			$index = 1;
			foreach ($node->childNodes as $taskNode) {
				$taskNode->setAttribute("index",$index);
				$index = $index + 1;
			}
		}

		//fields
		$node = $doc->getElementsByTagName("fields")->item(0);
		$indexMissing = FALSE;
		//check loop
		foreach ($node->childNodes as $child) {
			if (!$child->hasAttribute("index")){
				$indexMissing = TRUE;
				$dataChanges = TRUE;
				break;
			}
		}
		if ($indexMissing===TRUE)
		{
			//fill index
			$index = 1;
			foreach ($node->childNodes as $fieldNode) {
				$fieldNode->setAttribute("index",$index);
				$index = $index + 1;
			}
				
		}
		return $dataChanges;
	}

}