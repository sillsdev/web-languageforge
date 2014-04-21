<?php

namespace libraries\lfdictionary\common\Logger;

/**
 * Logger writing messages to standard output
 *
 * @version    0.7
 * @package    Logger
 *
 * @author     Matěj Humpál <finwe@finwe.info>
 * @copyright  Copyright (c) 2011 Matěj Humpál
 */
class OutputLogger extends \libraries\lfdictionary\common\Logger\AbstractLogger
{
	/**
	 * @see Logger\AbstractLogger::writeMessage();
	 */
	public function writeMessage($level, $message)
	{
		echo $message;
	}
}
