<?php

namespace libraries\lfdictionary\common\Logger;

/**
 * Logger ignoring all messages
 *
 * @version    0.7
 * @package    Logger
 *
 * @author     Matěj Humpál <finwe@finwe.info>
 * @copyright  Copyright (c) 2011 Matěj Humpál
 */
class NullLogger implements \libraries\lfdictionary\common\Logger\ILogger
{
	/**
	 * Dummy implementation
	 *
	 * @param mixed $level
	 * @param string $message
	 */
	public function logMessage($level, $message = NULL) {}
}