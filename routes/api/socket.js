const model = require('../../models');
const fs = require('fs');
const emotionController = require('./emotion/emotion.controller');
const flag_success = 200;
const flag_fail = 400;

module.exports = ranking => { 
    ranking.on('connection', socket => {

        // connection 송신
        //ranking.emit('connection', "소켓 통신 connected");

        var whoisReady = [];
        
        // roomID, deviceNum 저장만 함
        socket.on('createRoom', async(roomID, deviceNum) => {
            var roomID = roomID;
            var deviceNum = deviceNum;
            
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
                                await model.Room.create({
                                    roomID: roomID,
                                    deviceNum : deviceNum
                                }).then((result)=>{ 
                                    if (!result) { // create이 실패하면..
                                        // client에게 실패 코드 넘겨주기
                                        console.log("입장 실패");
                                        ranking.to(socket.id).emit("result",flag_fail);
                                     } else { // create이 성공하면..
                                         // client에게 성공 코드 넘겨주기
                                        console.log("입장 성공");
                                        ranking.to(socket.id).emit("result", flag_success);
                                        socket.join(roomID);
                                    }
                                });
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
            var totalCount;
            
            console.log("good: "+good+" bad: "+bad+ " roomID: "+ roomID + " deviceNum: " +deviceNum);
            
            // roomID에 해당하는 총 count 구하기
            await model.RoomCheck.findOne({
                roomID: roomID
            }).then ((result) => {
                totalCount = result.count;
            });
            console.log("totalCount: "+totalCount);

            //var manager = ranking.adapter ? { 
            //    rooms : ranking.adapter.rooms,  
            //    clients : ranking.adapter.sids  } : {  rooms : ranking.manager.roomClients, clients : ranking.manager.rooms };

            
            //var userList = [];
            
            // 선호도 저장 및 인원 체크 후 client에게 넘겨주기
            try{
                // deviceNum이 방에 들어와 있으면..
                
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
                         whoisReady.push(deviceNum); // 배열에 같은 deviceNum이 들어가지 않도록 유지보수..

                        // 현재 선호도 입력 한 인원수
                        //var cntCurUsers = ranking.adapter.rooms[roomID].userList.length();
                         var cntCurUsers = whoisReady.length;
                         console.log("cntCurUsers: "+cntCurUsers);
                        // 현재 대기 인원 수 넘겨주기
                        if(cntCurUsers !== 1){
                            console.log("if 문 안으로 들어옴");
                            ranking.emit('currentCount', cntCurUsers,totalCount);
                        }// 모든 인원이 선호도 입력 완료 시 음식 리스트 넘겨주기
                         else{
                             // cf 이용해서 리스트 생성
                             var foodList = [];
                                var tmp = 0;
                                while(true){
                                    try{
                                        await model.Food.count({}).then(async (count) => {
                                            if(count) {
                                                var random = Math.floor(Math.random() * count)
                                                console.log(count);
                                                await model.Food.findOne({}).skip(random).then(async(result)=> {
                                                    foodList.push(await result);
                                                    tmp += 1;
                                                    console.log(tmp);
                                                });
                                            }
                                        }).catch((err) => {
                                            console.log(err);
                                        });
                                    } catch (Error) {
                                        console.log(Error);
                                        ranking.to(socket.id).emit("error");
                                    }
                                    if(tmp===10){
                                        break;
                                    } 
                                }
                                console.log(foodList);
                                 await model.RoomCheck.updateOne(
                                    {"roomID" : roomID},
                                    {"$set": {"foodList": foodList }} 
                                );                             
                            ranking.emit('finishPref', foodList);
                        }
                    }
                });                
            } catch(err){
                console.log(err);
            }    
               // 호불호 받기 update
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

        
        // Cient가 3초마다 event 발생하면 감정 predict
        socket.on('avgPredict', async(deviceNum, imgOrder) => {
            var deviceNum= deviceNum;
            var imgOrder = imgOrder;
            var array1 = [];
            var str = deviceNum + '+' + imgOrder;
            var pred_list = [];
            var sum = 0;

            const path = require('path');
            const directoryPath = path.join(__dirname, 'img');    


            // img list 가져오기

            const img_list = await new Promise((resolve, reject) => {
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
                ranking.emit('finishPred')
            }
        });
        
        // 지윤 위한 랭킹 소켓 간단히 완료        
        socket.on('showRank', async(roomID) => {            
            // 랭킹 알고리즘
            var roomID = roomID;
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
                ((avg[i][1]==1) ? firstArray.push(avg[i]) : secondArray.push(avg[i]));    
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
                rankingList.push(foodList[array[i][2]]);
            }
            
            ranking.emit('finishRank', rankingList);
            console.log("rankingList:"+rankingList);
        });
        
    });
}

