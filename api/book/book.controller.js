import bookService from './book.service.js';
import logger from '../../services/logger.service.js';
import { getByUsername } from '../user/user.service.js';

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
  const { loggedinUser, shelfId } = req
  // TODO:  VALIDATE book FROM BODY`
  try {
    const book = req.body
    const addedBook = await bookService.add(book, shelfId)
    res.json(addedBook)
    // res.end()
  } catch (err) {
    logger.error('Failed to add book', err)
    res.status(500).send({ err: 'Failed to add book' })
  }
}

export async function updateBook(req, res) {
  try {
    const book = req.body
    const updateBook = await bookService.update(book)
    res.json(updateBook)
  } catch (err) {
    logger.error('Failed to update book', err)
    res.status(500).send({ err: 'Failed to update book' })

  }
}

export async function removeBook(req, res) {
  try {
    const { bookId, shelfId } = req.params.id
    const removedId = await bookService.remove(bookId, shelfId)
    res.send(removedId)
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

