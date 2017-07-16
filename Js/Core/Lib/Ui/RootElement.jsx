import View from './../Core/View';
import Router from './../Router/Router';
import Dispatcher from './../Core/Dispatcher';
import Placeholder from './Placeholder';
import dynamics from 'dynamics.js';

class RootElement extends View {

    constructor() {
        super();

        this.state = {
            loading: true
        };

        this.loader = document.querySelector('.preloader-wrap');

        this.bindMethods('onDidUpdate,forceUpdate');
    }

    componentDidMount() {
        console.timeStamp('RootElement DidMount');
        this.unsubscribe = Dispatcher.on('RenderView', () => {
            return this.setState({
                time: _.now()
            });
        });

        Router.start().then(() => {
            this.setState({loading: false});
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.unsubscribe();
    }

    hideLoader() {
        if (this.loader) {
            dynamics.animate(this.loader, {
                opacity: 0
            }, {
                type: dynamics.easeOut,
                duration: 500,
                complete: () => {
                    this.loader.style.display = 'none';
                    this.loader = null;
                }
            });
        }
    }

    onDidUpdate() {
        this.hideLoader();
        window.scrollTo(0, 0);
    }
}

RootElement.defaultProps = _.merge({}, View.defaultProps, {
    renderer() {
        if (!this.state.loading) {
            return (
                <div>
                    <Placeholder onDidUpdate={this.onDidUpdate} name="Layout"/>
                </div>
            );
        }
        return null;
    }
});

export default RootElement;
