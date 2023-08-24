import prod from './prod.js'
var config = prod

// if (false || process.env.NODE_ENV === 'production') {
//   config = require('./dev')
// } else {
//   config = require('./prod')
// }
// config.isGuestMode = true

export default config
