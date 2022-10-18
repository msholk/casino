const { eventHandler } = require("./eventsHandler");

const listenersRoleAdminChanged = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'RoleAdminChanged');

    return events.map((event) => {
        return {
            index: event.index,
            role: event.event.args['role'],
            previousAdminRole: event.event.args['previousAdminRole'],
            newAdminRole: event.event.args['newAdminRole']
        }
    });
}

const listenersRoleGranted = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'RoleGranted');

    return events.map((event) => {
        return {
            index: event.index,
            role: event.event.args['role'],
            account: event.event.args['account'],
            sender: event.event.args['sender']
        }
    });
}

const listenersRoleRevoked = async (tx, contract) => {
    const events = await eventHandler(tx, contract, 'RoleRevoked');

    return events.map((event) => {
        return {
            index: event.index,
            role: event.event.args['role'],
            account: event.event.args['account'],
            sender: event.event.args['sender']
        }
    });
}

module.exports = {
    listenersRoleAdminChanged,
    listenersRoleGranted,
    listenersRoleRevoked
};