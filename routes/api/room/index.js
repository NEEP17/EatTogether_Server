const router = require('express').Router();
const controller = require('./room.controller');

/* ROUTING METHOD */
//방 목록
router.get('/list',controller.room);

module.exports = router;