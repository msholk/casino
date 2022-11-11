import React from "react";
export class ErrorBlock extends React.PureComponent {

    render() {
        const { error } = this.props
        if (!error) {
            return null
        }
        return (
            <div className="mw-50p alert alert-danger" data-mdb-color="danger">
                {error}
            </div>
        )
    }
}