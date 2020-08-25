// predict function
module.exports.predict = async function (image_data){
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
