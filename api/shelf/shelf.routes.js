import express from 'express';
import { requireAuth, requireAdmin, requireOwner } from '../../middlewares/requireAuth.middleware.js';
import { log } from '../../middlewares/logger.middleware.js';
import {
 getShelves,
 getShelfById,
 addShelf,
 updateShelf,
 removeShelf,
 addShelfComment,
 addShelfLike
} from './shelf.controller.js';


const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getShelves)
router.get('/:shelfId', getShelfById)
router.post('/', requireAuth, addShelf)
router.put('/:shelfId', requireAuth, updateShelf)
// router.put('/:shelfId/comment', requireAuth, addShelfComment)
// router.put('/:shelfId/like', requireAuth, addShelfLike)
router.delete('/:shelfId', requireOwner, removeShelf)

export default router