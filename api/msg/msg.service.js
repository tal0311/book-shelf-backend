const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
import pkg from 'mongodb';
const { ObjectId } = pkg;

// TODO : make this better aggregate
async function query(ownerId) {
    logger.info(ownerId)
    try {
        const collection = await dbService.getCollection('msg');
        const result = await collection.aggregate([
            { $project: { [`${ownerId}.history`]: 1 } }
        ]).toArray()
        // db.getCollection("msg").aggregate([
        //     { $project: { "643d2a0f99553dc5ce88b861.history.643d2a0f99553dc5ce88b860": 1 } }
        // ])
        return result[0][ownerId].history
    } catch (error) {

    }
}

async function remove(shelfId) {
    try {
        const collection = await dbService.getCollection('msg')
        await collection.deleteOne({ _id: ObjectId(shelfId) })
        return shelfId
    } catch (err) {
        logger.error(`cannot remove shelf ${shelfId}`, err)
        throw err
    }
}
async function getByIdUserId(ownerId, userId) {
    try {
        const collection = await dbService.getCollection('msg');
        const result = collection.aggregate([
            { $project: { [`${ownerId}.history.${userId}`]: 1 } }

        ]).toArray()
        // db.getCollection("msg").aggregate([
        //     { $project: { "643d2a0f99553dc5ce88b861.history.643d2a0f99553dc5ce88b860": 1 } }
        // ])
        return result
    } catch (err) {
        logger.error(`while finding msg ${ownerId}`, err);
        throw err;
    }
}



async function add(msg) {
    try {
        logger.info(msg)
        const collection = await dbService.getCollection('msg')
        const result = await collection.updateOne(
            { [msg.by]: { $exists: true } },
            { $push: { [`${msg.by}.history.${msg.to}.msgs`]: msg } },
            { returnOriginal: false }
        )
        return result.value
    } catch (err) {
        logger.error('cannot insert msg', err)
        throw err
    }
}


module.exports = {
    add,
    remove,
    getByIdUserId,
    query
}
