# 服务器端及 API

## 然之协同服务器端下载及使用

当前已提供的服务器端（在 `/server` 目录下）是基于 [然之协同](https://github.com/easysoft/rangerteam) 使用 [php socket](http://php.net/manual/en/book.sockets.php) 方案实现。

下载地址：

* 然之协同喧喧服务器端：[xuanxuan-server-rangerteam-1.0.0.zip](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-server-rangerteam-1.0.0.zip)

这里有一个公开的测试服务器供使用：

```
地址：http://demo.ranzhi.org
用户：demo
密码：123456
```

然之协同服务器端部署基本步骤：

1. 下载 [xuanxuan-server-rangerteam-1.0.0.zip](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-server-rangerteam-1.0.0.zip) 并解压缩至 `server` 目录；
2. 合并 `server` 目录到然之协同服务目录；
3. 在然之服务目录执行 `sudo -u username ./app/xuanxuan/server.php`，其中 `username` 为然之协同 Apache 服务运行用户。

你可以参考以下 API 设计来开发自己的服务器端。

## 数据库设计参考

MySql 数据库参见 https://github.com/easysoft/xuanxuan/blob/master/server/db/xuanxuan.sql

### Chat 表

存储会话数据。

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必须</th>
      <th>说明</th>
    </tr>
  </thead>
  <tr>
    <td><code>id</code></td>
    <td>number</td>
    <td>必须</td>
    <td>存储在远程数据库的id,客户端根据此id值是否设置来判定是否为远程保存的对象</td>
  </tr>
  <tr>
    <td><code>gid</code></td>
    <td>string</td>
    <td>必须</td>
    <td>当客户端向系统提交新的会话时,会创建全局唯一的id</td> 
  </tr>
  <tr>
    <td><code>name</code></td>
    <td>string</td>
    <td>可选</td>
    <td>会话名称,当为空时,客户端会自动生成会话名称</td>
  </tr>
  <tr>
    <td><code>type</code></td>
    <td>string</td>
    <td>可选</td>
    <td>表明会话类型：system(系统), one2one(一对一), gourp（多人讨论组）, project, product等</td>
  </tr>
  <tr>
    <td><code>admins</code></td>
    <td>string</td>
    <td>可选</td>
    <td>会话管理员用户列表</td>
  </tr>
  <tr>
    <td><code>committers</code></td>
    <td>string</td>
    <td>可选</td>
    <td>会话允许发言用户清单</td>
  </tr>
  <tr>
    <td><code>subject</code></td>
    <td>int</td>
    <td>可选</td>
    <td>主题会话关联的主题(product, project等)ID</td>
  </tr>
  <tr>
    <td><code>public</code></td>
    <td>bool</td>
    <td>可选</td>
    <td>是否公共会话</td>
  </tr>
  <tr>
    <td><code>createdBy</code></td>
    <td>string</td>
    <td>必须</td>
    <td>创建者的账号</td>
  </tr>
  <tr>
    <td><code>createdDate</code></td>
    <td>datetime</td>
    <td>必须</td>
    <td>创建会话时服务器的时间戳</td>
  </tr>
  <tr>
    <td><code>editedBy</code></td>
    <td>string</td>
    <td>可选</td>
    <td>编辑者的账号</td>
  </tr>
  <tr>
    <td><code>editedDate</code></td>
    <td>datetime</td>
    <td>可选</td>
    <td>编辑会话时服务器的时间戳</td>
  </tr>
  <tr>
    <td><code>lastActiveTime</code></td>
    <td>datetime</td>
    <td>可选</td>
    <td>会话最后一次发送消息时服务器的时间戳</td>
  </tr>
  <tr>
    <td><code>[users]</code></td>
    <td>关联数据集</td>
    <td>必须</td>
    <td>包含此会话的所有成员,和每个成员加入此会话的时间</td>
  </tr>
  <tr>
    <td><code>[messages]</code></td>
    <td>关联数据集</td>
    <td>必须</td>
    <td>包含此会话的所有消息</td>
  </tr>
</table>

### Message 表

存储会话消息数据。

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必须</th>
      <th>说明</th>
    </tr>
  </thead>
  <tr>
    <td><code>id</code></td>
    <td>number</td>
    <td>必须</td>
    <td>存储在远程数据库的id,客户端根据此id值是否设置来判定是否为远程保存的对象</td>
  </tr>
  <tr>
    <td><code>gid</code></td>
    <td>string</td>
    <td>必须</td>
    <td>当客户端向系统提交新的消息时,会创建全局唯一的id</td> 
  </tr>
  <tr>
    <td><code>cgid</code></td>
    <td>string</td>
    <td>必须</td>
    <td>此消息所属于的会话的gid属性,会话根据此值来查询包含的消息</td>
  </tr>
  <tr>
    <td><code>user</code></td>
    <td>string</td>
    <td>可选</td>
    <td>此消息发送者的用户名,广播类的消息没有此值</td>
  </tr>
  <tr>
    <td><code>date</code></td>
    <td>number</td>
    <td>必须</td>
    <td>消息发送的时间戳</td>
  </tr>
  <tr>
    <td><code>type</code></td>
    <td>string</td>
    <td>可选</td>
    <td>消息的类型,为'normal'（默认）, 'broadcast'</td>
  </tr>
  <tr>
    <td><code>content</code></td>
    <td>string</td>
    <td>必须</td>
    <td>消息的内容,如果消息内容类型不是文本,则已此值为json格式的对象</td>
  </tr>
  <tr>
    <td><code>contentType</code></td>
    <td>string</td>
    <td>必须</td>
    <td>消息内容的类型,为'text'(默认), 'emoticon', 'image', 'file'</td>
  </tr>
</table>

### ChatsOfUser 表

存储参与会话的成员数据。

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必须</th>
      <th>说明</th>
    </tr>
  </thead>
  <tr>
    <td><code>id</code></td>
    <td>number</td>
    <td>必须</td>
    <td>存储在远程数据库的id</td>
  </tr>
  <tr>
    <td><code>cgid</code></td>
    <td>string</td>
    <td>必须</td>
    <td>会话的gid属性</td>
  </tr>
  <tr>
    <td><code>user</code></td>
    <td>number</td>
    <td>必须</td>
    <td>用户id,对应用户表的id</td>
  </tr>
  <tr>
    <td><code>order</code></td>
    <td>number</td>
    <td>可选</td>
    <td>会话显示顺序</td>
  </tr>
  <tr>
    <td><code>star</code></td>
    <td>bool</td>
    <td>可选</td>
    <td>用户是否收藏会话</td>
  </tr>
  <tr>
    <td><code>hide</code></td>
    <td>bool</td>
    <td>可选</td>
    <td>用户是否隐藏会话</td>
  </tr>
  <tr>
    <td><code>mute</code></td>
    <td>bool</td>
    <td>可选</td>
    <td>用户是否开启免打扰</td>
  </tr>
  <tr>
    <td><code>quit</code></td>
    <td>datetime</td>
    <td>可选</td>
    <td>用户退出会话时服务器的时间戳</td>
  </tr>
  <tr>
    <td><code>join</code></td>
    <td>datetime</td>
    <td>必须</td>
    <td>用户加入会话时服务器的时间戳</td>
  </tr>
</table>

### UserMessage

存储用户离线时收到的消息。

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必须</th>
      <th>说明</th>
    </tr>
  </thead>
  <tr>
    <td><code>id</code></td>
    <td>number</td>
    <td>必须</td>
    <td>存储在远程数据库的id,离线消息的标识符,服务器根据客户端返回的此id删除已发送过的离线消息。</td>
  </tr>
  <tr>
    <td><code>level</code></td>
    <td>number</td>
    <td>必须</td>
    <td>离线消息级别,默认为3。数字越低级别越高,优先发送级别高的离线消息,用户登录时会生成级别为0和1的消息各一条。</td>
  </tr>
  <tr>
    <td><code>user</code></td>
    <td>number</td>
    <td>必须</td>
    <td>离线消息的目标用户id,对应用户表的id</td>
  </tr>
  <tr>
    <td><code>module</code></td>
    <td>string</td>
    <td>必须</td>
    <td>产生离线消息的模块名称</td>
  </tr>
  <tr>
    <td><code>method</code></td>
    <td>string</td>
    <td>必须</td>
    <td>产生离线消息的方法名称</td>
  </tr>
  <tr>
    <td><code>data</code></td>
    <td>string</td>
    <td>必须</td>
    <td>离线消息的内容,经过json编码的数据</td>
  </tr>
</table>

### ChatFile

存储会话中的文件

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必须</th>
      <th>说明</th>
    </tr>
  </thead>
  <tr>
    <td><code>id</code></td>
    <td>number</td>
    <td>必须</td>
    <td>文件在服务器上的 ID</td>
  </tr>
  <tr>
    <td><code>gid</code></td>
    <td>string</td>
    <td>必须</td>
    <td>会话的 GID</td>
  </tr>
  <tr>
    <td><code>file</code></td>
    <td>number</td>
    <td>必须</td>
    <td>文件ID</td>
  </tr>
  <tr>
    <td><code>title</code></td>
    <td>string</td>
    <td>可选</td>
    <td>文件名</td>
  </tr>
</table>

## API

### 数据格式和约定

Socket API 执行的模式有两种：

* 客户端请求 -> 服务器响应：客户端发起请求，服务器处理请求并返回结果；
* 服务器主动推送：服务器主动向客户端推送数据。

请求、响应及推送所传输的数据为 JSON 文本格式。

常见的请求对象格式：

```js
{
    module, // 模块名称,必须
    method, // 方法名称,必须
    params, // 参数对象,可选
    sid,    // session id,当非登录请求时必须,
    data    // 请求数据,可选,与params配合使用,通常data传输是对象
}
```

常见的响应数据格式:

```js
{
    module,            // 模块名称,必须
    method,            // 方法名称,必须
    params,            // 参数对象,可选
    result: 'success', // 响应状态,可为'success'（成功）, 'fail'(失败), 'denied'(拒绝,需要登录),
    message: ''        // 消息,可选,当result不为success时,使用此字段来解释原因
    data               // 数据 
}
```

常见的推送的数据格式:

```js
[               // 一个数据包数组
    {           // 其中一个数据包
        id,     // 推送数据的id
        module, // 数据产生的模块名称
        method, // 数据产生的方法名称
        data:   // 数据内容。根据产生的模块方法推送不同的内容,可能是一条消息或者一组成员列表
        {
            id, gid, cgid // ...
        }
    },
    // 更多数据包
]
```

为方便数据在多平台使用,并节省传输数据大小,对API中的数据格式做出约定：

1. 所有id属性值使用整型数据，而不是字符串，例如 `{id: 23}`，而不是 `{id: "23"}`；
2. 所有日期数据类型使用时间戳(参考 `php` 的 `time()` 函数),而不是字符串，例如 `{createdDate: 1446773418}`,  而不是 `{createdDate: "2015-11-06 09:32:32"}`；
3. 当引用用户数据时,使用 ID 代替用户名，例如 `Message` 表中的 `user` 字段存储用户名更改为存储用户 ID；
4. 当表示一组数据时，使用数组代替对象，例如会话成员属性 `{members: [23, 43]}`，而不是 `{members: {"23": {id: 23}, "43": {id: 43}}}`。

### 登录

**请求**

```js
{
    module: 'chat',
    method: 'login',
    params: {
        account,
        password, // 已加密
        status    // 登录后设置的状态,包括online,away,busy
    }
}
```

**响应**

```js
{
    module: 'chat',
    method: 'login',
    result,
    sid,          // 登录成功之后返回sid
    data: 
    {             // 当前登录的用户数据
        id,
        account,  // 用户名
        realname, // 真实姓名
        avatar,   // 头像URL
        role,     // 角色
        dept,     // 部门ID
        status    // 当前状态
    }
}
```

**推送所有用户列表给当前登录用户**

```js
{
    id,
    module: 'chat',
    method: 'userGetList',
    data: 
    [         // 所有用户状态数组
        {     // 其中一个用户数据
            id,
            account,
            realname,
            avatar,
            role,
            dept
            status
        },
        // 更多用户数据...
    ]
}
```

**推送当前用户参与的所有会话信息**

```js
{
    id,
    module: 'chat',
    method: 'getlist',
    data: 
    [                       // 所有会话信息数组
        {                   // 其中一个会话信息
            id,             // 会话在服务器数据保存的id
            gid,            // 会话的全局id,
            name,           // 会话的名称
            type,           // 会话的类型
            admins,         // 会话允许发言的用户列表
            subject,        // 主题会话的关联主题ID
            public,         // 是否公共会话
            createdBy,      // 创建者用户名
            createdDate,    // 创建时间
            editedBy,       // 编辑者用户名
            editedDate,     // 编辑时间
            lastActiveTime, // 会话最后一次发送消息的时间
            star,           // 当前登录用户是否收藏此会话
            hide,           // 当前登录用户是否隐藏此会话
            members: 
            [               // 当前会话中包含的所有用户信息,只需要包含id即可
                {
                    id,     //用户id
                },
                // 更多用户...
            ],
        },
        // 更多会话数据...
    ]
}
```

**推送当前登录用户信息给其他在线用户**

```js
{
    id,
    module: 'chat',
    method: 'login',
    data: 
    {   //当前登录用户数据
        id,
        account,
        realname,
        avatar,
        role,
        dept,
        status
    }
}
```

### 登出

客户端直接断开连接也会将用户状态更新为 `offline`，但不会推送给其他在线用户。

**请求**

```js
{
    module: 'chat',
    method: 'logout',
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'logout',
    result,
    sid,
    data:
    {
        id,
        account,
        realname,
        avatar,
        role,
        dept,
        status,
    }
}
```

**推送当前登出用户信息给其他在线用户**

```js
{
    id,
    module: 'chat',
    method: 'logout',
    data: 
    {   //当前登出用户数据
        id,
        account,
        realname,
        avatar,
        role,
        dept,
        status
    }
}
```

### 获取所有用户列表

**请求**

```js
{
    module: 'chat',
    method: 'userGetlist',
    sid
}
```

**响应**

此响应数据在用户登录之后由服务器主动推送一次，
当有一个或多个用户登录，状态变化或名称发生变更时，服务器也会主动推送相关的用户信息。

```js
{
    module: 'chat',
    method: 'userGetlist',
    result,
    sid,
    data:
    [           // 所有用户状态数组
        {       // 其中一个用户数据
            id,
            account,
            realname,
            avatar,
            role,
            dept
            status
        },
        // 更多用户数据...
    ]
}
```

### 获取当前登录用户所有会话数据

**请求**

```js
{
    module: 'chat',
    method: 'getList',
    sid
}
```

**响应**

此响应数据在用户登录之后由服务器主动推送一次

```js
{
    module: 'chat',
    method: 'getList',
    result,
    sid,
    data:
    [                       // 所有会话信息数组
        {                   // 其中一个会话信息
            id,             // 会话在服务器数据保存的id
            gid,            // 会话的全局id,
            name,           // 会话的名称
            type,           // 会话的类型
            admins,         // 会话允许发言的用户列表
            subject,        // 主题会话的关联主题ID
            public,         // 是否公共会话
            createdBy,      // 创建者用户名
            createdDate,    // 创建时间
            editedBy,       // 编辑者用户名
            editedDate,     // 编辑时间
            lastActiveTime, // 会话最后一次发送消息的时间
            star,           // 当前登录用户是否收藏此会话
            hide,           // 当前登录用户是否隐藏此会话
            members: 
            [               // 当前会话中包含的所有用户信息,只需要包含id即可
                {
                    id,     //用户id
                },
                // 更多用户...
            ],
        },
        // 更多会话数据...
    ]
}
```

### 更改当前登录用户真实姓名

**请求**

```js
{
    module: 'chat',
    method: 'userChangeName',
    params:
    {
        name
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'userChangeName',
    result,
    sid,
    data: 
    {
        id,
        name // 更改后的姓名
    }
}
```

**推送当前登录用户信息给其他在线用户**

```js
{
    id, 
    module: 'chat',
    method: 'userChangeName',
    data:
    {       //当前登录用户数据
        id,
        account,
        realname,
        avatar,
        role,
        dept,
        status
    }
}
```

### 设置当前登录用户状态

**请求**

```js
{
    module: 'chat',
    method: 'userChangeStatus',
    params:
    {
        status //要设置的新状态,包括online, away, busy
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'userChangeStatus',
    result,
    sid,
    data: 
    {
        id,
        status // 当前状态
    }
}
```

**推送当前登录用户信息给其他在线用户**

```js
{
    id, 
    module: 'chat',
    method: 'userChangeStatus',
    data: 
    { //当前登录用户数据
        id,
        account,
        realname,
        avatar,
        role,
        dept,
        status
    }
}
```

### 创建聊天会话

**请求**

```js
{
    module: 'chat',
    method: 'create',
    params:
    {
        gid,     // 会话的全局id,
        name,    // 会话的名称
        type,    // 会话的类型
        members: [{id}, {id}...] // 会话的成员列表 
        subject, //可选,主题会话的关联主题ID,默认为0
        pulic    //可选,是否公共会话,默认为false
    }
    sid
}
```

**响应**

用户创建会话成功后，服务器主动推送响应给此会话包含的所有在线用户
服务器在创建会话时应该先检查gid是否已经存在，如果存在则直接为当前登录用户返回已存在的会话信息。

```js
{
    module: 'chat',
    method: 'create',
    result,
    sid,
    data: // 新创建的会话完整信息
    {
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

**如果是新建会话则推送会话信息给该会话所有在线用户**

```js
{
    id,
    module: 'chat',
    method: 'create',
    data: 
    {           // 新创建的会话完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

### 加入或退出聊天会话

用户可以加入类型为 `group` 并且公共的会话；用户可以退出类型为 `group` 的会话。

**请求**

```js
{
    module: 'chat',
    method: 'joinchat',
    params: 
    {
        gid, // 要加入或退出的会话id
        join // 可选, true加入会话, false退出会话, 默认为true
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'joinchat',
    result,
    sid,
    data:
    {
        gid // 已加入或退出的会话id
    }
}
```

**推送会话信息给该会话所有在线用户**

```js
{
    id,
    module: 'chat',
    method: 'joinChat',
    data: 
    {                   // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

### 更改会话名称

用户可以更改类型为 `group` 的会话的名称。

**请求**

```js
{
    module: 'chat',
    method: 'changename',
    params:
    {
        id,  // 要更改的会话id
        name // 新的名称
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'changename',
    result,
    sid,
    data:
    {
        gid, // 要更改的会话id
        name // 新的名称
    }
}
```

**推送会话信息给该会话所有在线用户**

```js
{
    id,
    module: 'chat',
    method: 'changeName',
    data: 
    {                   // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

### 收藏或取消收藏会话

每个用户都可以单独决定收藏或取消收藏会话（加星标记）。

**请求**

```js
{
    module: 'chat',
    method: 'star',
    params: 
    {
        gid, // 要收藏会话id
        star // 可选, true收藏会话, false取消收藏会话, 默认为true
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'star',
    result,
    sid,
    data:
    {
        gid // 要收藏或取消收藏的会话id
    }
}
```

### 邀请新的用户到会话或者将用户踢出会话

用户可以邀请一个或多个用户到类型为 `group` 的已有会话中；会话管理员可以将一个或多个用户踢出类型为group的会话。

**请求**

```js
{
    module: 'chat',
    method: 'addmember',
    params: 
    {
        gid,     // 要操作的会话id
        members, // 用户id数组
        join     // 可选, true邀请用户加入会话, false将用户踢出会话, 默认为true
    }
    sid
}
```

**响应**

当新用户被添加到会话之后或者用户被踢出会话后,服务器应该主动推送此会话的信息给此会话的所有在线成员；此响应与chat/create/响应的结果一致。

```js
{
    module: 'chat',
    method: 'addmember',
    result,
    sid,
    data: // 会话的完整信息
    {
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

**推送会话信息给该会话所有在线用户**

```js
{
    id,
    module: 'chat',
    method: 'addMember',
    data: // 会话的完整信息
    {
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

### 向会话发送消息

用户向一个或多个会话中发送一条或多条消息,服务器推送此消息给此会话中的所有在线成员；当前不在线的成员会在下次上线时通过离线消息送达。

**请求**

```js
{
    module: 'chat',
    method: 'message',
    params: 
    [        // 一个包含一条或多条新消息的数组
        {
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 如果为空,则为发送此请求的用户
            date,        // 如果为空,则已服务器处理时间为准
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content      // 消息内容
        },
        // 可以在一个请求中发送多个消息
    ]
    sid,
}
```

**响应**

当有新的消息收到时,服务器会所有消息,并发送给对应会话的所有在线成员

```js
{
    module: 'chat',
    method: 'message',
    result,
    sid,
    data:  // 一个包含一条或多条新消息的数组
    [
        {
            id,          // 消息在服务器保存的id
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 消息发送的用户名
            date,        // 消息发送的时间
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content,     // 消息内容
        },
        // 可以有更多的消息
    ]
}
```

**推送消息内容给该会话所有在线成员**

```js
{
    id,
    module: 'chat',
    method: 'message',
    data: 
    [          //一个包含一条或多条消息的数组
        {
            id,          // 消息在服务器保存的id
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 消息发送的用户名
            date,        // 消息发送的时间
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content,     // 消息内容
        },
        // 更多消息
    ]
}
```

### 获取会话的所有消息记录

**请求**

```js
{
    module: 'chat',
    method: 'history',
    params: 
    {
        gid // 要获取消息记录的会话gid
    }
    sid,
}
```

**响应**

```js
{
    module: 'chat',
    method: 'history',
    result,
    sid,
    data: 
    [
        {
        // 一条历史消息...
        },
        // 更多历史消息
    ]
}
```

### 获取会话的所有成员信息

**请求**

```js
{
    module: 'chat',
    method: 'members',
    params:
    {
        gid // 要获取成员列表的会话gid
    }
    sid,
}
```

**响应**

```js
{
    module: 'chat',
    method: 'members',
    result,
    sid,
    data: 
    [
        {
            gid, // 此消息的gid
            members: 
            [
                {
                    id,
                    // ...
                } 
            ]
        },
    ]
}
```

### 隐藏或显示会话

每个用户都可以单独决定隐藏或显示已参与的会话。

**请求**

```js
{
    module: 'chat',
    method: 'hide',
    params: 
    {
        gid, // 要收藏会话id
        hide // 可选, true隐藏会话, false显示会话, 默认为true
    }
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'hide',
    result,
    sid,
    data:
    {
        gid // 要隐藏或显示的会话id
    }
}
```

### 重复登录

当同一用户重复登录时,系统会向前一个登录的用户推送一条特殊的消息,客户端接收到该消息后应该将用户登出。该消息不需要响应或返回结果。

**推送**

```js
{
    module:  'null',
    method:  'null',
    message: 'This account logined in another place.',
}
```

### 将会话设置为公共会话或者取消设置公共会话

用户可以将一个非主题会话设置为公共会话或者取消设置公共会话。

**请求**

```js
{
    module: 'chat',
    method: 'changepublic',
    params: 
    {
        gid,
        public, // 可选,true设置公共会话,false取消设置公共会话,默认为true
    },
    sid,
}
```

**响应**

```js
{
    module: ' chat';
    method: 'changepublic',
    result,
    sid,
    data: 
    {
        gid,    // 要设置的会话id
        public, // 
    }
}
```

**推送会话信息给该会话所有在线用户**

```js
{
    id,
    module: 'chat',
    method: 'changePublic',
    data: 
    {           // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```

### 获取所有公共会话列表

**请求**

```js
{
    module: 'chat',
    method: 'getPublicList',
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'getPublicList',
    result,
    sid,
    data: 
    [         // 所有公共会话信息数组
        {     // 其中一个会话信息
            id,
            gid,
            name,
            type,
            admins, 
            subject,
            public,
            createdBy,
            createdDate,
            editedBy,
            editedDate,
            lastActiveTime
        },
        // 更多会话数据...
    ]
}
```

### 获取指定会话的所有文件列表

**请求**

```js
{
    module: 'attach',
    method: 'getList',
    params: 
    {
        gid // 要获取文件列表的会话的全局id
    }
    sid,
}
```

**响应**

```js
{
    module: 'attach',
    method: 'getList',
    result,
    sid,
    data: 
    [      // 所有文件列表
        {
            id,      // 文件id, 下载文件需要此id值
            title,   // 文件标题
            size,    // 文件大小
            addedBy, // 上传人
        },
        /// 更多文件
    ]
}
```

### 上传文件

文件上传使用 http 方式进行。

**HTTP 请求**

```js
{
    module: 'attach',
    method: 'upload',
    params: 
    {
        gid // 上传文件的会话全局id
    }
}
```

**HTTP 请求 POST 的数据**

```js
{
    files: 
    [
        // 文件信息
    ]
}
```

**HTTP 响应**

```js
{
    module: 'attach',
    method: 'upload',
    result,
    data: 
    [    // 所有上传的文件数组
        {
            id,    // 文件id
            title, // 文件标题
        },
        /// 更多文件信息
    ]
}
```

### 下载文件

文件下载使用 http 方式进行。

**HTTP 请求**

```js
{
    module: 'attach',
    method: 'download',
    params: 
    {
        id // 文件id
    }
}
```

### 设置会话管理员

系统管理员可以设置系统会话仅指定用户作为管理员。

**请求**

```js
{
    module: 'chat',
    method: 'setAdmin',
    params: 
    {
        gid,  
        admins: [{id},{id}...], // 指定的用户列表
        isAdmin, //可选, true允许指定用户发言, false禁止指定用户发言, 默认为true 
    },
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'setAdmin',
    result,
    sid,
    data: 
    {
        id,
        gid,
        name,
        type,
        admins,
        subject,
        public,
        createdBy,
        createdDate,
        editedBy,
        editedDate
        lastActiveTime
    },
}
```

## 设置会话允许发言的人

通过此功能可以设置会话白名单。

**请求**

```js
{
    module: 'chat',
    method: 'setCommitters',
    params: 
    {
        gid,  
        committers: [{id},{id}...] // 指定的用户列表
    },
    sid
}
```

**响应**

```js
{
    module: 'chat',
    method: 'setCommitters',
    result,
    sid,
    data: 
    {
        id,
        gid,
        name,
        type,
        admins,
        subject,
        public,
        createdBy,
        createdDate,
        editedBy,
        editedDate
        lastActiveTime
    },
}
```

### 上传下载用户在客户端的配置信息 

**请求**

```js
{
    module: 'chat',
    method: 'settings',
    params: 
    {
        account, //用户名
        settings //用户配置信息, 可选, 为空表示下载用户配置信息, 不为空表示上传用户配置信息, 默认为空 
    }
}
```

**响应**

```js
{
    module: 'chat',
    method: 'settings',
    sid,
    result, 
    data // 用户配置信息 
}
```
