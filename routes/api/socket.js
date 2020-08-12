const io = require('socket.io').listen(8000);
const model = require('../../models');

io.sockets.on('connection', socket => {
    
    // connection 송신
    socket.emit('connection', {
        console.log("소켓 통신 connected");
    });
    
    socket.on('createRoom', async(data) => {
        // join room
        if(data.type === 'join') {
            const roomID = data.roomID;
            const deviceNum = data.deviceNum;

            console.log('join to room -*-*-> ' + room);
            
            socket.join(roomID);

            // create room & save deviceNum, roomID
            try{
                await model.RoomCheck.findOne({
                    roomID: roomID
                }).then(async (result) =>{
                    // 방 아이디가 있으면..
                    if(result){
                        await model.Room.create({
                            roomID: roomID,
                            deviceNum : deviceNum
                        }).then((result)=>{
                             if (!result) {
                                // client에게 실패 코드 넘겨주기
                                console.log("입장 실패");
                             } else {
                                 // client에게 성공 코드 넘겨주기
                                console.log("입장 성공");
                            }
                        })
                    }else{
                        // 방이 생성되어 있지 않음을 client에게 에러 전송
                        console.log("방이 생성되어 있지 않음");
                    }
                });
            } catch(err){
                console.log(err);
            }    
        }
    });
    
    
    socket.on('preference', async(data) => {
        var good = data.good;
        var bad = data.bad;
        var deviceNum = data.deviceNum;
        var roomID = data.roomID;
        var count;
        
        // roomID에 해당하는 총 count 구하기
        await model.RoomCheck.findOne({
            roomID: roomID
        }).then(result){
            count = result[0].count;
        }
        
        // 선호도 입력 완료한 사람 리스트 선언
        socket.adapter.rooms[roomID].userList = [];
        
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
                    }).then((success)=>{
                         if (!success) {
                            // client에게 실패 코드 넘겨주기
                            console.log("선호도 저장 실패");
                         } else {
                             // client에게 성공 코드 넘겨주기
                            console.log("선호도 저장 성공");
                            // 인원 수 저장
                            socket.adapter.rooms[roomID].userList.push(deviceNum);
                             
                            // 현재 선호도 입력 한 인원수
                            var cntCurUsers = socket.adapter.rooms[roomID].userList.length();
                             
                            // 현재 대기 인원 수 넘겨주기
                            if(cntCurUsers != count){
                                socket.to(roomID).emit('currentcount', cntCurUsers);
                            }// 모든 인원이 선호도 입력 완료 시 음식 리스트 넘겨주기
                             else{
                                 // cf 이용해서 리스트 생성
                                 
                                 
                                socket.to(roomID).emit('finish', 음식 리스트);
                            }
                        }
                    })
                }else{
                    // 방이 생성되어 있지 않음을 client에게 에러 전송
                    console.log("방이 생성되어 있지 않음");
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
