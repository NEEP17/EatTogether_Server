module.exports = function(app, Room, RoomCheck, Food)
{
    // 모든 방 데이터 불러오기
    app.get('/room', function(req,res){
       Room.find(function(err, rooms){
          if(!rooms) return res.status(404).json({error: 'room not found'});
          if(err) return res.status(500).send({error: 'database failure'});
          res.json(rooms);
       })
    });

    // room 처음 만들 때 roomID 중복 check
    app.post('/checkprac', function(req,res) {
        var roomcheck = new RoomCheck();
        roomcheck.count = req.body.count;

        var temp = Math.floor(Math.random() * 1000000);
        RoomCheck.find({roomID: temp}, function(err, roomchecks) {
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

    // roomID 생성 후 다른 사람들이 들어올 때..
    // roomID, deviceNum 같이 저장
    app.post('/saveDevice', function(req,res){
       var room = new Room();
       room.roomID = req.body.roomID;
       room.deviceNum = req.body.deviceNum;
        room.save(function(err) {
                if(err) {
                        console.error(err);
                        return;
                }
                return res.status(200).send('roomID:'+room.roomID);
                console.log("roomID: "+room.roomID+", deviceNum: ",room.deviceNum);
        });
    });
    
    
    // 호불호 받기 update
    app.put('/goodbad', function(req,res){
        // good
        Room.updateOne({deviceNum: req.body.deviceNum}, {good:req.body.good},function(err, rooms){
            if(err) return res.status(500).json({ error: 'database failure' });
            else if(!rooms) return res.status(404).json({ error: 'room not found' });
            else{
                console.log({message: 'good updated'});
            }
       });
        // bad
       Room.updateOne({deviceNum: req.body.deviceNum}, {bad:req.body.bad},function(err, rooms){
            if(err) return res.status(500).json({ error: 'database failure' });
            else if(!rooms) return res.status(404).json({ error: 'room not found' });
            else{
                console.log({message: 'bad updated'});
            }        
       });
        // flag=1
       Room.updateOne({deviceNum: req.body.deviceNum}, {flag:"1"},function(err, rooms){
            if(err) return res.status(500).json({ error: 'database failure' });
            else if(!rooms) return res.status(404).json({ error: 'room not found' });
            else{
                console.log({message: 'flag updated'});
            }        
       });
      
         
        
       // 10개 리스트 생성 api 호출
        var a = [{"name":"달걀볶음밥1"},{"name":"달걀볶음밥2"},{"name":"달걀볶음밥3"},{"name":"달걀볶음밥4"},{"name":"달걀볶음밥5"},{"name":"달걀볶음밥6"},{"name":"달걀볶음밥7"},{"name":"달걀볶음밥8"},{"name":"달걀볶음밥9"},{"name":"달걀볶음밥0"}]
        res.json(a);
   });
    // flag 체크
    // 디바이스가 속한 roomID 찾아서 해당 room의 flag 모두 검사


    

    
   // 10개 리스트 생성    
}


