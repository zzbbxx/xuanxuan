<?php
/**
 * Compare hash password use random
 * 
 * @param  string    $password 
 * @param  object    $user 
 * @access public
 * @return void
 */
public function compareHashPassword($password, $user)
{
    /* Check Hash if password leng is 40. */
    $passwordLength = strlen($password);
    if($passwordLength == 32)
    {
        $hash = $this->session->random ? md5($user->password . $this->session->random) : $user->password;
        if($password == $hash) return true;
    }

    return parent::compareHashPassword($password, $user);
}
