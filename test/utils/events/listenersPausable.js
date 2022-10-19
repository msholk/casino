const { eventHandler } = require("./eventsHandler");

const listenersPaused = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'Paused');

    return events.map((event) => {
        return {
            index: event.index,
            account: event.event.args['account']
        }
    });
}

const listenersUnpaused = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'Unpaused');

    return events.map((event) => {
        return {
            index: event.index,
            account: event.event.args['account']
        }
    });
}

module.exports = {
    listenersPaused,
    listenersUnpaused
};