module.exports.countNum= function(RoomCheck, roomID){
   return RoomCheck.find({"roomID": roomID},function(err,count){
      if (err) throw err
      return count;
   })[0].count;    
}
