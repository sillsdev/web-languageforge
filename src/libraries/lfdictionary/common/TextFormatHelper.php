<?php
namespace libraries\lfdictionary\common;
class TextFormatHelper {
	/**
	 * @return UTF8 string
	 */
	public static function convertToUTF8String($string) {
		try {
			$encoding =mb_detect_encoding($string);
			if ($encoding=="")
			{
				// maybe not always work
				$encoding="UTF-16";
			}else if($encoding=="UTF-8")
			{
				$string=TextFormatHelper::removeBOM($string);
			}
			$result = iconv($encoding, "UTF-8//TRANSLIT", $string);
			return $result;
		} catch (Exception $e) {
			throw new \libraries\lfdictionary\common\UserActionDeniedException('unknown encoding of text file or it is not a plain text file.');
		}
	}

	/**
	 * @return UTF8 string without BOM
	 */
	public static function removeBOM($string) {
		if(substr($string, 0,3) == pack("CCC",0xef,0xbb,0xbf)) {
			$string=substr($string, 3);
		}
		return $string;
	}
	
	/**
	 * 
	 * Check if a string begins with another string
	 * http://snipplr.com/view/13214/check-if-a-string-begins-with-another-string/
	 * @param String $haystack
	 * @param String $needle
	 * @param Bool $case
	 */
	public static function startsWith($haystack,$needle,$case=true) {
		if($case){
			return (strcmp(substr($haystack, 0, strlen($needle)),$needle)===0);
		}
		return (strcasecmp(substr($haystack, 0, strlen($needle)),$needle)===0);
	}
	
};
?>