import shelfService from './shelf.service.js';
import logger from '../../services/logger.service.js';
import { getByUsername } from '../user/user.service.js';


export async function getShelves(req, res) {
  try {
    // logger.info('Getting shelves')
    // // get filter from query params
    // const filterBy = {
    //   txt: req.query?.txt || '',
    // }
    const shelves = await shelfService.query()
    res.json(shelves)
    // res.json('get Shelves')
  } catch (err) {
    logger.error('Failed to get shelves', err)
    res.status(500).send({ err: 'Failed to get shelves' })
  }
}

export async function getShelfById(req, res) {
  try {
    const {id:shelfId} = req.params
    const shelf = await shelfService.getById(shelfId)

    res.json(shelf)
    // res.json(shelfId)
  } catch (err) {
    logger.error('Failed to get shelf', err)
    res.status(500).send({ err: 'Failed to get shelf' })
  }
}

export async function addShelf(req, res) {


  const { loggedinUser } = req
  // TODO:  VALIDATE shelf FROM BODY
  try {

    const { _id} = loggedinUser
    
    const {title, desc, createdAt, imgUrl , ownerId, books} = req.body
    const shelf = {
      title,
      desc,
      createdAt,
      imgUrl: imgUrl || './../../assets/NoPicture.png',
      books,
      ownerId : _id
    }
    const addedShelf = await shelfService.add(shelf)
    // res.json(addedShelf)
    res.json(shelf)
    // res.end()
  } catch (err) {
    logger.error('Failed to add shelf', err)
    res.status(500).send({ err: 'Failed to add shelf' })
  }
}

export async function updateShelf(req, res) {
  try {
    const shelf = req.body
    const updatedshelf = await shelfService.update(shelf)
    res.json(updatedshelf)
  } catch (err) {
    logger.error('Failed to update shelf', err)
    res.status(500).send({ err: 'Failed to update shelf' })

  }
}

export async function removeShelf(req, res) {
  try {
    const shelfId = req.params.id
    const removedId = await shelfService.remove(shelfId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove shelf', err)
    res.status(401).send({ err: 'Unauthorized' })

  }
}

export async function addShelfComment(req, res) {
  const { loggedinUser } = req

  try {
    const shelfId = req.params.id
    const { txt } = req.body
    const comment = {
      txt,
      by: loggedinUser
    }


    const updatedshelf = await shelfService.addshelfComment(shelfId, comment)
    res.json(updatedshelf)

  } catch (err) {
    logger.error('Failed to update shelf', err)
    res.status(500).send({ err: 'Failed to update shelf' })

  }
}

export async function addShelfLike(req, res) {
  const { id: shelfId } = req.params
  let { loggedinUser } = req
  if (!loggedinUser) loggedinUser = global.defaultUser

  try {
    const updatedshelf = await shelfService.addshelfLike(shelfId, loggedinUser)
    res.json(updatedshelf)
  }
  catch (err) {
    logger.error('Failed to update shelf', err)
    res.status(500).send({ err: 'Failed to update shelf' })
  }

}


// export default {
//   getShelves,
//   getShelfById,
//   addShelf,
//   updateShelf,
//   removeShelf,
//   addShelfComment,
//   addShelfLike
// }
