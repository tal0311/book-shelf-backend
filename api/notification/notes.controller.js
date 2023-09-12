import notesService from './notes.service.js'
import logger from '../../services/logger.service.js'


export async function getNotes(req, res) {
  try {
    const { loggedinUser } = req
    logger.debug(loggedinUser, 'loggedinUser')


    const notes = await notesService.query(loggedinUser._id)
    res.json(notes)
    // res.end()
  } catch (err) {
    logger.error('Failed to get notes', err)
    res.status(500).send({ err: 'Failed to get notes' })
  }
}


export async function addNote(req, res) {
  const { loggedinUser } = req

  try {
    const note = req.body
    const addedNote = await notesService.add(note, loggedinUser._id)
    res.json(addedNote)
  } catch (err) {
    logger.error('Failed to add not', err)
    res.status(500).send({ err: 'Failed to add not' })
  }
}

