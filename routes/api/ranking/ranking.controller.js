const model = require('../../../models');

module.exports.rankingList = async (roomID) => {
    // 랭킹 알고리즘
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
    
    console.log("foodListranking");
    console.log(foodList);
    
    await model.Room.find({roomID: roomID}).cursor().eachAsync(async (doc) =>{
        console.log("doc"+doc);
        for(var i = 0; i < 10; i++){
            if(doc.pred[i] < 40){
                flag = 2;
            }else{
                flag = 1;
            }  

            avg[i][0] += (doc.pred[i] / totalCount);
            avg[i][1] = flag;
            avg[i][2] = i;
            console.log("avg[i][0]"+avg[i][0])
        }

    });
    
    for(var i = 0; i < avg.length; i++){
        ((avg[i][1]==1) ? firstArray.push(avg[i]) : secondArray.push(avg[i]));    
    }

    firstArray.sort(sortFunction);
    secondArray.sort(sortFunction);
    
    console.log("firstArray:"+firstArray);
    console.log("secondArray"+secondArray);
    
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
    
    console.log(rankingList[0]);
    console.log(rankingList[1]);
    console.log(rankingList[2]);
    return rankingList;

};

