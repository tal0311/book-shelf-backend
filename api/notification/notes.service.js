const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
import pkg from 'mongodb';
const { ObjectId } = pkg;

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = {
            txt: { $regex: '', $options: 'i' }
        }

        const collection = await dbService.getCollection('note')
        var notes = await collection.find(criteria).toArray()
        console.log('shelfs:', shelfs.length)
        return notes
    } catch (err) {
        logger.error('cannot find shelfs', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('notificatioens');
        const notes = await collection.aggregate([
            {
                $project: { [userId]: 1 }
            }
        ]).toArray();
        return notes;
    } catch (err) {
        console.error('Error while finding note', err);
        throw err;
    }
}


async function add(note) {
    try {
        const collection = await dbService.getCollection('note')
        await collection.insertOne(note)
        return note
    } catch (err) {
        logger.error('cannot insert note', err)
        throw err
    }
}


export default {
    query,
    add,
    getById
}
