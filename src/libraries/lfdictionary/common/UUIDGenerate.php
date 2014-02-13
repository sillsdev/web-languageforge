<?php
namespace libraries\lfdictionary\common;
class UUIDGenerate{
	/**
	 * Generates a UUID v4 using PHP code.
	 *
	 * Based on code from @see http://php.net/uniqid#65879 , but corrected.
	 */
	public static function uuid_generate_php($include_braces = false) {
		if (function_exists('com_create_guid')) {
			if ($include_braces === true) {
				return strtoupper(com_create_guid());
			} else {
				return strtoupper(substr(com_create_guid(), 1, 36));
			}
		} else {
			// The field names refer to RFC 4122 section 4.1.2.
			return strtoupper(sprintf('%04x%04x-%04x-4%03x-%04x-%04x%04x%04x',
			// 32 bits for "time_low".
			mt_rand(0, 65535), mt_rand(0, 65535),
			// 16 bits for "time_mid".
			mt_rand(0, 65535),
			// 12 bits after the 0100 of (version) 4 for "time_hi_and_version".
			mt_rand(0, 4095),
			bindec(substr_replace(sprintf('%016b', mt_rand(0, 65535)), '10', 0, 2)),
			// 8 bits, the last two of which (positions 6 and 7) are 01, for "clk_seq_hi_res"
			// (hence, the 2nd hex digit after the 3rd hyphen can only be 1, 5, 9 or d)
			// 8 bits for "clk_seq_low" 48 bits for "node".
			mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535)
			));
		}
	}
}
?>