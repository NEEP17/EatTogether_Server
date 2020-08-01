const { PythonShell } = require("python-shell");
//let img_path = "C:\\neep\\picture2.jpg"

let 
let options = {
    mode: 'text',
    pythonPath: "C:\\Users\\DS\\anaconda3\\envs\\emotion\\python.exe",
    scriptPath: "",
    pythonOptions: ['-u'],
    args: [image_data]
};

PythonShell.run('emotion_test.py', options, function(err, data) {
    if (err) throw err;
    console.log('prediction: %s', data);
});
