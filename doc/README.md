# 使用帮助

此文档主要说明客户端功能及使用方法。服务器端 API 参见 [API 文档](https://github.com/easysoft/xuanxuan/tree/master/doc/server-api.md)。

## 下载与安装

选择适合自己操作系统版本进行下载安装：

 * Windows 7+：[安装包（xuanxuan-setup-1.0.0.exe）](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-setup-1.0.0.exe)、[zip 压缩包（xuanxuan-1.0.0.zip）](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-1.0.0.zip)
 * MacOS：[xuanxuan-1.0.0.dmg](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-1.0.0.dmg)

## 用户账号及登录

下面主要以 [然之协同](https://www.ranzhico.com/) 作为服务器端进行说明。

默认情况下，所有然之协同系统内的用户账号都可以作为喧喧的登录账号。启动喧喧之后会打开登录界面。

![喧喧登录界面图](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/login.png)

服务器地址为然之协同站点地址，账号和密码为然之协同上对应用户的账号和密码。填写完成后就可以进行登录。

如果登录账号可用，会在本地保存登录信息，方便你下次直接登录。如果你登录过多个账号，你还可以点击服务地址右侧的按钮来切换登录账号。

![喧喧登录界切换用户按钮](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/login-switch-user-button.png)

在切换登录账号对话框中选择要登录的用户来登录。点击列表右侧的删除图标则可以删除在本地保存的账号。

![喧喧登录界切换用户对话框界面](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/login-switch-user.png)

## 主界面

主界面主要由垂直功能导航和功能区域组成。在垂直功能导航上目前可以使用的功能包括：

* 查看当前登录用户，右键点击用户头像使用用户菜单；
* 切换【聊天会话】和【通讯录】功能；
* 展会和折叠功能导航。

![喧喧主界面功能导航](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/navbar.png)

## 聊天会话

聊天会话界面由会话菜单和聊天窗口组成。

### 会话菜单

会话菜单主要包括会话列表和创建新会话功能。

#### 会话列表

会话列表包含当前用户所有参与会话。默认按照会话最后活动时间排列。点击会话列表顶部标签按钮可以切换会话列表排序形式。

![喧喧会话菜单](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chats-menu.png)

在会话列表中点击会话名称即可打开会话聊天窗口。

#### 创建新会话

点击会话菜单标签页上的创建会话按钮，打开创建会话对话框。

![喧喧创建新会话](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-create.png)

勾选需要参与会话的联系人，点击创建按钮即可。如果所选择的联系人数目少于 2 个，则直接创建为一对一的会话，如果所选择的联系人数目多余 2 个，则创建为多人讨论组。

### 会话聊天

在会话聊天窗口中，你可以向当前会话发送 Emoji 表情、文本、图片、文件及屏幕截图。消息发送快捷键为 `Enter`，如果你需要在消息中输入换行，则可以通过 `Shift+Enter` 或 `Alt+Enter` 输入。

![喧喧会话聊天](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat.png)

#### Markdown

你可以通过发送 Markdown 文本来发送富文本消息。Markdown 语法参见 [Markdown 编辑器语法指南](https://segmentfault.com/markdown)。

为避免 XSS 攻击，你无法在 Markdown 中包含 HTML 代码。

#### Emoji 表情

你可以直接输入或粘贴 Emoji 字符来发送表情。如果你的系统或输入法还不支持 Emoji，可以在 [getemoji.com](http://getemoji.com/) 上复制你需要输入的 Emoji 字符。你也可以使用快捷短语来输入 Emoji，例如 `:grinning:` 来表示 😀 。

![喧喧会话 Emoji 表情](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-emoji.png)

### 发送文件或图片

通过点击文件或图片按钮从系统中选择要发送的图片或文件。你也可以直接从系统文件管理器中拖放文件到当前聊天窗口进行发送。

![喧喧会话图片文件](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-drag-file.png)

#### 截屏并发送

点击会话窗口底部工具栏的截图按钮可以截取当前屏幕图形并发送到会话中。右键点击截图按钮可以使用截屏的高级功能，包括隐藏当前窗口再截图及设置全局截图快捷键。即时喧喧应用窗口没有打开，你也可以使用全局截图快捷键来截取屏幕。

![喧喧会话截屏](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-capturescreen.png)

#### @他/她

在消息中输入 `@username` 可以标记用户。你也可以通过点击会话中的用户名称来实现。

#### 管理员

讨论组或频道的创建者为该会话的管理员。目前不支持转移管理员身份。

#### 公开频道

当讨论组会话被设置为公开频道之后，任何人都可以搜索并加入此频道。

#### 系统会话

系统会话为一个特殊的公开频道，改会话中自动包含服务器上的所有用户，包括将来加入的用户。系统中的超级用户为系统会话的管理员。

#### 侧边栏

点击会话窗口顶部工具栏上的侧边栏按钮可以打开会话的侧边栏界面。在侧边栏上可以看到参与此会话的所有人员及会话中收发的文件。

![喧喧侧边栏](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-sidebar.png)

#### 会话管理

会话管理功能可以从会话顶部的工具栏中访问，或者在会话列表的右键菜单中访问。

![喧喧会话工具栏](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-menu.png)
![喧喧会话右键菜单](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-contextmenu.png)

* 收藏：点击会话窗口顶部工具栏的星标按钮可以切换会话收藏和取消收藏状态，当会话被收藏后会在会话列表顶部单独显示，方便快捷访问此会话，在会话列表；
* 消息记录：点击会话窗口顶部工具栏的消息历史记录按钮，可以浏览当前会话的所有本地消息，你也可以通过同步从服务器上下载当前会话的所有历史消息；
* 白名单：讨论组和频道的管理员可以为会话设置白名单，在白名单之外的用户无法重命名会话及在会话中发布消息，但能接收会话中其他人发布的消息；
* 重命名：你可以为讨论组或频道重新命名，如果在一个会话中用户被设置为只读，则改用户无法重命名改会话；
* 退出会话：除系统会话，所有用户都可以自由退出一个讨论组或频道；
* 设置公共频道：讨论组的创建者可以将当前会话设置为公共频道。

#### 设置会话字体大小

通过会话窗口顶部工具栏菜单可以打开会话字体大小设置对话框。会话字体大小设置会影响所有会话窗口。

![喧喧会话右键菜单](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/chat-change-font-size.png)

## 通讯录

查看当前服务器上的所有用户信息及联系方式。

![喧喧通讯录](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/contacts.png)