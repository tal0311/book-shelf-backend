import userService from './user.service.js';
import socketService from '../../services/socket.service.js';
import logger from '../../services/logger.service.js';


export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params
        const currentUser = await userService.getById(id)

        const keyToUpdate = req.body
        const userToUpdate = { ...currentUser, ...keyToUpdate }
        const savedUser = await userService.update(userToUpdate)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

export async function toggleFollow(req, res) {

    const { id: userToFollowId } = req.params
    const { loggedinUser } = req
    const updatedUser = await userService.toggleUserFollow(loggedinUser, userToFollowId)
    res.json(updatedUser)
}


export async function getUserStory(req, res) {

    const { id: userId } = req.params
    let user = await userService.getById(userId)
    user = { _id: user._id, username: user.username, imgUrl: user.imgUrl, fullname: user.fullname, stories: user.stories }

    res.json(user)
}

// export default {
//     getUser,
//     getUsers,
//     deleteUser,
//     updateUser,
//     toggleFollow,
//     getUserStory
// }