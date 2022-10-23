import React from "react";
export class CustomerInfo extends React.PureComponent {

    render() {
        const { customerAddress, isWalletConnected } = this.props
        if (!isWalletConnected) {
            return null
        }
        return (
            <div className="mt-1">

                <span className="mr-5">
                    <strong>Your Wallet Address:</strong> {customerAddress}
                </span>
            </div>
        )
    }
}