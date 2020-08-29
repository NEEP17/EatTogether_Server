const router = require('express').Router();
const room = require('./room');
const socket = require('./socket.js')

router.use('/room', room);

module.exports = router;
