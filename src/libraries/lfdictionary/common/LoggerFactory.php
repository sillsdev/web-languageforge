<?php
namespace libraries\lfdictionary\common;


class LoggerFactory
{
	static function getLogger()
	{
		$fileLogger = new Logger\FileLogger();
		$fileLogger->setMinimumLogLevel(ILogger::DEBUG);
		$stack = new Stack(array(
				'loggers' => array($fileLogger)
		));
		return $stack;
	}
}
?>