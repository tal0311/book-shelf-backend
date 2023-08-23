const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { getUser, getUsers, deleteUser, updateUser, toggleFollow, toggleSaveshelf, getUserStory } = require('./user.controller')

const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers)
router.get('/:id', getUser)
router.get('/:id/story', getUserStory)
router.put('/:id', requireAuth, updateUser)
router.put('/:id/follow', requireAuth, toggleFollow)
router.put('/:id/save', requireAuth, toggleSaveshelf)

// router.put('/:id',  requireAuth, updateUser)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

module.exports = router