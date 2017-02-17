#!/usr/bin/env php
<?php
error_reporting(E_ALL);

/* Define the run mode as front. */
define('RUN_MODE', 'server');

/* Load the framework. */
$serverRoot = dirname(__FILE__);
include $serverRoot . '/../../framework/router.class.php';
include $serverRoot . '/../../framework/control.class.php';
include $serverRoot . '/../../framework/model.class.php';
include $serverRoot . '/../../framework/helper.class.php';
include $serverRoot . '/daemon.class.php';

$_COOKIE['lang'] = 'zh-cn';
/* Instance the daemon and run it. */
$app = daemon::createApp('xuanxuan', '', 'daemon');
$common = $app->loadCommon();
$port   = $app->config->socket->port;
if(!$port) $port = '8080';

echo sprintf($app->lang->xuanxuan->start, __FILE__);

$app->start('0.0.0.0', $port);
