#!/bin/sh
#
# Start server.php if it is not running.
#
# @author Gang Liu <liugang@cnezsoft.com>
#
username='www-data'  # Use the run user of your web server as username.
running=`ps aux|grep 'php ./server.php'|awk '$1=="www-data"{print $0}'`
if [ ! "$running" ]; then
    nohup sudo sudo -u $username ./server.php 2>1&
fi
