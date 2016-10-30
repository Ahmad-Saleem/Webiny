import Webiny from 'Webiny';
import Input from './Input';
import SimpleInput from './SimpleInput';

class Module extends Webiny.Module {

    init() {
        Webiny.Ui.Components.Input = Input;
        Webiny.Ui.Components.SimpleInput = SimpleInput;
    }
}

export default Module;
