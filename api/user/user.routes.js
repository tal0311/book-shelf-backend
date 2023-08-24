import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js';
import { getUser, getUsers, deleteUser, updateUser, toggleFollow, getUserStory } from './user.controller.js';


const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers)
router.get('/:id', getUser)
router.get('/:id/story', getUserStory)
router.put('/:id', requireAuth, updateUser)
router.put('/:id/follow', requireAuth, toggleFollow)

// router.put('/:id',  requireAuth, updateUser)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

export default router