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
            if(results) console.log("rooms"+results);
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
        }).then((result) =>{
            // 방 아이디 중복이면..
            if(result){
                tempRoomID = Math.floor(100000 + Math.random() * 900000);
                console.log("방 아이디 중복");
            // 방 아이디 중복 아니면..
            }else{
                model.RoomCheck.create({
                    roomID: tempRoomID,
                    count: totalCount
                }).then(async (result)=>{
                     if (!result) {
                        console.log("저장 실패");
                     } else {
                        console.log("저장 성공");
                    }
                })
            }
        });
    } catch(err){
        console.log(err);
    }

}

// 입장코드로 들어올 때.. deviceNum, roomID 저장
exports.create = async (req,res,next) => {
    var deviceNum = req.body.deviceNum;
    var roomID = req.body.roomID;
    
    // 방 아이디 생성되어 있으면..
    try{
        await model.RoomCheck.findOne({
            roomID: roomID
        }).then((result) =>{
            // 방 아이디가 있으면..
            if(result){
                model.Room.create({
                    roomID: roomID,
                    deviceNum : deviceNum
                }).then(async (result)=>{
                     if (!result) {
                        // client에게 실패 코드 넘겨주기
                        res.status(400).send("입장 실패");
                        console.log("입장 실패");
                     } else {
                         // client에게 성공 코드 넘겨주기
                        res.status(201).send("입장 성공");
                        console.log("입장 성공");
                    }
                })
            }else{
                // 방이 생성되어 있지 않음을 client에게 에러 전송
                res.status(400).send("유효하지 않은 입장코드입니다.");
            }
        });
    } catch(err){
        console.log(err);
    }    
    
}



// 이미지 받아서 저장..