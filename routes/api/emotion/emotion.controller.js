const model = require('../../../models');
const fs = require('fs');

exports.predict = async (req,res,next) => {
    const { PythonShell } = require("python-shell");
    let image_data = "/home/ec2-user/app/what/EatTogether_Server/emotion/picture1.jpg";

    let options = {
        mode: 'text',
        pythonPath: "/usr/bin/python3",
        scriptPath: "/home/ec2-user/app/what/EatTogether_Server/emotion",
        pythonOptions: ['-u'],
        args: [image_data]
    };

    const result = await new Promise((resolve, reject) => {
        PythonShell.run('prediction.py', options, function(err, data) {
            if (err) return reject(err);
            console.log('prediction: %s', resolve(data));
        });
    });
    
    
    console.log("result: "+result);
    return result;
    
}

exports.saveimage = async (req,res,next) => {
        var a = req.body.img;
        //var img = "/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/picture1.jpg";
    
        // incode
        //var bitmap = fs.readFileSync(img);
        //var base64str = new Buffer.from(bitmap).toString('base64');
        // decode
        var buffer = new Buffer.from(a, 'base64');
        console.log("dir: "+__dirname)
        fs.writeFileSync('/home/ec2-user/app/what/EatTogether_Server/routes/api/emotion/img/e1.jpg', buffer, function(err){
            console.log(err);
        });
}

