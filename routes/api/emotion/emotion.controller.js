const model = require('../../../models');
const fs = require('fs');



exports.predict = async (req,res,next) => {
    const { PythonShell } = require("python-shell");
    let image_data = "/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/picture1.jpg";

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
            //console.log('prediction: %s', resolve(data));
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
    
    const path = require('path');
    const directoryPath = path.join(__dirname, 'img');    

    const result = await new Promise((resolve, reject) => {
        fs.readdir(directoryPath, function (err, files) {
            console.log(files);
            files.forEach(async (file) => {
                if(file.indexOf(str)>=0){
                    console.log(file);
                    await array1.push(file);
                    //console.log("in "+array1);
                }
            });

            console.log("in "+array1);
            return resolve(array1);
        });
    });
    
    console.log("out "+result);
    console.log(typeof result);
}

