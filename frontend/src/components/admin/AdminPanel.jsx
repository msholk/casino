import React from 'react';
import _ from 'lodash'

import {
    MDBNavbarBrand,
} from 'mdb-react-ui-kit';
/*
dminFacet: {
        'withdrawAllPlatformDAI()': null,
        'checkPlatformBalance()': null,
        'isContractOwner()': null
    }*/
export class AdminPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            active: 'home'
        };
    }
    getPlatformBalance() {
        const { platformBalance } = this.props
        if (!_.get(platformBalance, 'houseBalance')) return '0.00'

        return platformBalance.balanceP18.mul(platformBalance.balanceP18).toString() / 10 ** 18
    }
    componentDidMount() {

        const { platformBalance, getPlatformBalanceHandler } = this.props
        if (!platformBalance) {
            getPlatformBalanceHandler()
        }
    }
    render() {
        const { busy, isWalletConnected, isAdmin, platformBalance } = this.props
        console.log("platformBalance", platformBalance)

        if (busy || !isWalletConnected || !isAdmin) {
            return null
        }



        return (
            <>
                <MDBNavbarBrand href='#'>Admin Panel</MDBNavbarBrand>
                <div className="mt-1">
                    <span className="mr-5">
                        <div><strong>Platform balance: {this.getPlatformBalance()} DAI</strong></div>
                    </span>
                </div>

                <div>
                    'withdrawAllPlatformDAI()': null,
                </div>

            </>
        );
    }

}


