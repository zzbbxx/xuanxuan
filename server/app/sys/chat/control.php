<?php
class chat extends control
{
    /**
     * Login.  
     * 
     * @param  string $account 
     * @param  string $password encrypted password
     * @param  string $status   online | away | busy
     * @access public
     * @return void
     */
    public function login($account = '', $password = '', $status = 'online')
    {
        $password = md5($password . $account);
        $user     = $this->loadModel('user')->identify($account, $password);

        $response = new stdclass();
        if($user) 
        {
            $data = new stdclass();
            $data->id     = $user->id;
            $data->status = $status;

            $loginUser = $this->chat->editUser($data);

            $user->rights = $this->user->authorize($user);
            /* Save to session. */
            $this->session->set('user', $user);
            $this->loadModel('action')->create('user', $user->id, 'login', '', 'xuanxuan', $user->account);
            
            /* Push the logined user to all online users. */
            $data = new stdclass();
            $data->module = $this->moduleName;
            $data->method = $this->methodName;
            $data->data   = $loginUser;

            $userList = $this->chat->getUserList();
            
            $this->chat->send($userList, $data);

            /* Push all users to the logined user. */
            $data->level  = 0;
            $data->method = 'userGetlist';
            $data->data   = $userList;
            $this->chat->send(array($loginUser), $data, true, true);

            /* Push chat list to the logined user. */
            $chatList = $this->chat->getListByUserID($user->id);
            if($chatList)
            {
                foreach($chatList as $chat)
                {
                    $chat->members = $this->chat->getMemberListByGID($chat->gid);
                }

                $data->level  = 1;
                $data->method = 'getList';
                $data->data   = $chatList;
                $this->chat->send(array($loginUser), $data, true, true);
            }

            $response->result = 'success';
            $response->data   = $loginUser;
        }
        else
        {
            $response->result = 'fail';
            $response->data   = $this->lang->user->loginFailed;
        }

        return $response;
    }

    /**
     * Logout. 
     * 
     * @access public
     * @return object
     */
    public function logout()
    {
        $user = new stdclass();
        $user->status = 'offline';

        $user     = $this->chat->editUser($user);
        $userList = $this->chat->getUserList();
            
        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $user;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        $response = new stdclass();
        $response->result = 'success';
        $response->data   = $user;

        if(isset($this->session->user->id)) $this->loadModel('action')->create('user', $this->session->user->id, 'logout', '', 'xuanxuan', $user->account);
        session_destroy();
        setcookie('za', false);
        setcookie('zp', false);

        return $response;
    }

    /**
     * Get user list.  
     * 
     * @access public
     * @return object
     */
    public function userGetList()
    {
        $userList = $this->chat->getUserList();

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get userlist failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $userList;
        }

        return $response;
    }

    /**
     * Change name of a user. 
     * 
     * @param  string $name 
     * @access public
     * @return object
     */
    public function userChangeName($name = '')
    {
        $user = new stdclass();
        $user->realname = $name;

        $user = $this->chat->editUser($user);

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $user;

        $userList = $this->chat->getUserList();

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Change name failed.';
        }
        else
        {
            $data = new stdclass();
            $data->id   = $user->id;
            $data->name = $name;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Keep session active
     * @return object
     */
    public function ping()
    {
        $response = new stdclass();
        $response->result = 'success';

        return $response;
    }

    /**
     * Change status of a user. 
     * 
     * @param  string $status   online | away | busy | offline
     * @access public
     * @return object
     */
    public function userChangeStatus($status = 'online')
    {
        $user = new stdclass();
        $user->status = $status;

        $user = $this->chat->editUser($user);

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $user;

        $userList = $this->chat->getUserList();
        
        /* Add to message queue. */
        $this->chat->send($userList, $data);

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Change status failed.';
        }
        else
        {
            $data = new stdclass();
            $data->id     = (int) $user->id;
            $data->status = $status;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Get public chat list. 
     * 
     * @param  bool   $public 
     * @access public
     * @return void
     */
    public function getPublicList($public = true)
    {
        $chatList = $this->chat->getList($public);

        foreach($chatList as $chat) 
        {
            $chat->members = $this->chat->getMemberListByGID($chat->gid);
        }

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get public chat list failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $chatList;
        }

        return $response;
    }

    /**
     * Get chat list of a user.  
     * 
     * $param  int    $userID
     * @access public
     * @return object 
     */
    public function getList($userID = 0)
    {
        $chatList = $this->chat->getListByUserID($userID);

        foreach($chatList as $chat) 
        {
            $chat->members = $this->chat->getMemberListByGID($chat->gid);
        }

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get chat list failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $chatList;
        }

        return $response;
    }

    /**
     * Get members of a chat. 
     * 
     * @param  string $gid 
     * @access public
     * @return object 
     */
    public function members($gid = '')
    {
        $memberList = $this->chat->getMemberListByGID($gid);

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get member list failed.';
        }
        else
        {
            $data = new stdclass();
            $data->gid     = $gid;
            $data->members = $memberList;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Create a chat. 
     * 
     * @param  string $gid 
     * @param  string $name 
     * @param  string $type 
     * @param  array  $members 
     * @param  int    $subjectID 
     * $param  bool   $public    true: the chat is public | false: the chat isn't public.
     * @access public
     * @return object 
     */
    public function create($gid = '', $name = '', $type = 'group', $members = array(), $subjectID = 0, $public = false)
    {
        $chat = $this->chat->getByGID($gid, true);

        if(!$chat)
        { 
            $chat = $this->chat->create($gid, $name, $type, $members, $subjectID, $public);

            $userList = $this->chat->getUsersToNotify(array_values($chat->members));
    
            $data = new stdclass();
            $data->module = $this->moduleName;
            $data->method = $this->methodName;
            $data->data   = $chat;
    
            /* Add to message queue. */
            $this->chat->send($userList, $data);
        }

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Create chat fail.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $chat;
        }

        return $response;
    }

    /**
     * Set admins of a chat. 
     * 
     * @param  string $gid 
     * @param  array  $admins 
     * @param  bool   $isAdmin 
     * @access public
     * @return object 
     */
    public function setAdmin($gid = '', $admins = array(), $isAdmin = true)
    {
        $response = new stdclass();
        if($this->session->user->admin != 'super')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notAdmin;
        }

        $chat = $this->chat->getByGID($gid);
        if($chat->type != 'system')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notSystemChat;

            return $response;
        }

        $chat = $this->chat->setAdmin($gid, $admins, $isAdmin);

        $userList = $this->chat->getUsersToNotify(array_values($chat->members));

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $chat;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Set admin failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $chat;
        }

        return $response;
    }

    /**
     * Join or quit a chat. 
     * 
     * @param  string $gid 
     * $param  bool   $join   true: join a chat | false: quit a chat.
     * @access public
     * @return object
     */
    public function joinChat($gid = '', $join = true)
    {
        $response = new stdclass();
        $chat = $this->chat->getByGID($gid);
        if($chat->type != 'group')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notGroupChat;

            return $response;
        }

        if($join && $chat->public == '0')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notPublic;

            return $response;
        }

        $this->chat->joinChat($gid, $this->session->user->id, $join);

        $chat = $this->chat->getByGID($gid, true);
        $userList = $this->chat->getUsersToNotify(array_values($chat->members));

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $chat;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        if(dao::isError())
        {
            if($join)
            {
                $message = 'Join chat failed.';
            }
            else
            {
                $message = 'Quit chat failed.';
            }

            $response->result  = 'fail';
            $response->message = $message;
        }
        else
        {
            $data = new stdclass();
            $data->gid  = $gid;
            $data->join = $join;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Change the name of a chat.  
     * 
     * @param  string $gid 
     * @param  string $name 
     * @access public
     * @return object
     */
    public function changeName($gid = '', $name ='')
    {
        $response = new stdclass();
        $chat = $this->chat->getByGID($gid);
        if($chat->type != 'group')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notGroupChat;

            return $response;
        }

        $chat->name = $name;
        $chat = $this->chat->update($chat);

        $userList = $this->chat->getUsersToNotify(array_values($chat->members));

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $chat;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Change name failed.';
        }
        else
        {
            $data = new stdclass();
            $data->gid  = $gid;
            $data->name = $name;

            $response->result = 'success';
            $response->data   = $data;

            $broadcast = new stdclass();
            $broadcast->module              = 'chat';
            $broadcast->method              = 'message';
            $broadcast->data                = new stdclass();
            $broadcast->data->cgid          = $gid;
            $broadcast->data->gid           = md5(uniqid() . microtime() . mt_rand());
            $broadcast->data->date          = helper::now();
            $broadcast->data->contentType   = 'text';
            $broadcast->data->user          = $this->session->user->id;
            $broadcast->data->type          = 'broadcast';
            $broadcast->data->content       = (empty($this->session->user->realname) ? ('@' . $this->session->user->account) : $this->session->user->realname) . $this->lang->chat->changeRenameTo . $name;
            $this->chat->send($userList, $broadcast, true, true);
        }

        return $response;
    }
    
    /**
     * Change a chat to be public or not. 
     * 
     * @param  string $gid 
     * @param  bool   $public true: change a chat to be public | false: change a chat to be not public. 
     * @access public
     * @return object
     */
    public function changePublic($gid = '', $public = true)
    {
        $response = new stdclass();
        $chat = $this->chat->getByGID($gid);
        if($chat->type != 'group')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notGroupChat;

            return $response;
        }

        $chat->public = $public ? 1 : 0;
        $chat = $this->chat->update($chat);

        $userList = $this->chat->getUsersToNotify(array_values($chat->members));

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $chat;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Change public failed.';
        }
        else
        {
            $data = new stdclass();
            $data->gid    = $gid;
            $data->public = $public;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }
    
    /**
     * Star or cancel star a chat.  
     * 
     * @param  string $gid 
     * @param  bool   $star true: star a chat | false: cancel star a chat. 
     * @access public
     * @return object
     */
    public function star($gid = '', $star = true)
    {
        $chatList = $this->chat->starChat($gid, $star);

        $response = new stdclass();
        if(dao::isError())
        {
            if($star)
            {
                $message = 'Star chat failed';
            }
            else
            {
                $message = 'Cancel star chat failed';
            }

            $response->result  = 'fail';
            $response->message = $message;
        }
        else
        {
            $data = new stdclass();
            $data->gid = $gid;
            $data->star = $star;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Hide or display a chat.  
     * 
     * @param  string $gid 
     * @param  bool   $hide true: hide a chat | false: display a chat. 
     * @access public
     * @return object
     */
    public function hide($gid = '', $hide = true)
    {
        $chatList = $this->chat->hideChat($gid, $hide);

        $response = new stdclass();
        if(dao::isError())
        {
            if($hide)
            {
                $message = 'Hide chat failed.';
            }
            else
            {
                $message = 'Display chat failed.';
            }

            $response->result  = 'fail';
            $response->message = $message;
        }
        else
        {
            $data = new stdclass();
            $data->gid  = $gid;
            $data->hide = $hide;

            $response->result = 'success';
            $response->data   = $data;
        }

        return $response;
    }

    /**
     * Add members to a chat or kick members from a chat. 
     * 
     * @param  string $gid 
     * @param  array  $members  
     * $param  bool   $join     true: add members to a chat | false: kick members from a chat.
     * @access public
     * @return object 
     */
    public function addMember($gid = '', $members = array(), $join = true)
    {
        $response = new stdclass();
        $chat = $this->chat->getByGID($gid);
        if($chat->type != 'group')
        {
            $response->result  = 'fail';
            $response->message = $this->lang->chat->notGroupChat;

            return $response;
        }

        foreach($members as $member) $this->chat->joinChat($gid, $member, $join);

        $chat->members = $this->chat->getMemberListByGID($gid);
        $userList = $this->chat->getUsersToNotify(array_values($chat->members));

        $data = new stdclass();
        $data->module = $this->moduleName;
        $data->method = $this->methodName;
        $data->data   = $chat;

        /* Add to message queue. */
        $this->chat->send($userList, $data);

        if(dao::isError())
        {
            if($join)
            {
                $message = 'Add member failed.';
            }
            else
            {
                $message = 'Kick member failed.';
            }

            $response->result  = 'fail';
            $response->message = $message;
        }
        else
        {
            $response->result = 'success';
            $response->data   = $chat;
        }

        return $response;
    }

    /**
     * Send message to a chat.
     * 
     * @param  array  $messages
     * @access public
     * @return object 
     */
    public function message($messages = array())
    {
        /* Check whether the logon user can send message in chat. */
        $errors = array();
        foreach($messages as $key => $message)
        {
            $chat = $this->chat->getByGID($message->cgid);
            
            if(!$chat)
            {
                $error = new stdclass();
                $error->gid      = $message->cgid;
                $error->messages = $this->lang->chat->notExist;

                $errors[] = $error;
                unset($messages[$key]);

                continue;
            }

            if($chat && !$chat->admins) continue;
            
            $admins = explode(',', $chat->admins);
            if(!in_array($this->session->user->id, $admins))
            {
                $error = new stdclass();
                $error->gid      = $message->cgid;
                $error->messages = $this->lang->chat->cantChat;

                $errors[] = $error;
                unset($messages[$key]);
            }
        }

        $messageList = $this->chat->createMessage($messages);

        foreach($messageList as $message)
        {
            $memberList = $this->chat->getMemberListByGID($message->cgid);
            $userList   = $this->chat->getUsersToNotify(array_values($memberList));

            $data = new stdclass();
            $data->module = $this->moduleName;
            $data->method = $this->methodName;
            $data->data   = $message;

            /* Add to message queue. */
            $this->chat->send($userList, $data, false);
        }

        $response = new stdclass();
        if($errors)
        {
            $response->result = 'fail';
            $response->data   = $errors;

            return $response;
        }

        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Send message failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $messageList;
        }

        return $response;
    }

    /**
     * Get history messages of a chat.
     * 
     * @param  string $gid 
     * @param  int    $recPerPage 
     * @param  int    $pageID 
     * @param  int    $recTotal 
     * @access public
     * @return object
     */
    public function history($gid = '', $recPerPage = 20, $pageID = 1, $recTotal = 0, $continued = false)
    {
        $this->app->loadClass('pager', $static = true);
        $pager = new pager($recTotal, $recPerPage, $pageID);

        if($gid)
        {
            $messageList = $this->chat->getMessageListByCGID($gid, $pager);
        }
        else
        {
            $messageList = $this->chat->getMessageList($idList = array(), $pager);
        }

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get history failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $messageList;

            $pagerData = new stdclass();
            $pagerData->recPerPage = $pager->recPerPage;
            $pagerData->pageID     = $pager->pageID;
            $pagerData->recTotal   = $pager->recTotal;
            $pagerData->gid        = $gid;
            $pagerData->continued  = $continued;

            $response->pager = $pagerData;
        }

        return $response;
    }

    /**
     * Save or get settings.
     * 
     * @param  string $account 
     * @param  string $settings 
     * @access public
     * @return object
     */
    public function settings($account = '', $settings = '')
    {
        if($settings)
        {
            $this->loadModel('setting')->setItem("system.sys.chat.settings.$account", $settings);
        }

        $response = new stdclass();
        if(!dao::isError())
        {
            $response->result = 'success';
            if(!$settings)
            {
                $response->data = $this->config->chat->settings->$account;
            }
        }
        else
        {
            $response->result  = 'fail';
            $response->message = 'Save settings failed.';
        }

        return $response;
    }
}
