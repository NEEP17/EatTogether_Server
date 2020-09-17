const model = require('../../../models');
const fs = require('fs');

exports.room = async (req,res,next) => {
    console.log("IMAGE1");
    var img = req.file;
    var deviceNum = req.body.deviceNum;
    var imgOrder = req.body.imgOrder;
    console.log(deviceNum + imgOrder);
    console.log("IMAGE2");
    console.log(img);
    res.json({
	"status" : 200,
	"success": true,
	"message": "이미지 저장 완료"
    });
};

exports.test = async (req,res,next) => {
    var deviceNum = req.body.deviceNum;
    // delete file
    var directoryPath = '/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img';
    console.log("test");
    
    fs.access(directoryPath, fs.constants.F_OK, (err) => { // A
      if (err) return console.log('삭제할 수 없는 파일입니다');

      fs.unlink(directoryPath, (err) => err ?  
        console.log(err) : console.log(`${filePath} 를 정상적으로 삭제했습니다`));
    });
    
}

// 방 아이디 생성 및 중복체크
exports.checkRoomID = async (req,res,next) => {
    var roomID;
    var totalCount; // 총 방 인원수
    
    try {
        totalCount = req.body.count;
        console.log(req.body.count);
        if(totalCount>10){
            res.json({
                "status": 400,
                "success" : false,
                "message": "참여 인원 수가 10명 초과입니다."
            });
        }
    } catch (err) {
        console.log(err);
    }
    
    var tempRoomID = Math.floor(100000 + Math.random() * 900000);
    try{
        await model.RoomCheck.findOne({
            roomID: tempRoomID
        }).then(async (result) =>{
            // 방 아이디 중복이면..
            if(result){
                tempRoomID = Math.floor(100000 + Math.random() * 900000);
                console.log("방 아이디 중복");
            // 방 아이디 중복 아니면..
            }else{
                await model.RoomCheck.create({
                    roomID: tempRoomID,
                    count: totalCount
                }).then((result)=>{
                     if (!result) {
                        console.log("저장 실패");
                        res.json({
                            "status": 500,
                            "success" : false,
                            "message": "DB 저장에 실패했습니다."
                        });
                     } else {
                        console.log("저장 성공");
                        res.json({
                            "status": 200,
                            "success" : true,
                            "message": "입장코드 생성 success",
                            "data" : {"roomID" : tempRoomID }
                        });
                    }
                })
            }
        });
    } catch(err){
        console.log(err);
    }

};
