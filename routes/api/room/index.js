const router = require('express').Router();
const controller = require('./room.controller');
var multer  = require('multer');
//var upload = multer({ dest: '/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img' });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var { roomID } = req.body;
    console.log("roomID"+roomID);
    var dir = `/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/${roomID}`
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })
/* ROUTING METHOD */
// 방 목록
router.post('/list', upload.single('img'), controller.room);

// 간이 api
router.post('/test', controller.test);

// 방 아이디 생성 및 중복체크
router.post('/checkroomid',controller.checkRoomID);
module.exports = router;

