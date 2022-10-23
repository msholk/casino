import React from 'react';
import {
    MDBNavbarBrand,
} from 'mdb-react-ui-kit';

export class AdminPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            active: 'home'
        };
    }
    render() {
        const { busy, isWalletConnected, isBankerOwner } = this.props

        if (busy || !isWalletConnected || !isBankerOwner) {
            return null
        }



        return (
            <>
                <MDBNavbarBrand href='#'>Admin Panel</MDBNavbarBrand>
                <div>
                    'withdrawAllPlatformDAI()': null,
                    'checkPlatformBalance()': null,
                </div>

            </>
        );
    }

}
