import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'

import { getNotes, addNote } from './notes.controller.js'
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', requireAuth, getNotes)
router.post('/', requireAuth, addNote)



export default router