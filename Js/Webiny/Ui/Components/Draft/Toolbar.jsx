import Webiny from 'Webiny';

class Toolbar extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            'floatingToolbarInterval': null
        };
    }

    componentDidMount() {
        super.componentDidMount();

        if (this.props.floating === false) {
            return;
        }

        const floatingToolbarInterval = setInterval(() => {
            const doc = $(document);
            const elem = $(ReactDOM.findDOMNode(this));
            const editor = elem.closest('.rich-editor');

            if (editor && (doc.scrollTop() > (editor.offset().top - 52)) && (doc.scrollTop() < (editor.offset().top + editor.height() - 20))) {
                elem.addClass('floating');
                elem.css({width: editor.outerWidth()});
                elem.css({left: editor.offset().left});
                elem.closest('.rich-editor').addClass('toolbar-floated');
            } else {
                editor.removeClass('toolbar-floated');
                elem.removeClass('floating');
                elem.css({width: 'auto'});
                elem.css({left: '0'});
            }
        }, 250);

        this.setState({'floatingToolbarInterval': floatingToolbarInterval});
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this.state.floatingToolbarInterval);
    }
}

Toolbar.defaultProps = {
    renderer() {
        return (
            <div className="editor-toolbar">
                {this.props.plugins.getToolbarActions().map((action, i) => {
                    return (
                        <span key={i} className="toolbar-action">
                            {React.isValidElement(action) ? React.cloneElement(action) : action()}
                        </span>
                    );
                })}
            </div>
        );
    }
};

export default Toolbar;