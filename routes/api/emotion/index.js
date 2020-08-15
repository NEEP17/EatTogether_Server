const router = require('express').Router();
const controller = require('./emotion.controller');

/* ROUTING METHOD */
// 이미지 저장
router.post('/saveimage',controller.saveimage);

router.post('/avgpredict',controller.avgpredict);

module.exports = router;

