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
            if(results) console.log("rooms"+results[0].roomID);
        }).catch((err) => {
            console.log(err);
        });
    } catch (Error) {
        console.log(Error);
    }
};


// 방 아이디 생성 및 중복체크
exports.checkRoomID = async (req,res,next) => {
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

    var roomID;
    var totalCount; // 총 방 인원수
    
    try {
        totalCount = req.body.count;
        console.log(req.body.count);
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
                     } else {
                        console.log("저장 성공");
                    }
                })
            }
        });
    } catch(err){
        console.log(err);
    }

}

// 입장코드로 들어올 때.. deviceNum, roomID 저장
exports.create = async (deviceNum, roomID) => {
    /**
     * @swagger
     * /create:
     * tags:
     *   name: EatTogether
     *   description: roomID, deviceNum 저장
     * definitions:
     *   room:
     *     type: object
     *     required:
     *       - roomID
     *       - deviceNum
     *     properties:
     *       roomID:
     *         type: String
     *         description: 입장코드
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
     *    /create:
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
     *          name: room
     *          description: "roomID 체크 및 deviceNum 저장"
     *          required: true
     *          schema:
     *            $ref: "#/definitions/room"
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
    
    // 방 아이디 생성되어 있으면..
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



// 이미지 받아서 저장..

