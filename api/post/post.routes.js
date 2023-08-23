const express = require('express')
const { requireAuth, requireAdmin, requireOwner } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getshelfs, getshelfById, addshelf, updateshelf, removeshelf, addshelfComment, addshelfLike } = require('./shelf.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getshelfs)
router.get('/:id', getshelfById)
router.post('/', requireAuth, addshelf)
router.put('/:id', requireAuth, updateshelf)
router.put('/:id/comment', requireAuth, addshelfComment)
router.put('/:id/like', addshelfLike)
router.delete('/:id', requireOwner, removeshelf)
// router.delete('/:id', requireAuth, requireAdmin, removeshelf)

// router.shelf('/:id/msg', requireAuth, addshelfComment)
// router.delete('/:id/msg/:msgId', requireAuth, removeshelfMsg)

module.exports = router