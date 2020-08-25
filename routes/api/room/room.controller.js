const model = require('../../../models');

exports.room = async (req,res,next) => {
        await model.RoomCheck.findOne({
            roomID: "835197"
        }).then ((result) => {
            console.log(result);
            count = result.count;
        });
        console.log(count);
};

exports.rank = async (req,res,next) => {
    var roomID = req.body.roomID;
    var foodList;
    var pred;
    var totalCount;
    var flag;
    var firstArray = [];
    var secondArray = [];
    var avg = Array.from(Array(10), () => Array(3).fill(0));
    var rankingList = [];
    
    // roomID에 해당하는 총 count 구하기
    await model.RoomCheck.findOne({
        roomID: roomID
    }).then ((result) => {
        foodList = result.foodList;
        totalCount = result.count;
    });
    
    await model.Room.find({roomID: roomID}).cursor().eachAsync(async (doc) =>{
        for(var i = 0; i < 10; i++){
            if(doc.pred[i] < 40){
                flag = 2;
            }else{
                flag = 1;
            }  
            
            avg[i][0] += (doc.pred[i] / totalCount);
            avg[i][1] = flag;
            avg[i][2] = i;
        }
        
    });
    
    for(var i = 0; i < avg.length; i++){
        ((avg[i][1]==1) ? firstArray.push(avg[i]) :     secondArray.push(avg[i]));    
    }
    
    firstArray.sort(sortFunction);
    secondArray.sort(sortFunction);
    
    var array = firstArray.concat(secondArray);
    
    function sortFunction(a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] < b[0]) ? 1 : -1;
        }
    }
    
    
    for(var i=0; i<10; i++){
        rankingList.push(JSON.stringify(foodList[array[i][2]]));
    }
    
    console.log("firstArray: "+array);
    console.log("rankingList: "+rankingList);

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


