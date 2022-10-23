import React from 'react';


import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBNavbarLink,
} from 'mdb-react-ui-kit';
import { Accounts } from './Accounts';

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
        const { active } = this.state


        return (
            <>
                <MDBNavbar expand='lg' light bgColor='light'>
                    <MDBContainer fluid>
                        <MDBNavbarBrand href='#'>Admin Panel</MDBNavbarBrand>



                        <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
                            <MDBNavbarItem>
                                <MDBNavbarLink active={active === 'home'} aria-current='page' href='#' onClick={() => { this.setState({ active: 'home' }) }}>
                                    Home
                                </MDBNavbarLink>
                            </MDBNavbarItem>
                            <MDBNavbarItem active={active === 'accounts'}>
                                <MDBNavbarLink href='#' onClick={() => { this.setState({ active: 'accounts' }) }}>
                                    Accounts
                                </MDBNavbarLink>
                            </MDBNavbarItem>


                        </MDBNavbarNav>
                    </MDBContainer>

                </MDBNavbar >
                {this.getSelectedComponent()}
            </>
        );
    }
    getSelectedComponent() {
        const { active } = this.state
        const { handleInputChange, inputValue, busy, isWalletConnected } = this.props
        const { setError, setBusy } = this.props
        // eslint-disable-next-line default-case
        switch (active) {
            case "home":
                return (
                    <div className="bg-white border rounded-5" >


                    </div>
                )
            case "accounts":

                return (
                    <div className="bg-white border rounded-5" >
                        <Accounts {...{ setBusy, setError }} />

                    </div>
                )
        }
        return null;



    }
}
