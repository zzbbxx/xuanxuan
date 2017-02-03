import DefaultLang from './lang/zh-cn.json';

/**
 * The language object
 * @type {object}
 */
const lang = {
    get(path, defaultValue) {
        let langSetting = this;
        path.split('.').some(name => {
            let v = langSetting[name];
            if(v === undefined) {
                langSetting = defaultValue;
                return true;
            } else {
                langSetting = v;
                return false;
            }
        });
        return langSetting === this ? defaultValue : langSetting;
    }
};

// Assign the default lang
Object.assign(lang, DefaultLang, {$name: 'zh-cn'})

export default lang;
