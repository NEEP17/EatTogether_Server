const fs = require('fs');
module.exports = function(app, Room, RoomCheck, Food, Emotion)
{
    // 모든 방 데이터 불러오기
    app.get('/room', function(req,res){
       Room.find(function(err, rooms){
          if(!rooms) return res.status(404).json({error: 'room not found'});
          if(err) return res.status(500).send({error: 'database failure'});
          res.json(rooms);
       })
    });


/**
 * @swagger
 * /checkroomid:
 * tags:
 *   name: EatTogether
 *   description: roomID 중복 체크 후 입장코드 생성
 * definitions:
 *   room_request:
 *     type: object
 *     required:
 *       - count
 *     properties:
 *       count:
 *         type: Number
 *         description: 인원수
 *   room_response:
 *     type: object
 *     required:
 *       - status
 *       - roomID
 *     properties:
 *       status:
 *         type: string
 *         description: 입장코드 성공 여부- error, success
 *       roomID:
 *         type: string
 *         description: 입장코드
 *   room_Response_error:
 *     type: object
 *     required:
 *       - status
 *     properties:
 *       message:
 *         type: string
 *         description: 오류 사유
 *       status:
 *         type: integer
 *         description: response code
 */

/**
 * @swagger
 *  paths:
 *    /checkroomid:
 *      post:
 *        tags:
 *        - [EatTogether]
 *        summary: "create roomid process"
 *        description: ""
 *        consumes:
 *        - "application/json"
 *        produces:
 *        - "application/json"
 *        parameters:
 *        - in: "body"
 *          name: count
 *          description: "roomID 중복 체크 후 입장코드 생성"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/room_request"
 *        responses:
 *          200:
 *            description: "입장코드 생성 결과"
 *            schema:
 *              $ref: "#/definitions/room_response"
 *          400:
 *            description: "잘못된 데이터"
 *            schema:
 *              $ref: "#/definitions/room_Response_error"
 *          500:
 *            description: "입장코드 생성 오류 & 실패"
 *            schema:
 *              $ref: "#/definitions/room_Response_error"
 */
    // room 처음 만들 때 roomID 중복 check
    app.post('/checkroomid', function (req,res) {
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


/**
 * @swagger
 * /savedevice:
 * tags:
 *   name: EatTogether
 *   description: roomID, deviceNum 저장
 * definitions:
 *   device1_request:
 *     type: object
 *     required:
 *       - roomID
 *     properties:
 *       roomID:
 *         type: String
 *         description: 입장코드
 *   device2_request:
 *     type: object
 *     required:
 *       - deviceNum
 *     properties:
 *       deviceNum:
 *         type: String
 *         description: 디바이스 번호
 *   device_response:
 *     type: object
 *     required:
 *       - status
 *     properties:
 *       status:
 *         type: string
 *         description: 저장 성공 여부- error, success
 *   device_Response_error:
 *     type: object
 *     required:
 *       - status
 *     properties:
 *       message:
 *         type: string
 *         description: 오류 사유
 *       status:
 *         type: integer
 *         description: response code
 */

/**
 * @swagger
 *  paths:
 *    /savedevice:
 *      post:
 *        tags:
 *        - [EatTogether]
 *        summary: "save deviceNum and roomID process"
 *        description: ""
 *        consumes:
 *        - "application/json"
 *        produces:
 *        - "application/json"
 *        parameters:
 *        - in: "body"
 *          name: roomID
 *          description: "roomID 체크 "
 *          required: true
 *          schema:
 *            $ref: "#/definitions/device1_request"
 * 
 *        - in: "body"
 *          name: deviceNum
 *          description: "디바이스 번호 저장"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/device2_request"
 *        responses:
 *          200:
 *            description: "저장 성공"
 *            schema:
 *              $ref: "#/definitions/device_response"
 *          400:
 *            description: "잘못된 데이터"
 *            schema:
 *              $ref: "#/definitions/device_Response_error"
 *          500:
 *            description: "저장 오류 & 실패"
 *            schema:
 *              $ref: "#/definitions/device_Response_error"
 */

    // roomID 생성 후 다른 사람들이 들어올 때..
    // roomID, deviceNum 같이 저장
    app.post('/savedevice', function (req,res){
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
    app.put('/checkpref', function(req,res){
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


    app.post('/saveImage', function(req,res){
        var img = req.body.img;
        var buffer = new Buffer.from(img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
        fs.writeFileSync('/home/ec2-user/app/what/What_Server/emotion/aa.jpg', buffer, function(err){
            console.log(err);
        });
    });

    const {emotion} = require('../emotion/index');

    app.get('/predict', function(req, res){

        emotion();
        console.log("실행?");
    });


   // 10개 리스트 생성
}


