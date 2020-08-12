const model = require('../../../models');

exports.room = async (req,res,next) => {
    var food_list = [];
    var tmp = 0;
    while(true){
        try{
            await model.Food.count({}).then(async (count) => {
                if(count) {
                    var random = Math.floor(Math.random() * count)
                    console.log(count);
                    await model.Food.findOne({}).skip(random).then(async(result)=> {
                        food_list.push(await result);
                        tmp += 1;
                        console.log(tmp);
                    });
                }
            }).catch((err) => {
                console.log(err);
            });
        } catch (Error) {
            console.log(Error);
        }
        if(tmp===10){
            break;
        } 
    }
    console.log(food_list);
    
};


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



// 이미지 받아서 저장..


