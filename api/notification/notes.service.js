import dbService from '../../services/db.service.js'
import logger from '../../services/logger.service.js'
import utilService from '../../services/util.service.js'
import pkg from 'mongodb';
const { ObjectId } = pkg;

async function query(userId) {
    try {
        const collection = await dbService.getCollection('note')
        var notes = await collection.find({ ownerId: userId }).toArray()
        return notes
    } catch (err) {
        logger.error('cannot find shelfs', err)
        throw err
    }
}

async function add(note, userId) {
    try {
        const collection = await dbService.getCollection('note')
        const notes = await collection.updateOne({ ownerId: userId }, { $push: { notifications: note } })
        return notes
    } catch (err) {
        logger.error('cannot insert note', err)
        throw err
    }
}


export default {
    query,
    add,
}
