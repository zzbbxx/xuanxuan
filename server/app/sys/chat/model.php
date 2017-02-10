<?php
class chatModel extends model
{
    /**
     * Get a user. 
     * 
     * @param  int    $userID 
     * @access public
     * @return object 
     */
    public function getUserByUserID($userID = 0)
    {
        $user = $this->dao->select('id, account, realname, avatar, role, dept, status, admin, gender, email, mobile, site')->from(TABLE_USER)->where('id')->eq($userID)->fetch();
        if($user)
        {
            $user->id   = (int)$user->id;
            $user->dept = (int)$user->dept;
        }

        return $user;
    }
    
    /**
     * Get user list. 
     * 
     * @param  array  $idList 
     * @access public
     * @return array
     */
    public function getUserList($idList = array())
    {
        $userList = $this->dao->select('id, realname, avatar, status, admin, account, role, dept, gender, email, mobile, site')
            ->from(TABLE_USER)->where('deleted')->eq('0')
            ->beginIF($idList)->andWhere('id')->in($idList)->fi()
            ->fetchAll();

        foreach($userList as $user) 
        {
            $user->id   = (int)$user->id;
            $user->dept = (int)$user->dept;
        }

        return $userList;
    }

    /**
     * Get users to send messages. 
     * 
     * @param  array  $idList 
     * @access public
     * @return array
     */
    public function getUsersToNotify($idList = array())
    {
        if(empty($idList)) return array();
        $userList = $this->dao->select('id, status')
            ->from(TABLE_USER)->where('deleted')->eq('0')
            ->andWhere('id')->in($idList)
            ->fetchAll();

        return $userList;
    }
    
    /**
     * Edit a user. 
     * 
     * @param  object $user 
     * @access public
     * @return object 
     */
    public function editUser($user = null)
    {
        if(!isset($user->id)) $user->id = $this->session->user->id;
        $this->dao->update(TABLE_USER)->data($user)->where('id')->eq($user->id)->exec();
        return $this->getUserByUserID($user->id);
    }

    /**
     * Get member list by gid.  
     * 
     * @param  string $gid 
     * @access public
     * @return array
     */
    public function getMemberListByGID($gid = '')
    {
        $chat = $this->getByGID($gid);
        if(!$chat) return array();

        if($chat->type == 'system')
        {
            $memberList = $this->dao->select('id')->from(TABLE_USER)->where('deleted')->eq('0')->fetchAll();
        }
        else
        {
            $memberList = $this->dao->select('user as id')
                ->from(TABLE_IM_CHATUSER)
                ->where('quit')->eq('0000-00-00 00:00:00')
                ->beginIF($gid)->andWhere('cgid')->eq($gid)->fi()
                ->fetchAll();
        }
        
        $members = array();
        foreach($memberList as $member) $members[] = (int)$member->id;

        return $members;
    }

    /**
     * Get message list. 
     * 
     * @param  array  $idList 
     * @access public
     * @return array 
     */
    public function getMessageList($idList = array(), $pager = null)
    {
        $messageList = $this->dao->select('*')
            ->from(TABLE_IM_MESSAGE)
            ->where('1')
            ->beginIF($idList)->andWhere('id')->in($idList)->fi()
            ->orderBy('id_desc')
            ->page($pager)
            ->fetchAll();

        foreach($messageList as $message) 
        {
            $message->id   = (int)$message->id;
            $message->user = (int)$message->user;
            $message->date = strtotime($message->date);
        }

        return $messageList;
    }

    /**
     * Get message list by cgid.  
     * 
     * @param  string $cgid 
     * @access public
     * @return array
     */
    public function getMessageListByCGID($cgid = '', $pager = null)
    {
        $messageList = $this->dao->select('*')->from(TABLE_IM_MESSAGE)
            ->where('cgid')->eq($cgid)
            ->orderBy('id_desc')
            ->page($pager)
            ->fetchAll();

        foreach($messageList as $message)
        {
            $message->id   = (int)$message->id;
            $message->user = (int)$message->user;
            $message->date = strtotime($message->date);
        }

        return $messageList;
    }

    /**
     * Get chat list. 
     * 
     * @param  bool   $public 
     * @access public
     * @return array 
     */
    public function getList($public = true)
    {
        $chatList = $this->dao->select('*')->from(TABLE_IM_CHAT)->where('public')->eq($public)->fetchAll();

        foreach($chatList as $chat) 
        {
            $chat->id             = (int)$chat->id;
            $chat->subject        = (int)$chat->subject;
            $chat->public         = (int)$chat->public;
            $chat->createdDate    = strtotime($chat->createdDate);
            $chat->editedDate     = $chat->editedDate == '0000-00-00 00:00:00' ? '' : strtotime($chat->editedDate);
            $chat->lastActiveTime = $chat->lastActiveTime == '0000-00-00 00:00:00' ? '' : strtotime($chat->lastActiveTime);
        }

        return $chatList;
    }

    /**
     * Get chat list by userID.  
     * 
     * $param  int    $userID
     * $param  bool   $star
     * @access public
     * @return array
     */
    public function getListByUserID($userID = 0, $star = false)
    {
        if(!$userID) $userID = $this->session->user->id;

        $systemChat = $this->dao->select('*, 0 as star, 0 as hide, 0 as mute')
            ->from(TABLE_IM_CHAT)
            ->where('type')->eq('system')
            ->fetchAll();

        $chatList = $this->dao->select('t1.*, t2.star, t2.hide, t2.mute')
            ->from(TABLE_IM_CHAT)->alias('t1')
            ->leftjoin(TABLE_IM_CHATUSER)->alias('t2')->on('t1.gid=t2.cgid')
            ->where('t2.quit')->eq('0000-00-00 00:00:00')
            ->andWhere('t2.user')->eq($userID)
            ->beginIF($star)->andWhere('t2.star')->eq($star)->fi()
            ->fetchAll();

        $chatList = array_merge($systemChat, $chatList);

        foreach($chatList as $chat)
        {
            $chat->id             = (int)$chat->id;
            $chat->subject        = (int)$chat->subject;
            $chat->public         = (int)$chat->public;
            $chat->createdDate    = strtotime($chat->createdDate);
            $chat->editedDate     = $chat->editedDate == '0000-00-00 00:00:00' ? '' : strtotime($chat->editedDate);
            $chat->lastActiveTime = $chat->lastActiveTime == '0000-00-00 00:00:00' ? '' : strtotime($chat->lastActiveTime);
            $chat->star           = (int)$chat->star;
            $chat->hide           = (int)$chat->hide;
            $chat->mute           = (int)$chat->mute;
        }

        return $chatList;
    }

    /**
     * Get a chat by gid.  
     * 
     * @param  string $gid 
     * $param  bool   $members
     * @access public
     * @return object 
     */
    public function getByGID($gid = '', $members = false)
    {
        $chat = $this->dao->select('*')->from(TABLE_IM_CHAT)->where('gid')->eq($gid)->fetch();

        if($chat)
        {
            $chat->id             = (int)$chat->id;
            $chat->subject        = (int)$chat->subject;
            $chat->public         = (int)$chat->public;
            $chat->createdDate    = strtotime($chat->createdDate);
            $chat->editedDate     = $chat->editedDate == '0000-00-00 00:00:00' ? '' : strtotime($chat->editedDate);
            $chat->lastActiveTime = $chat->lastActiveTime == '0000-00-00 00:00:00' ? '' : strtotime($chat->lastActiveTime);

            if($members) $chat->members = $this->getMemberListByGID($gid);
        }

        return $chat;
    }

    /**
     * Create a chat. 
     * 
     * @param  string $gid 
     * @param  string $name 
     * @param  string $type 
     * @param  array  $members 
     * @param  int    $subjectID 
     * $param  bool   $public
     * @access public
     * @return object 
     */
    public function create($gid = '', $name = '', $type = '', $members = array(), $subjectID = 0, $public = false)
    {
        $chat = new stdclass();
        $chat->gid         = $gid;
        $chat->name        = $name;
        $chat->type        = $type;
        $chat->subject     = $subjectID;
        $chat->createdBy   = $this->session->user->account;
        $chat->createdDate = helper::now();

        if($public) $chat->public = 1;

        $this->dao->insert(TABLE_IM_CHAT)->data($chat)->exec();

        /* Add members to chat. */
        foreach($members as $member)
        {
            $this->joinChat($gid, $member);
        }

        return $this->getByGID($gid, true);
    }

    /**
     * Update a chat. 
     * 
     * @param  object $chat
     * @access public
     * @return object
     */
    public function update($chat = null)
    {
        if($chat)
        {
            $chat->editedBy   = $this->session->user->account;
            $chat->editedDate = helper::now();
            $this->dao->update(TABLE_IM_CHAT)->data($chat)->where('gid')->eq($chat->gid)->batchCheck($this->config->chat->require->edit, 'notempty')->exec();
        }

        /* Return the changed chat. */
        return $this->getByGID($chat->gid, true);
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
        $chat = $this->getByGID($gid);
        $adminList = explode(',', $chat->admins);
        foreach($admins as $admin)
        {
            if($isAdmin)
            {
                $adminList[] = $admin;
            }
            else
            {
                $key = array_search($admin, $adminList);
                if($key) unset($adminList[$key]);
            }
        }
        $adminList = implode(',', $adminList);
        $this->dao->update(TABLE_IM_CHAT)->set('admins')->eq($adminList)->where('gid')->eq($gid)->exec();

        return $this->getByGID($gid, true);
    }

    /**
     * Star or cancel star a chat. 
     * 
     * @param  string $gid 
     * @param  bool   $star 
     * @access public
     * @return object 
     */
    public function starChat($gid = '', $star = true)
    {
        $userID = $this->session->user->id;

        $this->dao->update(TABLE_IM_CHATUSER)
            ->set('star')->eq($star)
            ->where('cgid')->eq($gid)
            ->andWhere('user')->eq($userID)
            ->exec();

        return $this->getByGID($gid, true);
    }

    /**
     * Hide or display a chat. 
     * 
     * @param  string $gid 
     * @param  bool   $hide 
     * @access public
     * @return bool 
     */
    public function hideChat($gid = '', $hide = true)
    {
        $this->dao->update(TABLE_IM_CHATUSER)
            ->set('hide')->eq($hide)
            ->where('cgid')->eq($gid)
            ->andWhere('user')->eq($this->session->user->id)
            ->exec();

        return !dao::isError();
    }

    /**
     * Join or quit a chat. 
     * 
     * @param  string $gid 
     * @param  int    $userID 
     * @param  bool   $join 
     * @access public
     * @return bool
     */
    public function joinChat($gid = '', $userID = 0, $join = true)
    {
        if(!$userID) $userID = $this->session->user->id;

        if($join)
        {
            /* Join chat. */
            $data = $this->dao->select('*')->from(TABLE_IM_CHATUSER)->where('cgid')->eq($gid)->andWhere('user')->eq($userID)->fetch();
            if($data) 
            {
                /* If user hasn't quit the chat then return. */
                if($data->quit != '0000-00-00 00:00:00') return true;

                /* If user has quited the chat then update the record. */
                $data = new stdclass();
                $data->join = helper::now();
                $data->quit = '0000-00-00 00:00:00';
                $this->dao->update(TABLE_IM_CHATUSER)->data($data)->where('cgid')->eq($gid)->andWhere('user')->eq($userID)->exec();

                return !dao::isError();
            }

            /* Create a new record about user's chat info. */
            $data = new stdclass();
            $data->cgid = $gid;
            $data->user = $userID;
            $data->join = helper::now();

            $this->dao->insert(TABLE_IM_CHATUSER)->data($data)->exec();

            $id = $this->dao->lastInsertID();
            
            $this->dao->update(TABLE_IM_CHATUSER)->set('`order`')->eq($id)->where('id')->eq($id)->exec();
        }
        else
        {
            /* Quit chat. */
            $this->dao->update(TABLE_IM_CHATUSER)->set('quit')->eq(helper::now())->where('cgid')->eq($gid)->andWhere('user')->eq($userID)->exec();
        }
        return !dao::isError();
    }

    /**
     * Create messages.  
     * 
     * @param  array  $messageList 
     * @access public
     * @return array 
     */
    public function createMessage($messageList = array())
    {
        $idList   = array();
        $chatList = array();
        foreach($messageList as $message)
        {
            $msg = $this->dao->select('*')->from(TABLE_IM_MESSAGE)->where('gid')->eq($message->gid)->fetch();
            if($msg && ($msg->contentType == 'image' || $msg->contentType == 'file'))
            {
                $this->dao->update(TABLE_IM_MESSAGE)->set('content')->eq($message->content)->where('id')->eq($msg->id)->exec();
                $idList[] = $msg->id;
            }
            elseif(!$msg)
            {
                if(!(isset($message->user) && $message->user)) $message->user = $this->session->user->id;
                if(!(isset($message->date) && $message->date)) $message->date = helper::now();
                
                $this->dao->insert(TABLE_IM_MESSAGE)->data($message)->exec();
                $idList[] = $this->dao->lastInsertID();
            }
            $chatList[$message->cgid] = $message->cgid;
        }
        if(empty($idList)) return array();

        $this->dao->update(TABLE_IM_CHAT)->set('lastActiveTime')->eq(helper::now())->where('gid')->in($chatList)->exec();

        return $this->getMessageList($idList);
    }

    /**
     * Create offline messages. 
     * 
     * @param  array  $userList
     * @param  object $data 
     * @param  bool   $online true: the message will only been send to online users. | false: the message will been send to all users.
     * @param  bool   $self   true: the message will been send to the current logined user. | false: the message won't been send to the current logined user.
     * @access public
     * @return void
     */
    public function send($userList = array(), $data = null, $online = true, $self = false)
    {
        /* Get users. */
        if($userList && $data)
        {
            $message = new stdclass();
            foreach($userList as $user)
            {
                if(!$self  && $user->id == $this->session->user->id) continue;
                if($online && $user->status == 'offline') continue;

                /* The message will be pushed order by level, id. */
                if(isset($data->level)) $message->level = $data->level;

                $message->user   = $user->id;
                $message->module = $data->module;
                $message->method = $data->method;
                $message->data   = json_encode($data->data);
                $this->dao->insert(TABLE_IM_USERMESSAGE)->data($message)->exec();
            }
        }
    }
}
