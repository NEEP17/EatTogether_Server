const router = require('express').Router();
const controller = require('./room.controller');

/* ROUTING METHOD */
// 방 목록
router.get('/list',controller.room);

// 방 생성
router.post('/create',controller.create);
router.post('/checkroomid',controller.checkroomid);

module.exports = router;
