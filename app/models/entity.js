import UUID     from 'uuid';
import SafeData from './safe-data';
import Helper   from '../utils/helper';

/**
 * Default entity values converters
 * @type {Object}
 */
const defaultValuesConveter = {
    int: function(val) {
        if(typeof(val) !== 'number') {
            val = Number.parseInt(val);
        }
        return val;
    },
    timestamp: function(val) {
        if(typeof(val) === 'string') {
            val = new Date(val).getTime();
        }
        if(val < 10000000000) {
            val *= 1000;
        }
        return val;
    },
    bool: function(val) {
        if(typeof(val) === 'string') {
            return val === '1' || val === 'true';
        }
        return !!val;
    },
    intSet: val => {
        if(val instanceof Set) {
            return val;
        }
        if(Array.isArray(val)) {
            return new Set(val);
        }
        let valType = typeof val;
        if(valType === 'string') {
            let set = new Set();
            let arr = val.split(',').forEach(x => {
                x = Number.parseInt(x);
                if(x !== NaN) {
                    set.add(x);
                }
            });
            return set;
        } else if(valType === 'number') {
            return new Set([Math.floor(val)]);
        } else {
            if(DEBUG) console.warn('Value can not conver to a set.', val);
        }
        return null;
    },
    'set': val => {
        if(val instanceof Set) {
            return val;
        }
        if(Array.isArray(val)) {
            return new Set(val);
        }
        let valType = typeof val;
        if(valType === 'string') {
            let set = new Set();
            let arr = val.split(',').forEach(x => {
                if(x !== '') set.add(x);
            });
            return set;
        } else {
            return new Set(val);
        }
    }
};

/**
 * Entity
 */
class Entity extends SafeData {
    constructor(data, valuesConverter) {
        super();
        this.entityType = this.constructor.name;

        if(this._initValuesConverter) {
            this.setValuesConverter(this._initValuesConverter());
        }

        this.assign(data);

        this.gid = this.gid || UUID.v4();
        this._generateId();
    }

    /**
     * Plain a object
     */
    plain() {
        return Helper.plain(this);
    }

    /**
     * Get storage id
     * @return {Number}
     */
    get id() {
        return this.remoteId;
    }

    /**
     * Set storage id
     * @param  {Number} id
     * @return {Void}
     */
    set id(id) {
        this.remoteId = defaultValuesConveter.int(id);
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _generateId() {
        this._id = this.typeName + '/' + this.remoteId;
    }

    /**
     * Assign data to entity and convert values if necessary
     * @param  {Object} data
     * @return {Void}
     */
    assign(data) {
        if(!data) return;
        if(this.$.valuesConverter) {
            Object.keys(data).forEach(key => {
                if(key === 'id') return;
                let val = data[key]
                let converter = this.$.valuesConverter[key];
                if(converter !== undefined) {
                    if(typeof(converter) === 'string') {
                        converter = Entity.defaultValuesConveter[converter];
                    }
                    if(typeof(converter) === 'function') {
                        val = converter(val);
                    } else if(Array.isArray(converter)) {
                        if(val === undefined || converter.indexOf(val) === -1) {
                            val = converter[0];
                        }
                    }
                }

                this[key] = val;
            });
            if(this.$.valuesConverter.$global) {
                this.$.valuesConverter.$global(this);
            }
        } else {
            Object.assign(this, data);
        }

        if(data.id !== undefined) this.id = data.id;
    }

    /**
     * Get entity type name
     * @return {String}
     */
    get typeName() {
        return this.entityType;
    }

    /**
     * Check the object is entity
     * @return {Boolean}
     */
    get isEntity() {
        return true;
    }

    /**
     * Set values converter
     * @param {object} converter
     */
    setValuesConverter(converter) {
        if(!this.$.valuesConverter) this.$.valuesConverter = {};
        Object.assign(this.$.valuesConverter, converter);
    }

    /**
     * Get default values converters
     * @return {[type]} [description]
     */
    static get defaultValuesConveter() {
        return defaultValuesConveter;
    }

    /**
     * Get the factory creator
     * @return {[type]} [description]
     */
    static get as() {
        return this.creator;
    }

    /**
     * Create entity with the factory addCreator
     * @param  {string} entityType
     * @param  {object}
     * @return {Entity}
     */
    static create(entityType, data) {
        return new this.creator[entityType](data);
    }

    /**
     * Add factor creator to Entity class
     * @param {object} creator
     */
    static addCreator(creator) {
        if(!this.creator) this.creator = {};
        Object.assign(this.creator, creator);
    }
}

export default Entity;
