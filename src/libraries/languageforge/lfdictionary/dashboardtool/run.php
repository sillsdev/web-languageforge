<?php

require_once 'CommandLineParser.php';
require_once 'DashboardCounterExtracter.php';
if(defined('STDIN') ){
	echo chr(27).chr(91).'H'.chr(27).chr(91).'J';
	$runAsUser=trim(shell_exec('whoami'));
	echo("Lex dashboard tool running from CLI [" . $runAsUser . "]. \n");
	$args = CommandLineParser::parseArgs($_SERVER['argv']);
	$dashboardCounterExtracter = new \libraries\lfdictionary\dashboardtool\DashboardCounterExtracter($args);	
	$dashboardCounterExtracter->process();
	exit(0);
}else{
	echo("run from CLI only");
}

?>

