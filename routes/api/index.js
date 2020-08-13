const router = require('express').Router();
const room = require('./room');
const socket = require('./socket.js')

router.use('/room', room);
//router.use('/ranking', socket.ranking)
module.exports = router;
