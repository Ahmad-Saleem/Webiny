import React from 'react';
import Webiny from 'webiny';

class Notifications extends Webiny.Ui.View {

}

Notifications.defaultProps = {
    renderer() {
        const {View, Data, List, List: {Table}, Container} = this.props;

        const listProps = {
            ref: ref => this.list = ref,
            api: '/services/webiny/app-notifications/',
            perPage: 100,
            connectToRouter: true
        };

        return (
            <View.List>
                <View.Header title="My Notifications"/>
                <View.Body>
                    <div className="notification-list">
                        <Data {...listProps} waitForData={false}>
                            {({data, loader}) => {
                                if (loader) {
                                    return React.cloneElement(loader, {}, 'Fetching notifications...');
                                }

                                return (
                                    <div>
                                        {data.list.map(r => <Container key={r.id} notification={r}/>)}
                                    </div>
                                );
                            }}
                        </Data>
                    </div>
                </View.Body>
            </View.List>
        );
    }
};

export default Webiny.createComponent(Notifications, {
    modules: ['View', 'List', 'Data', {Container: 'Webiny/Skeleton/Notifications/Container'}]
});