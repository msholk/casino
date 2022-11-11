import React from "react";
export class BusyBlock extends React.PureComponent {

    render() {
        const { busy } = this.props
        if (!busy) {
            return null
        }
        return (
            < div className="mw-50p alert alert-danger" data-mdb-color="danger" >
                {busy}
            </div >
        )
    }
}