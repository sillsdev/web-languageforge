<?php

namespace libraries\lfdictionary\common;

// TODO Delete. See ErrorHandler

/**
 * Factory for OutputLogger
 *
 * @version    0.7
 * @package    Logger
 *
 * @author     Matěj Humpál <finwe@finwe.info>
 * @copyright  Copyright (c) 2011 Matěj Humpál
 */
class StackFactory
{
	/**
	 * @param array $options
	 * @return Logger\OutputLogger
	 */
	public function factory($options = array())
	{
		return new Stack($options);
	}
}