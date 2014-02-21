<?php

namespace libraries\lfdictionary\common\Logger;

/**
 * Factory for FileLogger
 *
 * @version    0.7
 * @package    Logger
 *
 * @author     Matěj Humpál <finwe@finwe.info>
 * @copyright  Copyright (c) 2011 Matěj Humpál
 */
class FileLoggerFactory implements \libraries\lfdictionary\common\Logger\ILoggerFactory
{

	private $options;

	public function __construct(array $options = array())
	{
		$this->options = $options;
	}

	/**
	 * @param array $options
	 * @return Logger\FileLogger
	 */
	public function factory(array $options = array())
	{
		return new FileLogger(array_merge($this->options, $options));
	}
}
