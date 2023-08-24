import authService from '../api/auth/auth.service.js';
import asyncLocalStorage from '../services/als.service.js';
import logger from './../services/logger.service.js';

// TODO: SET BETTER LOGIC HERE TO SUPPORT OTHER COOKIES
async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    if (!req.cookies.loginToken) return next()
    const loggedinUser = authService.validateToken(req.cookies.loginToken)

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.loggedinUser = loggedinUser
    }
    next()
  })
}

export default setupAsyncLocalStorage

