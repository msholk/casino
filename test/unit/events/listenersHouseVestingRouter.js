const { eventHandler } = require("./eventsHandler");

const listenersWalletCreated = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'WalletCreated');

    return events.map((event) => {
        return {
            index: event.index,
            walletAddress: event.event.args['walletAddress'],
            walletOwner: event.event.args['owner']
        }
    });
}

module.exports = {
    listenersWalletCreated
};