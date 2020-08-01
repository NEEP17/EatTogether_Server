module.exports.countflag= function(Room, RoomCheck, roomID){
    // flag count
   Room.find({"roomID": roomID, "flag":"1"},function(err,room){
      if (err) throw err
      return room;
   }).count();    
    
    // roomID 설정인원(count)
    var a = RoomCheck.find({"roomID": roomID},function(err,count){
      if (err) throw err
      return count;
   });  
    console.log("var a: "+ a);
    return a[0].count;
}
