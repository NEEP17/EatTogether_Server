const router = require('express').Router();
const room = require('./room');
const emotion = require('./emotion');
const socket = require('./socket.js')

router.use('/room', room);
router.use('/emotion', emotion);

module.exports = router;
