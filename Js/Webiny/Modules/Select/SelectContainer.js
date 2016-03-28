import Webiny from 'Webiny';
import Select from './Select';

class SelectContainer extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: []
        };

        this.lastUsedSource = null;

        this.bindMethods('prepareOptions,renderOptions');
    }

    componentDidMount() {
        super.componentDidMount();
        this.prepareOptions(this.props);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps();
        this.prepareOptions(props);
    }

    prepareOptions(props) {
        const options = [];
        if (props.children) {
            React.Children.map(props.children, child => {
                let option = child.props.children;
                if (!_.isString(option)) {
                    option = ReactDOMServer.renderToStaticMarkup(option);
                }

                options.push({
                    id: child.props.value,
                    text: option
                });
            });
            return this.setState({options});
        }

        if (props.options) {
            // Possible scenarios: function, object with key:value pairs
            if (_.isFunction(props.options)) {
                if (props.options === this.lastUsedSource) {
                    return;
                }
                this.lastUsedSource = props.options;

                return Q(props.options()).then(options => {
                    const valueAttr = options.valueAttr || props.valueAttr;
                    const textAttr = options.textAttr || props.textAttr;

                    if (_.isPlainObject(options)) {
                        options = options.data;
                    }
                    
                    this.setState({options: this.renderOptions(props, options, valueAttr, textAttr)});
                });
            } else {
                _.each(props.options, (value, key) => {
                    options.push({
                        id: key,
                        text: value
                    });
                });

                return this.setState({options});
            }
        }

        if (props.api) {
            const sourceFingerprint = props.api + JSON.stringify(props.apiParams || {});
            if (this.lastUsedSource === sourceFingerprint) {
                return;
            }

            this.lastUsedSource = sourceFingerprint;
            new Webiny.Api.Entity(props.api).crudList(props.apiParams || {}).then(apiResponse => {
                this.setState({options: this.renderOptions(props, apiResponse.getData().list, props.valueAttr, props.textAttr)});
            });
        }
    }

    renderOptions(props, data, valueAttr, textAttr) {
        return _.map(data, option => {
            const id = option[valueAttr || 'id'];
            let text = props.optionRenderer && props.optionRenderer(option) || option[textAttr];
            if (!_.isString(text)) {
                text = ReactDOMServer.renderToStaticMarkup(text);
            }
            return {id, text};
        });
    }

    render() {
        return (
            <Select {...this.props} options={this.state.options}/>
        );
    }
}

export default SelectContainer;