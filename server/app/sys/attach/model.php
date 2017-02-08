<?php
class attachModel extends model
{
    public function getList($gid = '')
    {
        $files = $this->dao->select('t1.file as id, t2.title, t2.extension, t2.size, t2.addedBy')
            ->from(TABLE_IM_CHATFILE)->alias('t1')
            ->leftjoin(TABLE_FILE)->alias('t2')->on('t1.file=t2.id')
            ->where('t2.objectType')->eq('chat')
            ->beginIF($gid)->andWhere('t1.gid')->eq($gid)->fi()
            ->fetchAll();

        foreach($files as $file)
        {
            if($file->extension) $file->title .= '.' . $file->extension;
            unset($file->extension);
        }

        return $files;
    }
}

