import Webiny from 'Webiny';
import filesize from 'filesize';

class FileSize extends Webiny.Ui.Component {

}

FileSize.defaultProps = {
    options: {},
    renderer() {
        return (
            <span>{filesize(this.props.value, this.props.options)}</span>
        );
    }
};


export default FileSize;