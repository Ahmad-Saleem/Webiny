import Webiny from 'Webiny';

class SelectInput extends Webiny.Ui.FormComponent {

    constructor(props) {
        super(props);

        this.select2 = null;
        this.options = null;
        this.bindMethods('getConfig,getValue,triggerChange,getSelect2InputElement,itemRenderer');
    }

    componentDidMount() {
        super.componentDidMount();
        this.select2 = this.getSelect2InputElement().select2(this.getConfig(this.props));
        this.select2.on('select2:select', e => {
            this.triggerChange(e.target.value);
        });
        this.select2.on('select2:unselect', () => {
            this.triggerChange('');
        });
        this.select2.val(this.getValue()).trigger('change');
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        const possibleValues = _.map(this.options, 'id');
        const value = this.getValue();
        const inPossibleValues = possibleValues.indexOf(value) > -1;

        if (!this.options || !_.isEqual(this.props.options, this.options)) {
            this.select2.html('');
            this.getSelect2InputElement().select2(this.getConfig(this.props));
        }

        $(ReactDOM.findDOMNode(this)).find('select').prop('disabled', !!this.isDisabled());

        if (value !== null && !inPossibleValues && possibleValues.length > 0) {
            this.triggerChange(null);
            return;
        }

        if (value !== null && inPossibleValues) {
            this.select2.val(value).trigger('change');
            return;
        }

        this.select2.val('').trigger('change');
    }

    getSelect2InputElement() {
        return $(ReactDOM.findDOMNode(this)).find('select');
    }

    getValue() {
        const value = this.props.valueLink ? this.props.valueLink.value : this.props.selectedValue;
        if (value === null || value === undefined) {
            return value;
        }

        return _.isObject(value) ? value.id : '' + value;
    }

    triggerChange(value) {
        if (this.props.useDataAsValue && value) {
            const selectedOption = _.find(this.options, {id: value});
            if (!selectedOption.data) {
                console.warn('Warning: attempting to use item data but data is not present in option items!');
            } else {
                value = selectedOption.data;
            }
        }
        if (this.props.valueLink) {
            this.props.valueLink.requestChange(value);
        }
        this.props.onChange(value);
    }

    getOptionText(text) {
        if (!text) {
            return '';
        }

        if (text.startsWith('<')) {
            return $(text);
        }

        return text || '';
    }

    /**
     * This will be triggered twice due to a bug in Select2 (https://github.com/select2/select2/pull/4306)
     * @param item
     * @param type optionRenderer || selectedRenderer
     * @returns {*}
     */
    itemRenderer(item, type) {
        let text = item.text;
        if (_.isFunction(this.props[type]) && item.data) {
            text = this.props[type].call(this, item.data || {});
        }

        if (!_.isString(text)) {
            text = ReactDOMServer.renderToStaticMarkup(text);
        }

        return this.getOptionText(text);
    }

    getConfig(props) {
        const config = {
            disabled: this.isDisabled(props),
            minimumResultsForSearch: props.minimumResultsForSearch,
            placeholder: props.placeholder,
            allowClear: props.allowClear,
            templateResult: item => this.itemRenderer(item, 'optionRenderer'),
            templateSelection: item => this.itemRenderer(item, 'selectedRenderer')
        };

        if (!this.options || !_.isEqual(props.options, this.options)) {
            // Prepare options
            const options = [];
            _.each(props.options, option => {
                if (React.isValidElement(option.text)) {
                    option.text = ReactDOMServer.renderToStaticMarkup(option.text);
                }
                options.push(option);
            });
            config['data'] = this.options = options;
        }

        return config;
    }
}

SelectInput.defaultProps = {
    allowClear: false,
    placeholder: null,
    onChange: _.noop,
    selectedValue: '',
    minimumResultsForSearch: 15,
    useDataAsValue: false,
    renderer() {
        const cssConfig = {
            'form-group': true,
            'error': this.state.isValid === false,
            'success': this.state.isValid === true
        };

        let label = null;
        if (this.props.label) {
            label = <label key="label" className="control-label">{this.props.label}</label>;
        }

        let validationMessage = null;

        if (this.state.isValid === false) {
            validationMessage = <span className="info-txt">({this.state.validationMessage})</span>;
        }

        return (
            <div className={this.classSet(cssConfig)}>
                {label}
                <select style={{'width': '100%'}}/>
                {validationMessage}
            </div>
        );
    }
};

export default SelectInput;