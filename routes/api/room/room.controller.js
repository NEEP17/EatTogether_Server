const model = require('../../../models');

exports.room = async (req,res,next) => {
    var roomID;
    var deviceNum;
    var good;
    var bad;
    var pred;
    var flag;
    
    try{
        await model.Room.find({}).then((results) => {
            if(results) console.log("rooms"+results[0].roomID);
        }).catch((err) => {
            console.log(err);
        });
    } catch (Error) {
        console.log(Error);
    }
};


// 방 아이디 생성 및 중복체크
exports.checkRoomID = async (req,res,next) => {
    var roomID;
    var totalCount; // 총 방 인원수
    
    try {
        totalCount = req.body.count;
        console.log(req.body.count);
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



// 이미지 받아서 저장..


