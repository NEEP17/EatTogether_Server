const router = require('express').Router();
const room = require('./room');

router.use('/room', room);

module.exports = router;