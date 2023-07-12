const http = require('http');
const express = require('express');
const { getemployees } = require("./databaseservice");
const { createemployees } = require("./databaseservice");
const swaggersetup = require('./swagger');
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
const { validatecreateemployeemodel } = require('./validatemodels');
const bodyparser = require('body-parser');
const { Connection } = require('pg');
const { updateemployee } = require('./databaseservice');
const { getemployeeId } = require('./databaseservice');
const { deleteemployee } = require('./databaseservice');
const {hashpassword} = require('./passwordprotection');

const app = express();
console.log('entry point');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/plain');
    res.statusCode = 200;
    res.send('Hello,World!');
    res.end();
});

app.get("/get-employee", async function (req, res) {
    var employees = await getemployees();
    //console.log(employees);
    res.setHeader('Content-type', 'application/json');
    res.statusCode = 200;
    res.send(employees);
    res.end();
    // var query = {
    //     text : 'select from empoyees'
    // }
    // var connect = new Connection();
    // connect.query(query).then(result=>{
    //     var employees = result.rows;
    //     return res.json(employees);
    // }).catch(err=>{
    //     console.log('This is the error: ' + err);
    // });
});

app.get("/get-employee/:id", async function (req, res) {
    var result = await getemployeeId(req.params.id);
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.send(result);
        res.end();
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400;
        res.send('No records');
    }
});

app.patch("/update-employee/:id", function (req, res) {
    var result = updateemployee(req.params.id, req.body);
    if (result) {
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 200;
        res.send("Successful");
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400;
        res.send("No record found");
    }
    return res.end();
    // return result;
});

app.post("/create-employee", async function (req, res) {
    var validate = validatecreateemployeemodel(req.body)
    if (!validate) {
        /*         res.setHeader(400,{
                    'Content-type' : 'text/plain'
                });
         */

        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400;
        res.send("Bad Request");
        res.end();
    }
    var hashedpassword = await hashpassword(req.body.password);
    req.body.password = hashedpassword;
    var result = await createemployees(req.body);
    if (result) {

        res.setHeader('Content-type', 'text/plain');
        res.statusCode = 200;
        res.send("Operation is successful.");
        res.end();
    } else {
        res.setHeader('Content-type', 'text/plain');
        res.statusCode = 500;
        res.send("Server Error");
    }
});

app.delete("/delete-employee/:id", function (req, res) {
    var result = deleteemployee(req.params.id);
    if (result) {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        res.send('successful');
        res.end();
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400;
        res.send('No record');
    }
});

app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    res.statusCode = 200;
    res.send(swaggersetup);
    res.end();
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
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
