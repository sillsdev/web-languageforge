<?php

namespace libraries\lfdictionary\common;

// TODO Delete. See ErrorHandler
/**
 * Basic interface for logging
 *
 * @version    0.7
 * @package    Logger
 *
 * @author     Jan Smitka <jan@smitka.org>
 * @author     Martin Pecka <martin.pecka@clevis.cz>
 * @author     Matěj Humpál <finwe@finwe.info>
 * @copyright  Copyright (c) 2009-2010 Jan Smitka
 * @copyright  Copyright (c) 2009-2010 Martin Pecka
 * @copyright  Copyright (c) 2011 Matěj Humpál
 */
interface ILogger
{

	/**
	 * System is unusable
	 * @var integer
	 */
	const EMERGENCY = 0;

	/**
	 * ALert
	 * @var integer
	 */
	const ALERT = 1;

	/**
	 * Critical conditions
	 * @var integer
	 */
	const CRITICAL = 2;

	/**
	 * Error conditions
	 * @var integer
	 */
	const ERROR = 3;

	/**
	 * Warning conditions
	 * @var integer
	 */
	const WARNING = 4;

	/**
	 * Notice
	 * @var integer
	 */
	const NOTICE = 5;

	/**
	 * Informational
	 * @var integer
	 */
	const INFO = 6;

	/**
	 * Debug-level messages
	 * @var integer
	 */
	const DEBUG = 7;

	/**
	 * Logs a message.
	 *
	 * If first parameter is a string, uses it as a message.
	 * All other parameters are used as sprintf replacements to a message
	 *
	 * @param int|string $level priority of the message or the message itself (when no level is required)
	 * @param string $message the message to log
	 */
	public function logMessage($level, $message = NULL);

}
