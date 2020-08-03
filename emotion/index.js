module.exports.emotion = function(){
	const { PythonShell } = require("python-shell");
	//let img_path = "C:\\neep\\picture2.jpg"

	//let image_data = ""; // 이미지 

	let image_data = "./aa.jpg"

	let options = {
	    mode: 'text',
   	 pythonPath: "/usr/bin/python3",
   	 scriptPath: "./emotion",
   	 pythonOptions: ['-u'],
   	 args: [image_data]
	};

	PythonShell.run('prediction.py', options, function(err, data) {
    	if (err) throw err;
   	 console.log('prediction: %s', data);
});
}
