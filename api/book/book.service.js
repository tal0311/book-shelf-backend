
import dbService from '../../services/db.service.js';
import logger from '../../services/logger.service.js';
import utilService from '../../services/util.service.js';
import userService from '../user/user.service.js';
import socketService from '../../services/socket.service.js';
import { scrapMetaData } from '../../services/scraping.service.js';
import pkg from 'mongodb';
const { ObjectId } = pkg;

const collectionName = 'shelf';

// not in use
async function getById(bookId, shelfId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const shelf = await collection.find({ _id: new ObjectId(shelfId) }).toArray()
        return shelf[0].books.find(b => b.bookId === bookId)
    } catch (err) {
        logger.error(`while finding shelf ${shelfId}`, err)
        throw err
    }
}

async function remove(bookId, shelfId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const updatedShelf = await collection.findOneAndUpdate(
            { _id: new ObjectId(shelfId) },
            { $pull: { 'books': { bookId: bookId } } },
            { returnDocument: 'after' }
        );
        return updatedShelf
    } catch (err) {
        logger.error(`cannot remove book ${bookId} ${shelfId}`, err)
        throw err
    }
}

async function add(book, shelfId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const shelf = await collection.findOneAndUpdate(
            { _id: new ObjectId(shelfId), 'books.bookId': { $ne: book.bookId } },
            { $addToSet: { 'books': book } },
            { returnOriginal: false, returnDocument: 'after' }
        );
        return shelf
    } catch (err) {
        logger.error('cannot insert shelf', err)
        throw err
    }
}

async function update(shelfId, bookId, updatedBook) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const updatedShelf = await collection.findOneAndUpdate(
            { _id: new ObjectId(shelfId), 'books.bookId': bookId },
            { $set: { 'books.$': updatedBook } },
            { returnDocument: 'after' }
        );
        return updatedShelf
    } catch (err) {
        logger.error(`cannot update shelf ${shelfId}`, err)
        throw err
    }
}

// helpers
function _getShelfTags(txt) {
    if (!txt) return []
    return txt.split(' ').filter(word => word.startsWith('#')).map(tag => tag.substring(1).trim())
}


export default {
    remove,
    getById,
    add,
    update,
}
