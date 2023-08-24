import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import config from './config/index.js';



const app = express()
const http = require('http').createServer(app)


// Express App Config
app.use(cookieParser())
app.use(express.json())


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    app.use(cors(config.corsOptions))
}

global.defaultUser = {
    _id: '643d2a0f99553dc5ce88b861', username: 'tal.amit', imgUrl: 'https://res.cloudinary.com/tal-amit-dev/image/upload/v1679772900/Instagram/WhatsApp_Image_2023-03-25_at_22.22.51_1_va5b7q.jpg', fullname: 'Tal Amit',
}


import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/user/user.routes.js';
import shelfRoutes from './api/shelf/shelf.routes.js';
// import notesRoutes from './api/notification/notes.routes.js';
// import msgRoutes from './api/msg/msg.routes.js';
// import { setupSocketAPI } from './services/socket.service.js';


// routes
import setupAsyncLocalStorage from './middlewares/setupAls.middleware.js';

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/shelf', shelfRoutes)
// app.use('/api/note', notesRoutes)
// app.use('/api/msg', msgRoutes)
setupSocketAPI(http)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/shelf/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


import logger from './services/logger.service';

const port = process.env.PORT || 3030
http.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})