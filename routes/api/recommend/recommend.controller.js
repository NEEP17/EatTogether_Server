module.exports.recommend= async function (food_name, n){
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

