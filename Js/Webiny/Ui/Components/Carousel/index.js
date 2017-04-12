import Webiny from 'Webiny';

class Carousel extends Webiny.Ui.Component {
    constructor(props) {
        super(props);

        this.carousel = null;

        this.bindMethods('getCarouselWrapper', 'setValue', 'getEditor');
    }

    componentDidMount() {
        super.componentDidMount();

        this.carousel = $(this.getCarouselWrapper()).owlCarousel(this.props);
    }

    shouldComponentUpdate() {
        return false;
    }

    getCarouselWrapper() {
        return ReactDOM.findDOMNode(this);
    }
}

Carousel.defaultProps = {
    loop: true,
    margin: 10,
    nav: false,
    items: 1,
    center: false,
    autoWidth: false,
    URLhashListener: false,
    navRewind: false,
    navText: ['&#x27;next&#x27;', '&#x27;prev&#x27;'],
    dots: true,
    lazyLoad: false,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    video: false,
    videoHeight: false,
    videoWidth: false,
    animateOut: false,
    animateIn: false,
    itemElement: 'div',
    stageElement: 'div',
    mouseDrag: false,
    renderer() {
        return (
            <div className="owl-carousel">
                {this.props.children}
            </div>
        );
    }
};

export default Webiny.createComponent(Carousel, {modules: {owlCarousel: 'owl.carousel'}});
