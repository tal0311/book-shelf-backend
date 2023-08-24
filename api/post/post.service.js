
import dbService from '../../services/db.service.js';
import logger from '../../services/logger.service.js';
import utilService from '../../services/util.service.js';
import userService from '../user/user.service.js';
import socketService from '../../services/socket.service.js';
import { ObjectId } from 'mongodb';


async function query(filterBy = { txt: '', userFilter: '', userId: '' }) {
    try {
        logger.info('global.defaultUser:', global.defaultUser)
        let criteria = {}
        if (filterBy.txt || filterBy.userFilter === 'shelf') {
            criteria = buildCriteria(filterBy);
            console.log('criteria:', criteria)
        }

        if (filterBy.userId && filterBy.userFilter === 'saved-shelfs') {
            return await userCriteria(filterBy.userId);
        }

        const collection = await dbService.getCollection('shelf');
        var shelfs = await collection.aggregate(criteria).toArray();
        console.log('shelfs:', shelfs.length)
        // set tags and user update 
        userService.setTags(shelfs)
        return shelfs;
    } catch (err) {
        logger.error('cannot find shelfs', err);
        throw err;
    }
}

// returns saved shelfs of user from shelf collection
async function userCriteria(userId) {
    const userCollection = await dbService.getCollection('user');

    const pipeline = [
        {
            $match: { _id: ObjectId(userId) }
        },
        {
            $lookup: {
                from: "shelf",
                let: { savedshelfIds: "$savedshelfIds" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    { $toString: "$_id" },
                                    { $map: { input: "$$savedshelfIds", as: "id", in: { $toString: "$$id" } } }
                                ]
                            }
                        }
                    }
                ],
                as: "savedshelfs"
            }
        },
        {
            $project: {
                savedshelfs: 1
            }
        }
    ];

    const result = await userCollection.aggregate(pipeline).toArray();

    return result[0].savedshelfs;
}

// returns shelfs by criteria txt and user filter user shelfs
function buildCriteria({ txt, userFilter, userId }) {

    let pipeline = []
    if (txt) {

        pipeline.push(
            {
                $match: {
                    txt: {
                        $regex: txt,
                        $options: 'i'
                    }
                }
            })
    }

    if (userId && userFilter === 'shelf') {
        pipeline.push(
            {
                $match: {
                    "by._id": userId
                }
            })
    }

    return pipeline

}

async function getById(shelfId) {
    try {
        const collection = await dbService.getCollection('shelf')
        const shelf = collection.findOne({ _id: ObjectId(shelfId) })
        return shelf
    } catch (err) {
        logger.error(`while finding shelf ${shelfId}`, err)
        throw err
    }
}

async function remove(shelfId) {
    try {
        const collection = await dbService.getCollection('shelf')
        await collection.deleteOne({ _id: ObjectId(shelfId) })
        return shelfId
    } catch (err) {
        logger.error(`cannot remove shelf ${shelfId}`, err)
        throw err
    }
}

async function add(shelf) {
    try {
        shelf.tags = [..._getshelfTags(shelf.txt)]
        const collection = await dbService.getCollection('shelf')
        await collection.insertOne(shelf)
        return shelf
    } catch (err) {
        logger.error('cannot insert shelf', err)
        throw err
    }
}

async function update(shelf) {
    try {
        // TODO: VALIDATE shelf FROM BODY
        const shelfId = shelf._id
        delete shelf._id
        const collection = await dbService.getCollection('shelf')
        await collection.updateOne({ _id: ObjectId(shelfId) }, { $set: shelf })
        shelf._id = shelfId
        return shelf
    } catch (err) {
        logger.error(`cannot update shelf ${shelfId}`, err)
        throw err
    }
}

async function addShelfComment(shelfId, comment) {
    try {
        comment.id = utilService.makeId()
        const collection = await dbService.getCollection('shelf')
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

        const collection = await dbService.getCollection('shelf');

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

// helpers
function _getShelfTags(txt) {
    if (!txt) return []
    return txt.split(' ').filter(word => word.startsWith('#')).map(tag => tag.substring(1).trim())
}


export default {
    remove,
    query,
    getById,
    add,
    update,
    addShelfComment,
    addShelfLike
}
