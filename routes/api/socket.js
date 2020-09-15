const model = require('../../models');
const fs = require('fs');
const emotionController = require('./emotion/emotion.controller');
const recommendController = require('./recommend/recommend.controller');
const rankingController = require('./ranking/ranking.controller');
const flag_success = 200;
const flag_fail = 400;
var whoisReady = {};
var whoisRank = {}; // 0
var total = {};

module.exports = ranking => {
    ranking.on('connection', socket => {
        // connection 송신
        // roomID, deviceNum 저장만 함
        // 방만들기 참여하기
        socket.on('createRoom', async(roomID, deviceNum) => {
            var roomID = roomID;
            var deviceNum = deviceNum;
            // 현재 Room에 들어있는 인원수 세기
            
            // roomID에 해당하는 총 count 구하기
            await model.RoomCheck.findOne({
                roomID: roomID
            }).then ((result) => {
                total[roomID] = result.count;
            });
            
            console.log(total);
            console.log("totalCount:"+total[roomID]);
            console.log(roomID + "deviceNum: " +deviceNum);
            
            try{
                await model.RoomCheck.findOne({
                    roomID: roomID,
                }).then(async (isRoom) =>{
                    if(isRoom) {// RoomChecks에 roomID가 만들어져 있으면..
                        await model.Room.findOne({ 
                            roomID: roomID,
                            deviceNum: deviceNum
                        }).then(async (isJoin) =>{ 
                            if(!isJoin){ // socket에 join이 안되어 있으면.. Room에 없으면..
                                // count확인하고 들어가기
                                if(total[roomID] > await model.Room.countDocuments({roomID:roomID})){
                                    await model.Room.create({
                                        roomID: roomID,
                                        deviceNum : deviceNum
                                    }).then((result)=>{ 
                                        if (!result) { // create이 실패하면..
                                            // client에게 실패 코드 넘겨주기
                                            console.log("입장 실패");
                                            ranking.to(socket.id).emit("result", flag_fail);
                                         } else { // create이 성공하면..
                                             // client에게 성공 코드 넘겨주기
                                            console.log("입장 성공");
                                            ranking.to(socket.id).emit("result", flag_success);
                                            socket.join(roomID);
                                        }
                                    });
                                }else{
                                    console.log("방이 꽉찼습니다! 참여할 수 없습니다");
                                    ranking.to(socket.id).emit("result", 401);
                                }
                            }else{ // socket에 join이 되어있으면..
                                console.log("입장 성공");
                                ranking.to(socket.id).emit("result", flag_success);
                            }
                        });            
                    }

                    else{ // RoomChecks에 roomID가 없으면..
                        // 방이 생성되어 있지 않음을 client에게 에러 전송
                        console.log("방이 생성되어 있지 않음");
                        ranking.to(socket.id).emit("result",flag_fail);
                    }
                });
            }catch(err){
                console.log("err");
            }
        });


        socket.on('preference', async(good, bad, deviceNum, roomID) => {
            var good = good;
            var bad = bad;
            var deviceNum = deviceNum;
            var roomID = roomID;
            var totalCount = total[roomID];
            
            console.log("good: "+good+" bad: "+bad+ " roomID: "+ roomID + " deviceNum: " +deviceNum);

            // 선호도 저장 및 인원 체크 후 client에게 넘겨주기
            try{
                // deviceNum이 방에 들어와 있으면..
                // db에 값이 없으면..
                // 선호도 저장
                await model.Room.updateOne(
                    { deviceNum: deviceNum },
                    { $set: { good: good , bad: bad} }
                ).then(async (success)=>{
                     if (!success) {
                        console.log("선호도 저장 실패");
                         ranking.to(socket.id).emit("error");
                     } else {
                         console.log("선호도 저장 성공");
                        // 인원 수 저장
                        //ranking.adapter.rooms[roomID].userList.push(deviceNum);
                        if(!whoisReady[roomID]){
                            whoisReady[roomID] = [deviceNum];
                        }else{
                            whoisReady[roomID].push(deviceNum); // 배열에 같은 deviceNum이 들어가지 않도록 유지보수..
                        }
                        
                        whoisReady[roomID] = whoisReady[roomID].filter( (item, idx, array) => {
                           return array.indexOf( item ) === idx ;
                        });
                         console.log("WHO IS READY");
                         console.log(whoisReady);
                         console.log("whoisReady"+whoisReady[roomID]);
                        // 현재 선호도 입력 한 인원수
                        //var cntCurUsers = ranking.adapter.rooms[roomID].userList.length();
                         var cntCurUsers = whoisReady[roomID].length;
                         console.log("cntCurUsers: "+cntCurUsers);
                        // 현재 대기 인원 수 넘겨주기
                        if(cntCurUsers !== totalCount){
                            console.log("if 문 안으로 들어옴");
                            ranking.emit('currentCount', cntCurUsers,totalCount);
                        }// 모든 인원이 선호도 입력 완료 시 음식 리스트 넘겨주기
                         else{
                            // cf 이용해서 리스트 생성
                            
                            var foodList = await new Promise((resolve, reject) => {
                                resolve(recommendController.recommend(roomID)); 
                            });
                            
                            console.log("socket!!!")
                            console.log(foodList);
                             
                            await model.RoomCheck.updateOne(
                                {"roomID" : roomID},
                                {"$set": {"foodList": foodList }} 
                            );                             
                            ranking.emit('finishPref', foodList, totalCount);
                        }
                    }
                });                
            } catch(err){
                console.log(err);
            }    
               // 호불호 받기 update
        });

        /*
        // 3초마다 predict값 평균 낸 값 받아서 db에 저장하기
        socket.on('savePredict', async(avg_predict, deviceNum, imgOrder) => {
            console.log("savePredict: "+avg_predict);
            console.log("DeviceNum: "+deviceNum);
            await model.Room.updateOne(
                {"deviceNum" : deviceNum},
                {"$push": {"pred": [avg_predict*100]}} 
            );
            
            if(imgOrder==9){
                ranking.emit('finishPred')
            }
        });
        
        
        socket.on('saveImage', async(img, deviceNum, imgOrder) => {
            var img = img;
            var deviceNum = deviceNum;
            var imgOrder = imgOrder;

            var rand = Math.floor(100 + Math.random() * 900);
            console.log("rand"+rand);

            var rand_str = rand.toString();
            console.log("rand_str"+rand_str)
            // decode
            var buffer = new Buffer.from(img, 'base64');
            console.log("dir: "+__dirname);

            var filename = '/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/'+deviceNum+'+'+imgOrder+'+'+ rand_str + '.jpg';
            console.log(filename);

            fs.writeFileSync(filename, buffer, function(err){
                console.log(err);
                if(err){
                    ranking.to(socket.id).emit("error");
                }            
            });    
        });
        */
        
        // Cient가 3초마다 event 발생하면 감정 predict
        socket.on('avgPredict', async(deviceNum, imgOrder) => {
            var deviceNum= deviceNum;
            var imgOrder = imgOrder;
            var array1 = [];
            var str = deviceNum + '_' + imgOrder;
            var pred_list = [];
            var sum = 0;

            const path = require('path');
            const directoryPath = path.join(__dirname, 'img');    


            // img list 가져오기
            var img_list = await new Promise((resolve, reject) => {
                fs.readdir(directoryPath, function (err, files) {
                    files.forEach(async (file) => {
                        if(file.indexOf(str)>=0){
                            await array1.push(file);
                        }
                    });
                    return resolve(array1);
                });
            });

            // for len(predict)
            for(var i=0; i<img_list.length; i++){
                var str_tmp = directoryPath +"/"+img_list[i];
                img_list[i] = str_tmp;
                console.log("img_list: "+img_list[i]);
                sum += Number(await emotionController.predict(img_list[i]));
            }

            // avg -> db.save
            var avg = sum/3;
            await model.Room.updateOne(
                {"deviceNum" : deviceNum},
                {"$push": {"pred": [avg]} } 
            );
            
            // 마지막 이미지까지 들어왔으면..
            if(imgOrder==9){
                ranking.emit('finishPred');
            }
        });
        
        // 지윤 위한 랭킹 소켓 간단히 완료        
        socket.on('showRank', async(roomID) => {            
            ranking.emit('finishRank', 1);            
        });
        
        socket.on('finishRank', async(roomID) => {
            var rankingList = await new Promise((resolve, reject) => {
                resolve(rankingController.rankingList(roomID)); 
            });
            console.log("rankingList:"+rankingList);
            ranking.to(roomID).emit('rankingList', rankingList);
            
            if(!whoisRank[roomID]){
                whoisRank[roomID] = 0;
            }
            whoisRank[roomID]++;
            
            console.log("WHO IS RANK");
            console.log(whoisRank);
            
            if(whoisRank[roomID]==total[roomID]){
                await model.RoomCheck.deleteOne({
                    roomID: roomID,
                });
                // 오류나면 deviceNum 받아서 deleteOne으로 삭제하기
                await model.Room.deleteMany({
                    roomID: roomID,
                });
            }
            
            delete whoisRank[roomID];
            delete whoisReady[roomID];
            delete total[roomID];
            
            socket.leave()
        });
    });
}

