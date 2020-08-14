const model = require('../../models');
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
            var count;
            
            console.log("good: "+good+" bad: "+bad+ " roomID: "+ roomID + " deviceNum: " +deviceNum);
            
            // roomID에 해당하는 총 count 구하기
            await model.RoomCheck.findOne({
                roomID: roomID
            }).then ((result) => {
                count = result.count;
            });
            console.log("count: "+count);

            //var manager = ranking.adapter ? { 
            //    rooms : ranking.adapter.rooms,  
            //    clients : ranking.adapter.sids  } : {  rooms : ranking.manager.roomClients, clients : ranking.manager.rooms };

            
            //var userList = [];
            
            // 선호도 저장 및 인원 체크 후 client에게 넘겨주기
            try{
                await model.Room.findOne({
                    deviceNum: deviceNum
                }).then(async (result) =>{
                    // 방 아이디가 있으면..
                    if(result){
                        // 선호도 저장
                        await model.Room.update({
                            good: good,
                            bad: bad
                        }).then(async (success)=>{
                             if (!success) {
                                console.log("선호도 저장 실패");
                                 ranking.to(socket.id).emit("error");
                             } else {
                                 console.log("선호도 저장 성공");
                                // 인원 수 저장
                                //ranking.adapter.rooms[roomID].userList.push(deviceNum);
                                 whoisReady.push(deviceNum);

                                // 현재 선호도 입력 한 인원수
                                //var cntCurUsers = ranking.adapter.rooms[roomID].userList.length();
                                 var cntCurUsers = whoisReady.length;
                                 console.log("cntCurUsers: "+cntCurUsers);
                                // 현재 대기 인원 수 넘겨주기
                                if(cntCurUsers !== count){
                                    console.log("if 문 안으로 들어옴");
                                    ranking.emit('currentCount', cntCurUsers);
                                }// 모든 인원이 선호도 입력 완료 시 음식 리스트 넘겨주기
                                 else{
                                     // cf 이용해서 리스트 생성
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
                                                ranking.to(socket.id).emit("error");
                                            }
                                            if(tmp===10){
                                                break;
                                            } 
                                        }
                                        console.log(food_list);
                                    ranking.emit('finishPref', food_list);
                                }
                            }
                        })
                    }else{
                        // 방이 생성되어 있지 않음을 client에게 에러 전송
                        console.log("방이 생성되어 있지 않음");
                        ranking.to(socket.id).emit("error");
                    }
                });
            } catch(err){
                console.log(err);
            }    
               // 호불호 받기 update
        });

        /*
        socket.on('wait', data => {
            controller.writeMessage(data.good, data.bad);
            console.log("save good, bad menu");
            socket.to(room).emit('changeTopic', data);
        });

        */

        /*
        socket.on('disconnect', data => {
            console.log('disconnect from room: ', socket.room);
            rooms_users[socket.room].pop();

            // if nobody remain
            if (rooms_users[socket.room].length === 0) {
                controller.endLogging(socket.room);
            }
        });
        */
    });
}

