#!/bin/sh
#
# Start server.php if it is not running.
#
# @author Gang Liu <liugang@cnezsoft.com>
#
running=`ps aux|grep 'php ./server.php'|awk '$1=="www-data"{print $0}'`
if [ ! "$running" ]; then
    nohup sudo sudo -u www-data ./server.php 2>1&
fi
