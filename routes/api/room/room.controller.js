const model = require('../../../models');
const rController = require('../recommend/recommend.controller');

exports.room = async (req,res,next) => {
        await model.RoomCheck.findOne({
            roomID: "835197"
        }).then ((result) => {
            console.log(result);
            count = result.count;
        });
        console.log(count);
};

exports.foodList = async(req,res,next) => {
    // DB -> goods, bads list 뽑기
    var roomID = req.body.roomID;
    var goodList = [];
    var badList = [];    
    var randomList = [];
    var cbfList = [];
    
    await model.Room.find({roomID: roomID}).cursor().eachAsync(async (doc) => {
        goodList.push(doc.good);
        badList.push(doc.bad);
    });
    // goods 에서 bads 에 있는 애들 제외하기 + 중복제거
    var difference = goodList.filter(x => !badList.includes(x));
    
    difference = difference.filter( (item, idx, array) => {
	               return array.indexOf( item ) === idx ;
                });
    
    var foodList = difference.slice();
    
    // CBF 추천 알고리즘
    for(var i=0; i<difference.length; i++){
        var n = 0;
        var item;
        var flag = true;
        
        while(flag){
            item = await rController.recommend(difference[i],n);
            if(foodList.includes(item[0])){
                n++;
            }else{
                flag = false;
            }
        }
        cbfList.push(item[0]);
        foodList.push(item[0]);        
    }
    
    // random list
    var cntRandom = 10 - difference.length * 2;
    
    if(cntRandom >= 0){
        for(var i=0; i<cntRandom; i++){
            var random = 0;
            var flag = true;
            var item;
            
            while(flag){
                await model.Food.countDocuments({}).then(async (count) => {
                    if(count) {
                        var random = Math.floor(Math.random() * count);

                        await model.Food.findOne({}).skip(random).then(async(doc)=> {
                            item = doc.name;
                            console.log("name: "+item);
                            if(!foodList.includes(item)){
                                flag = false;
                            }
                        });
                    }
                });
            }
            foodList.push(item);
        }
    }else{
        // 추천 리스트 중 cbfNum 개수 만큼 random 뽑기
        var cbfNum = 10 - difference.length;
        var length = cbfList.length;

        while (length) {
            var index = Math.floor((length--) * Math.random());
            var temp = cbfList[length];
            
            cbfList[length] = cbfList[index];
            cbfList[index] = temp;
        }
        
        for(var i=0; i<cbfNum; i++){
            difference.push(cbfList[i]);
        }
        foodList = difference.slice();
    }
    console.log(foodList);
    
    // DB에서 foodList name에 해당하는 documents list emit.
    var finalFoodList = [];
    for(var i=0; i<foodList.length; i++){
        var name = foodList[i];
        await model.Food.findOne({name : name}).then(async(doc)=> {
            finalFoodList.push(doc);
        });
    }
    console.log(finalFoodList);
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
