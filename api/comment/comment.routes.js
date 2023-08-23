import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js';
import { log } from '../../middlewares/logger.middleware.js';
import { addComment, getComments, deleteComment } from './comment.controller.js';

const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getComments)
router.post('/', log, requireAuth, addComment)
router.delete('/:id', requireAuth, deleteComment)

export default router