const eventHandler = async (tx, contract, eventStr) => {
    const topic = contract.interface.getEventTopic(eventStr);
    const logs = tx.events.filter(x => x.topics.indexOf(topic) >= 0);
    const events = logs.map((log) => {
        return {
            index: log.logIndex,
            event: contract.interface.parseLog(log)
        };
    });
    
    return events;
}

module.exports = { eventHandler };