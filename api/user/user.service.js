import asyncLocalStorage from '../../services/als.service.js';
import dbService from '../../services/db.service.js';
import logger from '../../services/logger.service.js';
import pkg from 'mongodb';
const { ObjectId } = pkg;



export default {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    setTags,
    updateUserTags,
    toggleUserFollow,

}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: ObjectId(userId) })
        delete user.password

        // user.givenComments = await commentService.query({ byUserId: ObjectId(user._id) })
        // user.givenComments = user.givenComments.map(comment => {
        //     delete comment.byUser
        //     return comment
        // })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

// this is for login
export async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ _id: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // select only updatable properties
        const userToSave = {
            _id: ObjectId(user._id),
            fullname: user.fullname,
            tags: user.tags,
            followers: user.followers,
            following: user.following,
            savedshelfIds: user.savedshelfIds
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function setTags(shelfs) {

    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        if (!loggedinUser) throw 'no logged user'
        if (!shelfs || !shelfs.length) return
        shelfs = shelfs.map(shelf => {
            if (shelf.tags) {
                return shelf.tags
            }
        })
        const userTags = [...new Set(shelfs.flatMap(tag => tag))]
        const user = await getById(loggedinUser._id)
        user.tags = userTags

        update(user)
    } catch (err) {
        console.log('err', err)
    }
}

async function updateUserTags(shelfTags, userId) {
    const user = await getById(userId)
    shelfTags.forEach(tag => {
        if (!user.tags.includes(tag)) {
            user.tags.push(tag)
        }
    });

    update(user)
}

async function add(user) {
    try {
        const userToAdd = getEmptyUser(user.fullname, user.password, user.username, user.imgUrl)
        const collection = await dbService.getCollection('user')
        const addedUser = await collection.insertOne(userToAdd)
        return addedUser
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

async function toggleUserFollow(loggedinUser, userToToggleId) {
    const loggedUser = await getById(loggedinUser._id);
    const userToToggle = await getById(userToToggleId);

    const idxLogged = loggedUser.following.findIndex(f => f.userId === userToToggleId);
    const idxToToggle = userToToggle.followers.findIndex(f => f.userId === loggedUser._id.toString());

    if (idxLogged !== -1) {
        loggedUser.following.splice(idxLogged, 1);
        userToToggle.followers.splice(idxToToggle, 1);

        update(userToToggle);
        return await update(loggedUser);
    } else {
        const loggedUserFollow = {
            fullname: userToToggle.fullname,
            username: userToToggle.username,
            userId: userToToggleId,
            imgUrl: userToToggle.imgUrl
        };

        const userToToggleFollow = {
            fullname: loggedUser.fullname,
            username: loggedUser.username,
            userId: loggedUser._id.toString(),
            imgUrl: loggedUser.imgUrl
        };

        userToToggle.followers.push(userToToggleFollow);
        loggedUser.following.push(loggedUserFollow);

        update(userToToggle);
        return await update(loggedUser);
    }
}

async function toggleSaveshelf(userId, shelfId) {
    const loggedUser = await getById(userId);

    if (loggedUser.savedshelfIds.includes(shelfId)) {
        const idx = loggedUser.savedshelfIds.findIndex(p => p === shelfId)
        loggedUser.savedshelfIds.splice(idx, 1)
        return await update(loggedUser)
    }

    loggedUser.savedshelfIds.push(shelfId)
    return await update(loggedUser)
}


// TODO: change default img
function getEmptyUser(fullname, password, username, imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png') {
    return {
        username,
        imgUrl,
        fullname,
        password,
        createdAt: Date.now(),
        following: [],
        followers: [],
        savedshelfIds: [],
        stories: [],
        highlights: [],
        tags: []
    }
}


function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    // if (filterBy.minBalance) {
    //     criteria.score = { $gte: filterBy.minBalance }
    // }
    return criteria
}




