const shelfService = require('./shelf.service.js')
const logger = require('../../services/logger.service.js')
const { getByUsername } = require('../user/user.service.js')

async function getshelfs(req, res) {
  try {
    logger.info('Getting shelfs')
    const filterBy = {
      txt: req.query.txt || '',
      userFilter: req.query.userFilter || '',
      userId: req.query.userId || ''
    }
    const shelfs = await shelfService.query(filterBy)
    res.json(shelfs)
  } catch (err) {
    logger.error('Failed to get shelfs', err)
    res.status(500).send({ err: 'Failed to get shelfs' })
  }
}

async function getshelfById(req, res) {
  try {
    const shelfId = req.params.id
    const shelf = await shelfService.getById(shelfId)

    res.json(shelf)
  } catch (err) {
    logger.error('Failed to get shelf', err)
    res.status(500).send({ err: 'Failed to get shelf' })
  }
}

async function addshelf(req, res) {


  const { loggedinUser } = req
  // TODO:  VALIDATE shelf FROM BODY
  try {

    const { _id, username, imgUrl, fullname } = loggedinUser
    const by = {
      _id,
      username,
      imgUrl,
      fullname
    }
    const shelf = req.body
    shelf.by = by
    const addedshelf = await shelfService.add(shelf)
    res.json(addedshelf)
    // res.end()
  } catch (err) {
    logger.error('Failed to add shelf', err)
    res.status(500).send({ err: 'Failed to add shelf' })
  }
}

async function updateshelf(req, res) {
  try {
    const shelf = req.body
    const updatedshelf = await shelfService.update(shelf)
    res.json(updatedshelf)
  } catch (err) {
    logger.error('Failed to update shelf', err)
    res.status(500).send({ err: 'Failed to update shelf' })

  }
}

async function removeshelf(req, res) {
  try {
    const shelfId = req.params.id
    const removedId = await shelfService.remove(shelfId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove shelf', err)
    res.status(401).send({ err: 'Unauthorized' })

  }
}

async function addshelfComment(req, res) {
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

async function addshelfLike(req, res) {
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


module.exports = {
  getshelfs,
  getshelfById,
  addshelf,
  updateshelf,
  removeshelf,
  addshelfComment,
  addshelfLike
}
