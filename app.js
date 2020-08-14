var express     = require('express');
const app         = express();
var bodyParser  = require('body-parser');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var port = process.env.PORT || 8000;
// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});

// socket
const socketModule = require('./routes/api/socket');
app.io = require('socket.io')(server);
app.io.attach(server);

const ranking = app.io.of('/ranking');
socketModule(ranking);

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));



// Swagger definition
const swaggerDefinition = {
  info: { // API informations (required)
    title: 'EatTogether', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'EatTogether API' // Description (optional)
  },
  host: 'localhost:8000', // Host (optional)
  basePath: '/' // Base path (optional)
};

// Options for the swagger docs
const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./routes/api/swagger/swagger.yaml', './routes/api/room/room.controller.js']
}

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// configure api router
app.use('/', require('./routes/api')); 
