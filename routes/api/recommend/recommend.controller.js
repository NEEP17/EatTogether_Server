module.exports.cbfRecommend= async function (food_name, n){
    const { PythonShell } = require("python-shell");
    //var food_name = '크림스프';
    //var n = 1;
    let options = {
        mode: 'text',
        pythonPath: "/usr/bin/python3",
        scriptPath: "/home/ec2-user/app/what/EatTogether_Server/routes/api/recommend",
        pythonOptions: ['-u'],
        args: [food_name, n]
    };

    const result = await new Promise((resolve, reject) => {
        PythonShell.run('contents-based-filtering.py', options, function(err, data) {
            if (err) return reject(err);
            resolve(data);
            //console.log('contents-based-filtering: '+ data);
        });
    });

    console.log("result: "+result);
    return result;
}

module.exports.recommend = async function(roomID){
    const model = require('../../../models');
    const rec = require('./recommend.controller')
    
    // DB -> goods, bads list 뽑기
    var goodList = [];
    var badList = [];    
    var randomList = [];
    var cbfList = [];
    var finalFoodList = [];
    
    await model.Room.find({roomID: roomID}).cursor().eachAsync(async (doc) => {
        goodList.push(doc.good);
        badList.push(doc.bad);
    });
    // goods 에서 bads 에 있는 애들 제외하기 + 중복제거
    var difference = goodList.filter(x => !badList.includes(x));
    
    difference = difference.filter( (item, idx, array) => {
	               return array.indexOf( item ) === idx ;
                });
    
    var foodList = difference.slice();
    
    console.log("difference: "+difference)
    console.log("foodList: "+foodList)
    // CBF 추천 알고리즘
    for(var i=0; i<difference.length; i++){
        var n = 0;
        var item;
        var flag = true;
        
        while(flag){
            item = await rec.cbfRecommend(difference[i],n);
            if(foodList.includes(item[0])){
                n++;
            }else{
                flag = false;
            }
        }
        cbfList.push(item[0]);
        foodList.push(item[0]);        
    }
    
    // random list
    var cntRandom = 10 - difference.length * 2;
    
    if(cntRandom >= 0){
        for(var i=0; i<cntRandom; i++){
            var random = 0;
            var flag = true;
            var item;
            
            while(flag){
                await model.Food.countDocuments({}).then(async (count) => {
                    if(count) {
                        var random = Math.floor(Math.random() * count);

                        await model.Food.findOne({}).skip(random).then(async(doc)=> {
                            item = doc.name;
                            console.log("name: "+item);
                            if(!foodList.includes(item)){
                                flag = false;
                            }
                        });
                    }
                });
            }
            foodList.push(item);
        }
        //finalFoodList = foodList.slice();
    }else{
        // 추천 리스트 중 cbfNum 개수 만큼 random 뽑기
        var cbfNum = 10 - difference.length;
        var length = cbfList.length;

        while (length) {
            var index = Math.floor((length--) * Math.random());
            var temp = cbfList[length];
            
            cbfList[length] = cbfList[index];
            cbfList[index] = temp;
        }
        
        for(var i=0; i<cbfNum; i++){
            difference.push(cbfList[i]);
        }
        foodList = difference.slice();
    }
    console.log("recommend:"+foodList);
    
    // DB에서 foodList name에 해당하는 documents list emit.
    
    for(var i=0; i<foodList.length; i++){
        var name = foodList[i];
        await model.Food.findOne({name : name}).then(async(doc)=> {
            finalFoodList.push(doc);
        });
    }
    
    return finalFoodList;
}
