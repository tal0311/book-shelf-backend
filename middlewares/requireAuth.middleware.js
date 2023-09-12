import authService from '../api/auth/auth.service.js';
import logger from '../services/logger.service.js';
import config from '../config/index.js';
import asyncLocalStorage from '../services/als.service.js';
import shelfService from '../api/shelf/shelf.service.js';


export function requireAuth(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  console.log('loggedinUser', loggedinUser);
  logger.debug('MIDDLEWARE', loggedinUser)

  // TODO: support gust mode
  // if (config.isGuestMode && !loggedinUser) {
  //   req.loggedinUser = { _id: '', fullname: 'Guest' }
  //   return next()
  // }
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  req.loggedinUser = loggedinUser
  next()
}

export function requireAdmin(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  if (!loggedinUser.isAdmin) {
    logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}

export async function requireOwner(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  const shelf = await shelfService.getById(req.params.id)
  if (loggedinUser._id !== shelf.ownerId) {
    logger.warn(loggedinUser.fullname + 'attempted to perform owner action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}


// module.exports = requireAuth

// export default {
//   requireAuth,
//   requireAdmin,
//   requireOwner
// }
