<?php
class attach extends control
{
    /**
     * Get file list. 
     * 
     * @param  string $gid 
     * @access public
     * @return object
     */
    public function getList($gid = '')
    {
        $this->app->loadLang('chat');
        $fileList = $this->attach->getList($gid);

        $response = new stdclass();
        if(dao::isError())
        {
            $response->result  = 'fail';
            $response->message = 'Get attach list failed.';
        }
        else
        {
            $response->result = 'success';
            $response->data   = $fileList;
        }

        return $response;
    }

    /**
     * Upload files for an object.
     * 
     * @access public
     * @return object
     */
    public function upload()
    {
        $gid    = $_POST['gid'];
        $chatID = $this->dao->select('id')->from(TABLE_IM_CHAT)->where('gid')->eq($gid)->fetch('id');
        $files  = $this->loadModel('file')->getUpload('files');
        if($files) $files = $this->file->saveUpload('chat', $chatID);

        $file = new stdclass();
        $fileList = array();
        foreach($files as $id => $title)
        {
            $file->gid   = $gid;
            $file->file  = $id;
            $file->title = $title;

            $this->dao->insert(TABLE_IM_CHATFILE)->data($file)->exec();

            $tmpFile = new stdclass();
            $tmpFile->id    = $id;
            $tmpFile->title = $title;

            $fileList[] = $tmpFile;
        }

        $response = new stdclass();
        $response->module = $this->moduleName;
        $response->method = $this->methodName;
        $response->result = 'success';
        $response->data   = $fileList;

        die(json_encode($response));
    }

    /**
     * Down a file.
     * 
     * @param  int    $fileID 
     * @param  string $mouse 
     * @access public
     * @return void
     */
    public function download($fileID, $mouse = '')
    {
        $this->locate($this->createLink('file', 'download', "fileID=$fileID&mouse=$mouse"));
    }
}
