const router = require('express').Router();
const controller = require('./room.controller');

/* ROUTING METHOD */
// 방 목록
router.get('/list',controller.room);

// 방 생성
router.post('/create',controller.create);

// 방 아이디 생성 및 중복체크
router.post('/checkroomid',controller.checkRoomID);

module.exports = router;
