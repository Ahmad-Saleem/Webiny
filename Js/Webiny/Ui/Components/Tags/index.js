import Webiny from 'Webiny';
import styles from './styles.css';

class Tags extends Webiny.Ui.FormComponent {
    constructor(props) {
        super(props);

        this.bindMethods('focusTagInput,removeTag,addTag,validateTag');
    }

    componentDidMount() {
        super.componentDidMount();
        this.tagInput.focus();
    }

    focusTagInput() {
        this.tagInput.focus();
    }

    removeTag(index) {
        const value = this.props.value;
        value.splice(index, 1);
        this.props.onChange(value);
    }

    tagExists(tag) {
        return _.find(this.props.value, data => data === tag);
    }

    addTag(e) {
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        let tags = this.props.value;
        const input = this.tagInput;
        const emptyField = !input.value;
        const canRemove = emptyField && e.keyCode === 8 || e.keyCode === 46;
        const skipAdd = e.key !== 'Tab' && e.key !== 'Enter';

        if (canRemove) {
            this.removeTag(_.findLastIndex(tags));
        }

        if (skipAdd) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (emptyField) {
            return this.validateTag();
        }

        if (this.tagExists(input.value)) {
            return;
        }

        if (!_.isArray(tags)) {
            tags = [];
        }

        this.validateTag(input.value).then(() => {
            tags.push(input.value);
            input.value = '';
            this.props.onChange(tags);
            this.setState({tag: ''});
        }).catch(e => {
            this.props.onInvalidTag(input.value, e);
        });
    }

    validateTag(value = null) {
        return Webiny.Validator.validate(value, this.props.validateTags);
    }
}

Tags.defaultProps = _.merge({}, Webiny.Ui.FormComponent.defaultProps, {
    validateTags: null,
    placeholder: 'Type and hit ENTER',
    onInvalidTag: _.noop,
    onChange: _.noop,
    renderer() {

        const {Icon, styles} = this.props;

        const cssConfig = {
            'form-group': true,
            'error': this.state.isValid === false,
            'success': this.state.isValid === true
        };

        const input = {
            type: 'text',
            className: styles.input,
            ref: tagInput => this.tagInput = tagInput,
            onKeyDown: this.addTag,
            placeholder: this.getPlaceholder(),
            readOnly: _.get(this.props, 'readOnly', false),
        };

        return (
            <div className={this.classSet(cssConfig)}>
                {this.renderLabel()}
                <div className={styles.container} onClick={this.focusTagInput}>
                    <div className={styles.tag}>
                        {_.isArray(this.props.value) && this.props.value.map((tag, index) => (
                            <div key={tag} className={styles.block}>
                                <p>{tag}</p>
                                <Icon icon="icon-cancel" onClick={this.removeTag.bind(this, index)}/>
                            </div>
                        ))}
                        <input {...input}/>
                    </div>
                </div>
                {this.renderDescription()}
                {this.renderValidationMessage()}
            </div>
        );
    }
});

export default Webiny.createComponent(Tags, {modules: ['Icon'], styles});