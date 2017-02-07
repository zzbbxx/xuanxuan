const event = {
    user_change: "user.change",
    user_swap: "user.swap",
    user_status_change: "user.status.change",
    user_config_change: "user.config.change",

    user_login_begin: 'user.login.begin',
    user_login_finish: 'user.login.finish',
    user_login_message: 'user.login.message',
    user_kickoff: 'user.kickoff',

    data_change: 'data.change',
    data_delete: 'data.delete',
    data_get_public_list: 'data.getPublicList',
    chats_notice: 'chats.notice',
    chats_history: 'chats.history',
    database_rebuild: 'database.rebuild',

    socket_timeout: 'SOCKET.TIMEOUT',
    socket_error: 'SOCKET.ERROR',
    socket_close: 'SOCKET.CLOSE',
    socket_connected: 'SOCKET.CONNECTED',
    socket_data: 'SOCKET.DATA',

    net_online: 'net.online',
    net_offline: 'net.offline',

    file_upload: 'file.upload',
    capture_screen: 'capture.screen',
    capture_screen_global: 'capture.screen.global',

    ui_change: 'ui.change',
    ui_navbar_expand: 'ui.navbar.expand',
    ui_link: 'ui.link',
    ui_messager: 'ui.messager',
    ui_show_main_window: 'ui.show.main.window',
    ui_focus_main_window: 'ui.focus.main.window',
    ui_hotkey: 'ui.hotkey',

    app_init: 'app.init',
    app_quit: 'app.quit',
    app_user: 'app.user',
    app_ready: 'app.ready',
    app_get_user: 'app.get.user',
    app_set_user: 'app.set.user',
    app_check_ready: 'app.check.ready',
    app_remote: 'app.remote',
    app_socket_change: 'app.socket.change',
    app_remote_send: 'app.remote.send'
};

const ui = {
    navbar_chat: 'chat',
    navbar_contacts: 'contacts',
    navbar_note: 'note',
    navbar_apps: 'apps'
};

const Resource = {event, ui};

export {event as EVENT, ui as UI};
export default Resource;
