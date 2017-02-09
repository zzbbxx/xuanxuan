<?php
/**
 * The daemon server.
 * 
 * @copyright Copyright 2009-2015 QingDao Nature Easy Soft Network Technology Co,LTD (www.cnezsoft.com)
 * @author    chunsheng wang <chunsheng@cnezsoft.com> 
 * @package   xuanxuan 
 * @uses      router
 * @license   ZPLV1
 * @version   $Id$
 * @Link      http://www.zentao.net
 */
class daemon extends router
{
    /**
     * The daemon version.
     * 
     * @var string
     * @access public
     */
    public $version = '1.0';

    /**
     * The master socket.
     * 
     * @var object
     * @access public
     */
    public $master = '';

    /**
     * The socket queue.
     * 
     * @var array 
     * @access public
     */
    public $sockets = array();

    /**
     * The user queue. 
     * 
     * @var array 
     * @access public
     */
    public $users = array();

    /**
     * The request send by client.
     * 
     * @var object
     * @access public
     */
    public $request;

    /**
     * The response send to client.
     * 
     * @var object
     * @access public
     */
    public $response;

    /**
     * The EOF of the message.
     * 
     * @var string
     * @access public
     */
    public $eof = "\n";

    /**
     * 
     * @param  string   $ip 
     * @param  int      $port 
     * @access public
     * @return void
     */
    public function socket($ip, $port)
    {
        $master = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)  or $this->triggerError('socket create failed', __FILE__, __LINE__, true);
        socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1) or $this->triggerError('socket set failed', __FILE__, __LINE__, true);
        socket_bind($master, $ip, $port)                        or $this->triggerError('socket bind failed', __FILE__, __LINE__, true);
        socket_listen($master, 20)                              or $this->triggerError('socket listen failed', __FILE__, __LINE__, true);

        $this->master = $master;
        $this->register($master);

        $this->log("$master started.");
    }

    /**
     * Instance a daemon instance and run it.
     *
     * @param  int    $ip 
     * @param  int    $port 
     * @access public
     * @return void
     */
    public function start($ip, $port)
    {
        $this->socket($ip, $port);
        $this->createSystemChat();
        $this->updateUserStatus();
        while(true) $this->process();
    }

    /**
     * Create a system chat.  
     * 
     * @access public
     * @return void
     */
    public function createSystemChat()
    {
        $chatID = $this->dbh->query("SELECT id FROM " . TABLE_IM_CHAT . " where type='system'")->fetch();
        if(!$chatID)
        {
            $now = helper::now();
            $id  = md5(time(). mt_rand());
            $gid = substr($id, 0, 8) . '-' . substr($id, 8, 4) . '-' . substr($id, 12, 4) . '-' . substr($id, 16, 4) . '-' . substr($id, 20, 12);
            $this->dbh->exec("INSERT INTO " . TABLE_IM_CHAT . " (gid, name, type, createdBy, createdDate) values ('$gid', '', 'system', 'system', '$now')");
        }
    }

    /**
     * Update user status to offline. 
     * 
     * @access public
     * @return void
     */
    public function updateUserStatus()
    {
        $this->dbh->exec("UPDATE " . TABLE_USER . " set `status` = 'offline'");
    }

    /**
     * Process every sockets, read, parse and response.
     * 
     * @access public
     * @return void
     */
    public function process()
    {
        /* Copy all $this->sockets to the temp $sockets and select those changed. */
        $sockets = $this->sockets;
        $writes  = null;
        $excepts = null;

        /* Select changed sockets. */
        socket_select($sockets, $writes, $excepts, 1);
        foreach($sockets as $socket) 
        {
            $this->log("$socket selected.");
            if($socket == $this->master) $this->accept($this->master);
            if($socket != $this->master) $this->read($socket) && $this->response($socket);
        }

        /* Send messages to client. */
        $this->send();
    }

    /**
     * Send messages to client. 
     * 
     * @access public
     * @return void
     */
    public function send()
    {
        if($this->sockets && $this->users)
        {
            $userMessages = $this->getMessages();

            $idList = array();
            foreach($userMessages as $user => $messages)
            {
                /* Find client socket and send messages. */
                $strClient = array_search($user, $this->users);
                if($strClient)
                {
                    $client = $this->sockets[$strClient];
                    foreach($messages as $message)
                    {
                        unset($message->level);
                        unset($message->user);
                        $message->id   = (int)$message->id;
                        $message->data = json_decode($message->data);
                    }
                    $result = socket_write($client, helper::removeUTF8Bom(json_encode($messages)) . $this->eof);
                    if($result === false)
                    {
                        $errorCode = socket_last_error($client);
                        $error     = socket_strerror($errorCode);
                        $this->log($error);
                    }
                    else
                    {
                        foreach($messages as $message) $idList[] = $message->id;
                    }
                }
            }
            /* Delete the sent messages. */
            $this->deleteMessages($idList);
        }
    }

    /**
     * Get messages to sent. 
     * 
     * @access public
     * @return array
     */
    public function getMessages()
    {
        $messages = array();
        try
        {
            /* Group messages by user. */
            $stmt = $this->dbh->query("SELECT * FROM " . TABLE_IM_USERMESSAGE . " ORDER BY `level`, `id`");
            while($message = $stmt->fetch())
            {
                $messages[$message->user][] = $message;
            }
        }
        catch(PDOException $exception)
        {
            $this->log($exception->getMessage());
        }

        return $messages;
    }

    /**
     * Delete sent messages.
     * 
     * @param  array  $idList 
     * @access public
     * @return void
     */
    public function deleteMessages($idList = array())
    {
        if($idList) 
        {
            $idList = implode(',', $idList);
            try
            {
                $this->dbh->exec("DELETE FROM " . TABLE_IM_USERMESSAGE . " WHERE `id` IN ({$idList})");
            }
            catch(PDOException $exception)
            {
                $this->log($exception->getMessage());
            }
        }
    }

    /**
     * Accept a connection and return a client socket.
     * 
     * @param  object    $master 
     * @access public
     * @return void
     */
    public function accept($master)
    {
        $client = socket_accept($master);
        $this->register($client);

        socket_getpeername($client, $ip, $port);
        $this->log("$client connected, $ip:$port.");
    }

    /**
     * Read the message from a socket.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function read($socket)
    {
        /* Init them. */
        $code = $raw = '';
        $this->request = new stdclass();

        while(true)
        {
            $code = socket_recv($socket, $buffer, 1024, 0); 
            $raw .= $buffer;

            /* The code is error. */
            if(!$code) 
            {
                $this->request->code = $code;
                return true;
            }

            /* Finish reading. */
            if(strpos($buffer, $this->eof) !== false)
            {
                $this->request = json_decode($raw);
                $this->request->code = $code;
                $this->request->raw  = $raw;
                return true;
            }
        }
    }

    /**
     * Response to a client.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function response($client)
    {
        if(!$this->request->code) return $this->close($client);
    
        $this->startSession();
        $this->parseRequest();
        $this->loadModule();
        $this->stopSession();
        $this->bindUser($client);
        
        if($this->response) 
        {
            $response = $this->packResponse();
            socket_write($client, $response);
            $this->log($response);
        }
    }

    /**
     * Bind user with client. 
     * 
     * @param  int    $client 
     * @access public
     * @return void
     */
    public function bindUser($client)
    {
        if($this->response->result == 'success')
        {
            if($this->getModuleName() == 'chat') 
            {
                if($this->getMethodName() == 'login')
                {
                    $userID    = $this->response->data->id;
                    $account   = $this->response->data->account;
                    $oldClient = array_search($userID, $this->users);
                    /* If user has logined then kick off user from old client. */
                    if($oldClient)
                    {
                        $this->kickOff($oldClient);
    
                        unset($this->sockets[$oldClient]);
                        unset($this->users[$oldClient]);
                    }

                    /* Bind user with client. */
                    $this->users[strval($client)] = $userID;
                    $this->log("User $account logined from socket $client.");
                }
                elseif($this->getMethodName() == 'logout')
                {
                    $userID    = $this->response->data->id;
                    $account   = $this->response->data->account;
                    $oldClient = array_search($userID, $this->users);
                    if($oldClient)
                    {
                        unset($this->sockets[$oldClient]);
                        unset($this->users[$oldClient]);
                    }
                    $this->log("User $account logout from socket $oldClient.");
                }
            }
        }
    }

    /**
     * Kick off user from old client.  
     * 
     * @param  string $strClient 
     * @access public
     * @return void
     */
    public function kickOff($strClient = '')
    {
        $data = new stdclass();
        $data->module  = 'chat';
        $data->method  = 'kickoff';
        $data->message = 'This account logined in another place.';

        $socket = $this->sockets[$strClient];
        socket_write($socket, helper::removeUTF8Bom(json_encode($data)) . $this->eof);
    }

    /**
     * Register a socket to the sockets queue.
     * 
     * @param  object $socket 
     * @access public
     * @return void
     */
    public function register($socket)
    {
        $this->sockets[strval($socket)] = $socket;
    }

    /**
     * Unregister a socket from the sockets queue.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function unregister($socket)
    {
        unset($this->sockets[strval($socket)]);
        unset($this->users[strval($socket)]);
    }

    /**
     * Close a socket.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function close($socket)
    {
        socket_close($socket);
        $this->logout($socket);
        $this->unregister($socket);
        $this->log("$socket closed.");
    }

    /**
     * Update user status. 
     * 
     * @param  object $socket 
     * @access public
     * @return void
     */
    public function logout($socket)
    {
        $userID = $this->users[strval($socket)];
        if($userID) $this->dbh->exec("UPDATE " . TABLE_USER . " SET status = 'offline' WHERE `id` = $userID");
    }

    /**
     * Parse the request.
     * 
     * @access public
     * @return void
     */
    public function parseRequest()
    {
        $this->setModuleName($this->request->module);
        $this->setMethodName($this->request->method);
        $this->setControlFile();
        $this->setViewType();
    }

    /**
     * Load a module.
     *
     * @access public
     * @return bool|object  if the module object of die.
     */
    public function loadModule()
    {
        /* Init the response. */
        $this->response = new stdclass();
        $this->response->result = 'success';

        /* Include the contror file of the module. */
        $appName    = $this->getAppName();
        $moduleName = $this->getModuleName();
        $methodName = $this->getMethodName();
        $file2Included = $this->setActionExtFile() ? $this->extActionFile : $this->getControlFile();
        chdir(dirname($file2Included));
        helper::import($file2Included);

        /* Set the class name of the control. */
        $className = class_exists("my$moduleName") ? "my$moduleName" : $moduleName;
        if(!class_exists($className))
        {
            $this->triggerError("the control $className not found", __FILE__, __LINE__);
            $this->response->result  = 'fail';
            $this->response->message = "control $className not found.";
            return false;
        }

        /* Create a instance of the control. */
        $module = new $className();
        if(!method_exists($module, $methodName))
        {
            $this->triggerError("the module $moduleName has no $methodName method", __FILE__, __LINE__);
            $this->response->result  = 'fail';
            $this->response->message = "method $methodName not found.";
            return false;
        }
        $this->control = $module;

        /* Merge params. */
        $params = array();
        if(isset($this->request->params)) 
        {
            $params = $this->mergeParams2($appName, $className, $methodName, $this->request->params);
        }
        if($params === false) 
        {
            $this->triggerError("param error: {$this->request->raw}", __FILE__, __LINE__);
            $this->response->result  = 'fail';
            $this->response->message = "param error.";
            return false;
        }

        /* Call the method. */
        $this->response = call_user_func_array(array($module, $methodName), $params);
        return true;
    }

    /**
     * Set view type.
     * 
     * @access public
     * @return void
     */
    public function setViewType()
    {
        $this->viewType = 'json';
    }

    /**
     * Merge default params and request params.
     * 
     * @param  string $appName
     * @param  string $className 
     * @param  string $methodName 
     * @param  array  $requestParams 
     * @access public
     * @return void
     */
    public function mergeParams2($appName, $className, $methodName, $requestParams)
    {
        /* Include default value for module*/
        $defaultValueFiles = glob($this->getTmpRoot() . "defaultvalue/*.php");
        if($defaultValueFiles) foreach($defaultValueFiles as $file) helper::import($file);

        /* Get the default setings of the method to be called useing the reflecting. */
        $defaultParams = array();
        $methodReflect = new reflectionMethod($className, $methodName);
        foreach($methodReflect->getParameters() as $param)
        {
            $paramName = $param->getName();
            $default = '_NOT_SET';

            if($param->isDefaultValueAvailable()) $default = $param->getDefaultValue();
            if(isset($paramDefaultValue[$appName][$className][$methodName][$paramName])) $default = $paramDefaultValue[$appName][$className][$methodName][$paramName];

            $defaultParams[$paramName] = $default;
        }

        /* Merge them. */
        $i = 0;
        $requestParams = array_values((array)$requestParams);
        foreach($defaultParams as $key => $defaultValue)
        {
            if(isset($requestParams[$i]))
            {
                $defaultParams[$key] = $requestParams[$i];
                $i ++;
                continue;
            }

            if($defaultValue === '_NOT_SET') return false;
        }

        return $defaultParams;
    }

    /**
     * Pack the response.
     * 
     * @access public
     * @return void
     */
    public function packResponse()
    {
        $this->response->sid    = session_id();
        $this->response->module = $this->getModuleName();
        $this->response->method = $this->getMethodName();
        return helper::removeUTF8Bom(json_encode($this->response)) . $this->eof;
    }

    /**
     * Start session.
     * 
     * @access public
     * @return void
     */
    public function startSession()
    {
        session_id($this->setSessionID());
        session_start();
    }

    /**
     * Stop session.
     * 
     * @access public
     * @return void
     */
    public function stopSession()
    {
        session_write_close();
    }

    /**
     * Set the session id.
     * 
     * @access public
     * @return void
     */
    public function setSessionID()
    {
        if(!empty($this->request->sid)) return $this->request->sid;
        return md5(uniqid() . microtime() . mt_rand());
    }

    /**
     * Save a log.
     * 
     * @param  string    $log 
     * @access public
     * @return void
     */
    public function log($log)
    {
        $log  = date('Y-m-d H:i:s') . ' LOG: ' . $log . "\n";
        $file = $this->getLogRoot() . 'php.' . date('Ymd') . '.log.php';
        if(!is_file($file)) file_put_contents($file, "<?php\n die();\n?>\n");

        $fh = @fopen($file, 'a');
        if($fh) fwrite($fh, print_r($log)) && fclose($fh);

        echo $log; 
    }
}
