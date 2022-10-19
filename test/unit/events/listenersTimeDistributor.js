const { eventHandler } = require("./eventsHandler");

const listenersDistributionChange = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'DistributionChange');

    return events.map((event) => {
        return {
            index: event.index,
            receiver: event.event.args['receiver'],
            amount: event.event.args['amount'],
            rewardToken: event.event.args['rewardToken']
        }
    });
}

const listenersTokensPerIntervalChange = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'TokensPerIntervalChange');

    return events.map((event) => {
        return {
            index: event.index,
            receiver: event.event.args['receiver'],
            amount: event.event.args['amount'],
        }
    });
}

module.exports = {
    listenersDistributionChange,
    listenersTokensPerIntervalChange
};