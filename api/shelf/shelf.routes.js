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
router.get('/:id', getShelfById)
router.post('/', requireAuth, addShelf)
router.put('/:id', requireAuth, updateShelf)
// router.put('/:id/comment', requireAuth, addShelfComment)
// router.put('/:id/like', requireAuth, addShelfLike)
router.delete('/:id', requireOwner, removeShelf)

export default router