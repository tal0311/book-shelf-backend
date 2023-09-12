
import dbService from '../../services/db.service.js';
import logger from '../../services/logger.service.js';
import utilService from '../../services/util.service.js';
import userService from '../user/user.service.js';
import socketService from '../../services/socket.service.js';
import { scrapMetaData } from '../../services/scraping.service.js';
import pkg from 'mongodb';
const { ObjectId } = pkg;

const collectionName = 'shelf';

async function getById(bookId, shelfId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const shelf = collection.findOne({ _id: ObjectId(shelfId) })
        return shelf
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

async function update(shelf, bookId, updatedBook) {
    try {
        const shelfId = shelf._id
        const collection = await dbService.getCollection(collectionName)
        const updatedShelf = await collection.findOneAndUpdate(
            { _id: new ObjectId(shelfId), 'books.bookId': bookId },
            { $set: { 'books.$': updatedBook } },
            { returnDocument: 'after' }
        );
        shelf._id = shelfId
        return shelf
    } catch (err) {
        logger.error(`cannot update shelf ${shelfId}`, err)
        throw err
    }
}

async function addShelfLike(shelfId, user) {
    try {
        const like = {
            userId: user._id,
            username: user.username,
            imgUrl: user.imgUrl,
        };
        // logger.debug('like:', like)
        // logger.debug('shelfId:', shelfId)
        // logger.debug('user:', user)

        const collection = await dbService.getCollection(collectionName);

        let updatedItem = null;
        const shelfToUpdate = await getById(shelfId);
        // TODO: write this better
        const idx = shelfToUpdate.likedBy.findIndex(by => by.userId === user._id);
        if (idx === -1) {
            updatedItem = await collection.findOneAndUpdate(
                { _id: ObjectId(shelfId) },
                { $push: { likedBy: like } },
                { returnOriginal: false }
            );

            if (updatedItem.value.tags.length) {
                userService.updateUserTags(updatedItem.value.tags, user._id);
            }
            const { _id: byId, ...rest } = user
            const byUser = { byId, ...rest }
            _addToUserNotifications(shelfToUpdate, byUser, 'like')
        } else {
            shelfToUpdate.likedBy.splice(idx, 1);
            updatedItem = await collection.findOneAndUpdate(
                { _id: ObjectId(shelfId) },
                { $set: { likedBy: shelfToUpdate.likedBy } },
                { returnOriginal: false }
            );
        }

        return updatedItem.value;
        return null
    } catch (err) {
        logger.error(`cannot add shelf like ${shelfId}`, err);
        throw err;
    }
}

async function _addToUserNotifications(shelf, byUser, noteType) {
    try {
        const note = {
            noteId: utilService.makeId(),
            type: noteType,
            byUser,
            createdAt: Date.now()
        }
        const collection = await dbService.getCollection('notificatioens')
        collection.findOneAndUpdate(
            { _id: ObjectId('64331f21f126651242ac4beb') },
            { $push: { [`${shelf.by._id}`]: note } },
            { upsert: true }
        )
        socketService.emitToUser({ type: 'add-user-note', data: null, userId: shelf.by._id })
    } catch (err) {
        logger.error('cannot insert note', err)
        throw err
    }
}

async function addShelfComment(shelfId, comment) {
    try {
        comment.id = utilService.makeId()
        const collection = await dbService.getCollection(collectionName)
        // returns the updated shelf
        const shelf = await getById(shelfId);
        _addToUserNotifications(shelf, comment.by, 'comment')
        const updatedItem = await collection.findOneAndUpdate(
            { _id: ObjectId(shelfId) },
            { $push: { comments: comment } },
            { returnOriginal: false }
        );

        return updatedItem.value
    } catch (err) {
        logger.error(`cannot add shelf comment ${shelfId}`, err)
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
    addShelfLike
}
