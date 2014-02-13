<?php

/**
 * @file
 * Thai transliteration data for the PHPTransliteration class.
 */

/*
 * some languages need a pre-process to rearrange or re-sort the word before transliteration progress
*/
function languagePreprocess_th($transliteration, $string, $unknown_character)
{
	// ref: http://www-01.ibm.com/software/globalization/topics/thai/collation.html
	$rearrangement = array (0x40 => 'e', 'ae', 'o', 'ai', 'ai');
	$result = '';
	// Split into Unicode characters and transliterate each one.
	$tempChar = '';

	foreach (preg_split('//u', $string, 0, PREG_SPLIT_NO_EMPTY) as $character) {
		$code = $transliteration->ordUTF8External($character);
		if ($code == -1) {
			$result .= $unknown_character;
		}
		else {
			$codeLimted = $code & 0xff;
			// to see do we need swip the leading vowels and initial consonants.
			if (isset($rearrangement[$codeLimted]))
			{
				$tempChar = $character;
			}else{
				$result .= $character . $tempChar;
				$tempChar ='';
			}
		}
	}
	return $result;
}

/*
 * some languages need some different way to compare the title letter.
*/
function overrideComparison_th($transliteration, $string, $titleLetter)
{
	if (strpos(strtolower($string), strtolower($titleLetter)) === 0)
	{
		return true;
	}else
	{
		return false;
	}
}

?>