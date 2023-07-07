const http = require('http');
const express = require('express');
const {getemployees} = require("./databaseservice");
const {createemployees} = require("./databaseservice");
const swaggersetup = require('./swagger');
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
const {validatecreateemployeemodel} = require('./validatemodels');
const bodyparser = require('body-parser');

const app = express();
console.log('entry point');

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/',(req,res)=>{
    res.writeHead(200,{
        'Content-type':'text/plain'
    });
    res.write('Hello,World!');
});

app.post("/create-employee", async function(req,res){
    var validate = validatecreateemployeemodel(req.body)
    if(!validate){
/*         res.setHeader(400,{
            'Content-type' : 'text/plain'
        });
 */        
 
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400; 
        res.send("Bad Request");
        res.end();
    }
   var result  = await createemployees(req.body);
   if(result){
    
    res.setHeader(200,{
        'Content-type' : 'text/plain'
    });
    res.send("Operation is successful.")
   } else {
    res.setHeader(500,{
        'Content-type' : 'text/plain'
    });
    res.send("Server Error");
   }
})
app.get('/swagger.json',(req,res)=>{
    res.setHeader(200,{
        'Content-type':'application/json'
    });
    res.send(swaggersetup);
})

app.listen(3000,()=>{
    console.log('Server is listening on port 3000');
})
/*http.createServer(async (request,response)=>{
    if(request.url === '/swagger'){
        swaggersetup(req,res);
    }
        if(request.url === '/view-allemployees'){
            const result = await getemployees();

            if(!result){
              response.writeHead(200, {
                'Content-Type': 'text/plain'
            });  
            response.write("Operation failed");
        }
        console.log("empty check.");
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': ''
            });
            response.write(JSON.stringify(result));
        }

    response.end();
}).listen(1337);*/

console.log('done creating server');

// const express = require('express');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// const app = express();
// const port = 3000;

// // Serve Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // Your API routes
// app.get('/api/users', (req, res) => {
//   res.json({ message: 'List of users' });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
