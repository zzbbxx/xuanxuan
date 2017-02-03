/**
 * The base application handler
 */
class AppCore {

    constructor(app) {
        this.$app = app;
        this.dao = this.initDao();
    }

    initDao() {
        return {}
    }

    get socket() {
        return this.$app.socket;
    }

    get user() {
        return this.$app.user;
    }

    get config() {
        return this.$app.user;
    }

    get lang() {
        return this.$app.lang;
    }

    get $dao() {
        return this.$app.dao;
    }

    get members() {
        return this.$app.members;
    }
}

export default AppCore;
