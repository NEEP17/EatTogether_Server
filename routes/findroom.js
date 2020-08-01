module.exports.findroom = function(Room, device){
   return Room.find({"deviceNum": device},function(err,room){
      if (err) throw err
      return room;
   });
}
