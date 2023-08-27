import express from 'express';
import { requireAuth, requireAdmin, requireOwner } from '../../middlewares/requireAuth.middleware.js';
import { scrapMetaData } from '../../services/scraping.service.js';
import { metaMiddleware } from '../../middlewares/metaMiddleware.js';
import { log } from '../../middlewares/logger.middleware.js';
import {
 getBookById,
 addBook,
 updateBook,
 removeBook,
 addBookLike
} from './book.controller.js';


const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/:shelfId/:bookId', getBookById)
router.get('/meta', metaMiddleware, scrapMetaData)
router.post('/:shelfId', requireAuth, addBook)
router.put('/:id', requireAuth, updateBook)
router.put('/:shelfId/:bookId/like', requireAuth, addBookLike)
router.delete('/:shelfId/:bookId', requireOwner, removeBook)

export default router