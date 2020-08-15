const model = require('../../../models');
const fs = require('fs');


// predict function
var predict = async function (image_data){
    const { PythonShell } = require("python-shell");
    var image_data = image_data;

    let options = {
        mode: 'text',
        pythonPath: "/usr/bin/python3",
        scriptPath: "/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion",
        pythonOptions: ['-u'],
        args: [image_data]
    };

    const result = await new Promise((resolve, reject) => {
        PythonShell.run('prediction.py', options, function(err, data) {
            if (err) return reject(err);
            resolve(data);
            console.log('prediction: '+ data);
        });
    });

    console.log("result: "+result);
    return result;
}

exports.saveimage = async (req,res,next) => {
        var img = req.body.img;
        var deviceNum = req.body.deviceNum;
        var imgOrder = req.body.imgOrder;
    
        var rand = Math.floor(100 + Math.random() * 900);
        console.log("rand"+rand);
        
        var rand_str = rand.toString();
        console.log("rand_str"+rand_str)
        // decode
        var buffer = new Buffer.from(img, 'base64');
        console.log("dir: "+__dirname);
    
        var filename = '/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/'+deviceNum+'+'+imgOrder+'+'+ rand_str + '.jpg';
        console.log(filename);
    
        fs.writeFileSync(filename, buffer, function(err){
            console.log(err);
        });
}

exports.avgpredict = async (req,res) => {
    var deviceNum= req.body.deviceNum;
    var imgOrder = req.body.imgOrder;
    var array1 = [];
    var str = deviceNum + '+'+imgOrder;
    var pred_list = [];
    var sum = 0;
    
    const path = require('path');
    const directoryPath = path.join(__dirname, 'img');    

    
    // img list 가져오기
    
    const img_list = await new Promise((resolve, reject) => {
        fs.readdir(directoryPath, function (err, files) {
            files.forEach(async (file) => {
                if(file.indexOf(str)>=0){
                    await array1.push(file);
                }
            });
            return resolve(array1);
        });
    });
    
    // for len(predict)
    for(var i=0; i<img_list.length; i++){
        var str_tmp = directoryPath +"/"+img_list[i];
        img_list[i] = str_tmp;
        console.log("img_list: "+img_list[i]);
        sum += Number(await predict(img_list[i]));
    }
        
    // avg -> db.save
    var avg = sum/3;
    await model.Room.updateOne(
        {"deviceNum" : deviceNum},
        {"$push": {"pred": [avg]} } 
    );
    
}

