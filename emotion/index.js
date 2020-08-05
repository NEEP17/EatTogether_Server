module.exports.emotion = async function(){
	const { PythonShell } = require("python-shell");
    let image_data = "/home/ec2-user/app/what/What_Server/emotion/picture1.jpg";

    let options = {
        mode: 'text',
        pythonPath: "/usr/bin/python3",
        scriptPath: "/home/ec2-user/app/what/What_Server/emotion",
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

