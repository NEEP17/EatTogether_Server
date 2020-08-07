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


// 방생성 및 방 아이디 중복체크
exports.create = async (req,res,next) => {
    var roomID;
    var totalCount; // 총 방 인원수
    
    try {
        totalCount = req.body.count;
    } catch (err) {
        console.log(err);
    }
    
    var tempRoomID = Math.floor(Math.random() * 1000000);
    try{
        await model.RoomCheck.findOne({
            roomID: tempRoomID
        }).then((result) =>{
            if(result){
                tempRoomID = Math.floor(Math.random() * 1000000);
                console.log("방 아이디 중복");
            }else{

                model.Room.create({
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
    }catch(err){
        console.log(err);
    }
    
    
}

 app.post('/checkroomid', function (req,res) {
       
        // count 예외처리하기
        // count 값 없을 때. 1~10명 까지만.
        roomcheck.count = req.body.count;

        var temp = Math.floor(Math.random() * 1000000);
        await model.RoomCheck.find({roomID: temp}, function(err, roomchecks) {
            if(err) return res.status(500).json({error: err});
            // roomID 중복 안되면..
            // roomID, count 저장
            if(roomchecks.length === 0){
                roomcheck.roomID = temp;
                roomcheck.save(function(err) {
                    if(err) {
                        console.error(err);
                        res.json({result:0});
                        return;
                    }

                    res.json(roomcheck.roomID);
                    console.log("count"+roomcheck.count);
                });

           }else{
             console.log("이미 있는 방번호입니다.");
           }

        });

    });