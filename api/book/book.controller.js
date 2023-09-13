import bookService from './book.service.js';
import logger from '../../services/logger.service.js';
import { getByUsername } from '../user/user.service.js';

// Note in use
export async function getBookById(req, res) {
  try {
    const { bookId, shelfId } = req.params
    const book = await bookService.getById(bookId, shelfId)

    res.json(book)
  } catch (err) {
    logger.error('Failed to get book', err)
    res.status(500).send({ err: 'Failed to get book' })
  }
}

export async function addBook(req, res) {
  const { loggedinUser } = req
  if (!loggedinUser) loggedinUser = global.defaultUser
  const { shelfId } = req.params
  // TODO:  VALIDATE book FROM BODY`
  try {
    const { bookId, title, desc, link, imgUrl, createdAt } = req.body
    const book = {
      bookId, title, desc, link, imgUrl, createdAt,
    }
    const addedBook = await bookService.add(book, shelfId)
    // res.json(book)
    res.json(addedBook)
    // res.end()
  } catch (err) {
    logger.error('Failed to add book', err)
    res.status(500).send({ err: 'Failed to add book' })
  }
}

export async function updateBook(req, res) {
  try {
    const { shelfId, bookId } = req.params
    const book = req.body
    const updateBook = await bookService.update(shelfId, bookId, book)
    res.json(updateBook)
  } catch (err) {
    logger.error('Failed to update book', err)
    res.status(500).send({ err: 'Failed to update book' })

  }
}

export async function removeBook(req, res) {
  try {
    const { bookId, shelfId } = req.params
    const updatedShelf = await bookService.remove(bookId, shelfId)
    res.json(updatedShelf)
  } catch (err) {
    logger.error('Failed to remove book', err)
    res.status(401).send({ err: 'Unauthorized' })
  }
}

export async function addBookLike(req, res) {
  const { bookId, shelfId } = req.params
  let { loggedinUser } = req
  if (!loggedinUser) loggedinUser = global.defaultUser

  try {
    const updatedBook = await bookService.addBookLike(bookId, shelfId, loggedinUser)
    res.json(updatedBook)
  }
  catch (err) {
    logger.error('Failed to update book', err)
    res.status(500).send({ err: 'Failed to update book' })
  }

}

