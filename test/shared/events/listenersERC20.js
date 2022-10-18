const { eventHandler } = require("./eventsHandler");

const listenersERC20Transfer = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'Transfer');

    return events.map((event) => {
        return {
            index: event.index,
            from: event.event.args['from'],
            to: event.event.args['to'],
            value: event.event.args['value']
        }
    });
}

module.exports = {
    listenersERC20Transfer
};