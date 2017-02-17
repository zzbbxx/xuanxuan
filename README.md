# 喧喧

http://xuanxuan.chat

由[然之协同](http://ranzhico.com)提供的面向企业即时通信解决方案。

![喧喧](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/preview.png)

## 特色功能

* **开聊**：和服务器上的任何用户开聊，收发表情、图片、截屏、文件样样在行；
* **讨论组**：一个人讨论的不过瘾？随时邀请多人组建个性讨论组；
* **公开频道**：将讨论组公开，任何感兴趣的人都可以加入进来；
* **通知及提醒**：与系统桌面环境集成，即时收到新消息通知；
* **会话管理**：将任意会话（包括讨论组和频道）置顶，精彩内容不容错过，还可以重命名讨论组、为讨论组设置白名单及浏览会话的所有消息历史记录；
* **通讯录**：浏览企业成员信息；
* **轻量级服务器端**：轻松搭配[然之协同](http://ranzhico.com)使用。

## 使用

### 客户端

受益于 Electron 的跨平台特性，喧喧客户端提供了 Windows 和 MacOS 版本。理论上也支持 Linux，不过暂时没有测试及支持。

下载地址：

 * Windows 7+：[安装包（xuanxuan-setup-1.0.0.exe）](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-setup-1.0.0.exe.zip)、[zip 压缩包（xuanxuan-1.0.0.zip）](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-1.0.0.zip)
 * MacOS：[xuanxuan-1.0.0.dmg](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-1.0.0.dmg)

更多帮助参见 [使用手册](https://github.com/easysoft/xuanxuan/tree/master/doc/README.md)。

### 服务器端

当前已提供的服务器端（在 `/server` 目录下）是基于 [然之协同](https://github.com/easysoft/rangerteam) 使用 [php socket](http://php.net/manual/en/book.sockets.php) 方案实现。
                        
下载地址：

* 然之协同喧喧服务器端：[xuanxuan-server-rangerteam-1.0.0.zip](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-server-rangerteam-1.0.0.zip)

这里有一个公开的测试服务器供使用：

```
地址：http://demo.ranzhi.org
用户：demo
密码：demo
```
注意：测试服务器不能使用传送文件功能。

然之协同服务器端部署基本步骤：

1. 下载 [xuanxuan-server-rangerteam-1.0.0.zip](https://github.com/easysoft/xuanxuan/releases/download/v1.0.0/xuanxuan-server-rangerteam-1.0.0.zip) 并解压缩至 `server` 目录；
2. 合并 `server` 目录到然之协同服务目录；
3. 在然之服务目录执行 `sudo -u username ./app/xuanxuan/server.php`，其中 `username` 为然之协同 Apache 服务运行用户。

服务器端 API 同样是开放的，你可以使用自己熟悉的技术（例如 node.js）实现自己的服务器端。

服务器端 API 参见：[API 文档](https://github.com/easysoft/xuanxuan/tree/master/doc/server-api.md)。

## 开发

客户端主要使用的技术为 `Webpack + Electron + React`。使用下面的步骤快速进入开发状态：

1. 下载源码：`git clone https://github.com/easysoft/xuanxuan.git`；
2. 在源码目录执行：`npm install`；
3. 启动 react hot server，执行：`npm run hot-server`；
4. 启动客户端，执行：`npm run start-hot`。

执行 `npm run package` 进行客户端打包。

如果你在使用 [Visual Studio Code](https://code.visualstudio.com/) 作为编辑器，则可以直接使用 Visual Studio Code 的调试任务（默认任务名称为 `Run`）进行调试。

## 许可证

喧喧使用 [ZPL](https://github.com/easysoft/xuanxuan/blob/master/LICENSE) 开源许可证，另外还使用了如下开源项目：

* [Electron](http://electron.atom.io/)、[React](https://facebook.github.io/react/)、[Webpack](https://webpack.github.io)：跨平台客户端开发支持；
* [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)：提供项目模板；
* [EmojiOne](http://emojione.com/)：提供 Emoji 表情及图片资源支持；
* [Material UI](http://www.material-ui.com/)：提供部分界面控件框架；
* 其他重要开源项目包括：[draft.js](https://facebook.github.io/draft-js/)、[Babel](https://babeljs.io/)、[Moment](https://momentjs.com/)、[marked](https://github.com/chjj/marked)、[ion.sound](https://github.com/IonDen/ion.sound) 等。


