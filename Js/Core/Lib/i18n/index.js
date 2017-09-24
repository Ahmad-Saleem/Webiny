import _ from 'lodash';
import md5 from 'blueimp-md5';
import Webiny from 'webiny';
import React from 'react';
import I18nComponent from './I18N';

import modifiers from './Modifiers';

/**
 * Main class used for all I18n needs.
 */
class I18n {
    constructor() {
        this.locales = {current: null, list: []};

        this.modifiers = {};
        this.registerModifiers(modifiers);

        this.groups = {list: []};
        this.cacheKey = null;
        this.translations = {};
        this.component = I18nComponent;


        const translate = (base, variables = {}, options = {}) => {
            if (_.isString(base) && _.isString(variables)) {
                const key = this.getTextKey(base, variables);
                return translate(variables, options, key);
            }

            const key = this.getTextKey(options.namespace, base);
            return this.translate(base, variables, key);
        };

        Object.getOwnPropertyNames(I18n.prototype).map(method => {
            if (method !== 'constructor') {
                translate[method] = this[method].bind(this);
            }
        });

        return translate;
    }

    /**
     * Initializes i18n with given locale and current locale cache key.
     * @returns {*}
     */
    async init() {
        if (!this.getLocale() || !this.getCacheKey()) {
            throw Error('Cannot initialize I18n without locale or cache key.');
        }

        const i18nCache = await Webiny.IndexedDB.get('Webiny.I18n');

        let translations;
        // If we have the same cache key, that means we have latest translations - we can safely read from local storage.
        if (i18nCache && i18nCache.cacheKey === this.getCacheKey() && i18nCache.locale === this.getLocale()) {
            this.setTranslations(i18nCache.translations);
        } else {
            // If we have a different cache key (or no cache key at all), we must fetch latest translations from server.
            const api = new Webiny.Api.Endpoint('/entities/webiny/i18n-texts');
            const response = await api.get('translations/locales/' + this.getLocale());
            await Webiny.IndexedDB.set('Webiny.I18n', response.getData());
            this.setTranslations(response.getData('translations'));
        }

        // Finally, let's set i18n cookie
        Webiny.Cookies.set('webiny-i18n', this.getLocale());
        Webiny.Http.addRequestInterceptor(http => {
            http.addHeader('X-Webiny-I18n', this.getLocale());
        });

        return this;
    }

    /**
     * Changes current locale and refreshes the page so that new translations can be immediately loaded.
     * @param locale
     */
    setLocaleAndRefresh(locale) {
        Webiny.Cookies.set('webiny-i18n', locale);
        location.reload();
    }

    /**
     * Returns full translation for given base text and optionally variables. If text key is not found, base text will be returned.
     * @param base
     * @param variables
     * @param textKey
     * @returns {*}
     */
    translate(base, variables = {}, textKey) {
        let output = this.getTranslation(textKey) || base;
        return this.replaceVariables(output, variables);
    }

    /**
     * Sets I18N component which will be used for rendering texts.
     * @param component
     */
    setComponent(component) {
        this.component = component;
    }

    /**
     * Returns currently set I18N component.
     * @param component
     * @returns {component|*}
     */
    getComponent(component) {
        return this.component;
    }

    /**
     * Returns translation for given text key.
     * @param key
     * @returns {*|string}
     */
    getTranslation(key) {
        return this.translations[key] || '';
    }

    /**
     * Sets translation for given text key.
     * @param key
     * @param translation
     * @returns {I18n}
     */
    setTranslation(key, translation) {
        this.translations[key] = translation;
        return this;
    }

    /**
     * Returns all translations for current locale.
     * @returns {*|{}}
     */
    getTranslations() {
        return this.translations;
    }

    /**
     * Sets translations that will be used.
     * @returns {*|{}}
     */
    setTranslations(translations) {
        this.translations = translations;
        return this;
    }

    /**
     * Returns true if given key has a translation for currently set locale.
     * @param key
     */
    hasTranslation(key) {
        return !_.isEmpty(this.translations.key);
    }

    /**
     * Returns currently selected locale (locale's key).
     */
    getLocale() {
        return this.locales.current;
    }

    /**
     * Returns a list of all available locales.
     */
    async getLocales(query = {_fields: 'id,key,label,enabled'}) {
        const response = await new Webiny.Api.Endpoint('/entities/webiny/i18n-locales').get(null, query);
        this.locales.list = response.getData('list');
        return this.locales.list;
    }

    /**
     * Sets current locale.
     */
    setLocale(locale) {
        this.locales.current = locale;
        return this;
    }

    /**
     * Returns a list of all available text groups.
     */
    async getTextGroups(query = {_fields: 'id,app,name,description'}) {
        const response = await new Webiny.Api.Endpoint('/entities/webiny/i18n-text-groups').get(null, query);
        this.locales.list = response.getData('list');
        return this.locales.list;
    }

    /**
     * Sets current cache key (returned from server).
     * @param cacheKey
     * @returns {I18n}
     */
    setCacheKey(cacheKey) {
        this.cacheKey = cacheKey;
        return this;
    }

    /**
     * Returns current cache key (returned from server).
     * @returns {*|null}
     */
    getCacheKey() {
        return this.cacheKey;
    }

    /**
     * Registers single modifier.
     * @returns {I18n}
     */
    registerModifier(modifier) {
        this.modifiers[modifier.getName()] = modifier;
        return this;
    }

    /**
     * Registers all modifiers in given array.
     * @param modifiers
     * @returns {I18n}
     */
    registerModifiers(modifiers) {
        modifiers.forEach(modifier => this.registerModifier(modifier));
        return this;
    }

    /**
     * Unregisters given modifier.
     * @param name
     * @returns {I18n}
     */
    unregisterModifier(name) {
        delete this.modifiers[name];
        return this;
    }

    /**
     * Returns text key generated from given namespace and base text.
     * @param namespace
     * @param base
     * @returns {string}
     */
    getTextKey(namespace, base) {
        return namespace + '.' + md5(base);
    }

    /**
     * Processes text parts (used when translating texts).
     * @param part
     * @param values
     * @returns {*}
     */
    processTextPart(part, values) {
        // If not a variable, but an ordinary text, just return it, we don't need to do any extra processing with it.
        if (!_.startsWith(part, '{')) {
            return part;
        }

        part = _.trim(part, '{}');
        part = part.split('|');

        let [variable, modifier] = part;

        // Check if we have received {value: ..., format: ...} object.
        const output = {value: values[variable], format: null};

        // If variable value is an object, the it must have 'value' key set.
        // We must also be sure we are not dealing with React component.
        if (_.isPlainObject(output.value) && !React.isValidElement(output.value)) {
            if (!_.has(output.value, 'value')) {
                throw Error(`Key "value" is missing for variable {${variable}}.`);
            }

            // Before assigning real value, let's check if we have a custom formatter set.
            if (_.isFunction(output.value.format)) {
                output.format = output.value.format;
            }

            output.value = output.value.value;
        }

        if (modifier) {
            let parameters = modifier.split(':');
            let name = parameters.shift();
            if (this.modifiers[name]) {
                const modifier = this.modifiers[name];
                output.value = modifier.execute('' + output.value, parameters);
            }
        }

        if (output.format) {
            return output.format(output.value);
        }

        return output.value;
    }

    /**
     * This is responsible for replacing given text with given values.
     * It will automatically detect if it needs to return a string or JSX based on given variables
     * (if all variables are strings, then final output will also be returned as string)
     * @param text
     * @param values
     * @returns {*}
     */
    replaceVariables(text, values) {
        if (_.isEmpty(values)) {
            return text;
        }

        // Let's first check if we need to return pure string or JSX
        let stringOutput = true;
        _.each(values, value => {
            if (!_.isString(value) && !_.isNumber(value)) {
                stringOutput = false;
                return false;
            }
        });

        // Get text parts
        const parts = text.split(/(\{.*?\})/);

        if (stringOutput) {
            return parts.reduce((carry, part) => carry + this.processTextPart(part, values), '');
        }

        // Let's create a JSX output
        return parts.map((part, index) => <webiny-i18n-part key={index}>{this.processTextPart(part, values)}</webiny-i18n-part>);
    }

    toText(element) {
        if (_.isString(element) || _.isNumber(element)) {
            return element;
        }

        if (Webiny.elementHasFlag(element, 'i18n')) {
            const props = element.props;
            return this.translate(props.base, props.variables, props.textKey);
        }

        return '';
    }

    /**
     * Used for rendering text in DOM
     * @param textKey
     * @param base
     * @param variables
     * @returns {XML}
     */
    render(textKey, base, variables) {
        return React.createElement(this.component, {textKey, base, variables});
    }

}

export default new I18n();