import React from "react";
export class CustomerInfo extends React.PureComponent {

    render() {
        const { customerTotalBalance, customerAddress, isWalletConnected } = this.props
        if (!isWalletConnected) {
            return null
        }
        return (
            <div className="mt-1">
                <span className="mr-5">
                    <strong>Customer Balance:</strong> {customerTotalBalance}
                </span>
                <span className="mr-5">
                    <strong>Your Wallet Address:</strong> {customerAddress}
                </span>
            </div>
        )
    }
}