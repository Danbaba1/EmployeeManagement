const http = require('http');
const express = require('express');
const { validatecreateemployeemodel, loginemployee} = require('../validatemodels');
const bodyparser = require('body-parser');
const { Connection } = require('pg');
const { getemployees,createemployees, updateemployee, getemployeeId, deleteemployee, createEmployeeRecords, getEmployee} = require('../databaseservice');
const {hashpassword, isUserRegistered} = require('../passwordprotection');
const router = express.Router();
const jwt = require('jsonwebtoken');

require('dotenv').config();

router.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/plain');
    res.statusCode = 200;
    res.send('Hello,World!');
    res.end();
});

router.get("/get-employees", async function (req, res) {
    const {page,size} = req.query;
    var employees = await getemployees(page,size);
    //console.log(employees);
    res.setHeader('Content-type', 'application/json');
    res.statusCode = 200;
    res.send(employees);
    res.end();
});

router.get("/get-employee/:id", async function (req, res) {
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

router.get("/only-admin", function(req,res){
    if(!req.user) res.setHeader("statusCode", 400).send("Bad request")

    if(req.user.role == "admin"){
        return res.setHeader("statusCode", 200).send("Welcome admin")
    }
    else{
        return res.setHeader("statusCode", 403).send("Not allowed to this resource")
    }
});

// router.get('/users', async (req, res) => {
//     try {
//         const connection = await pool.connect(); // creates connection
//         const { page, size } = req.query;
//         const query = `
//                 SELECT *
//                 FROM "users"
//                 ORDER BY "users"."id"
//                 LIMIT $2
//                 OFFSET (($1 - 1) * $2);
//         `;
//         try {
//             const { rows } = await connection.query(query, [page, size]); // sends query
//             res.status(200).json(rows);
//         } finally {
//             await connection.release(); // releases connection
//         }
//     } catch (error) {
//         return res.status(500).json(error);
//     }
// });

router.patch("/update-employee/:id", function (req, res) {
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

router.post("/create-employee", async function (req, res) {
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

router.post('/create-employees', async function(req,res){
    var validate;
    for(let record of req.body){
        validate = validatecreateemployeemodel(record);
        if (!validate) {
            /*         res.setHeader(400,{
                        'Content-type' : 'text/plain'
                    });
             */
    
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 400;
            res.send("Bad Request");
            return res.end();
        }
    }
    
    for(let record of req.body){
        var hashedpassword = await hashpassword(record.password);
        record.password = hashedpassword;
    }
   
     
    var result = await createEmployeeRecords(req.body);
    if (result) {

        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        res.send("Operation is successful.");
        return res.end();
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 500;
        res.send("Server Error");
    }
});

router.post('/login', async function(req,res){
    try{
        const loginvalidate = loginemployee(req.body);
        if(!loginvalidate){
            var error =  new Error();
            error.data = {
                statusCode : 400,
                message : "Invalid Request body"
            }
            throw error;
        }
        const employee = await getEmployee(req.body.email);
        const isuserregistered = await isUserRegistered(req.body.password,employee.password);

        if(!isuserregistered){
            var error =  new Error();
            error.data = {
                statusCode : 400,
                message : "User does not exist."
            }
            throw error;
        }

        const admin = process.env.admin;
        const secretKey = process.env.secretKey;
        const expirytime = '1h';
        const expiry_refreshtime = '2h';
        var token,refreshtoken;
        if(req.body.email == admin){
            token = jwt.sign({id:employee.employee_id,email: req.body.email, role:"admin"},secretKey,{expiresIn:expirytime});
            refreshtoken = jwt.sign({id:employee.employee_id,email:employee.email, role:"admin"},secretKey,{expiresIn:expiry_refreshtime});
        }
        else{
            token = jwt.sign({id:employee.employee_id,email: req.body.email, role:"averageuser"},secretKey,{expiresIn: expirytime});
            refreshtoken = jwt.sign({id:employee.employee_id,email:employee.email, role:"averageuser"},secretKey,{expiresIn:expiry_refreshtime});
        }

            res.setHeader('statusCode', 200);
            res.json({
                data: {
                   jwtToken: token,
                   jwtrefreshtoken: refreshtoken,
                   success: true
                }
            })
            // res.send('Login Successful');
    } catch(error){
        res.setHeader('statusCode',400);
        res.send(error);
    }

})

router.post('/refresh-token', function(req,res){
    const expirytime = '2h';
    const secretKey = process.env.secretKey;
    const expiry_extratime = '3h';
    const {refreshtoken} = req.body;
    var accesstoken,newRefreshToken;
    jwt.verify(refreshtoken,secretKey,(err,val)=>{
        if(err){
            res.setHeader('statusCode',403).send('Expired Token');
        }else{
            accesstoken = jwt.sign({id:val.id,email:val.email},secretKey,{expiresIn: expirytime});
            newRefreshToken = jwt.sign({id:val.id,email:val.email},secretKey,{expiresIn:expiry_extratime});

            res.setHeader('statusCode',200);
            res.json({
                data:{
                    access_token: accesstoken,
                    new_refreshtoken: newRefreshToken
                }
            });
        }
    });
       
    });

router.delete("/delete-employee/:id", function (req, res) {
    var result = deleteemployee(req.params.id);
    if (result) {
        res.setHeader('Content-Type', 'text/plain');router
        res.statusCode = 200;
        res.send('successful');
        res.end();
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 400;
        res.send('No record');
    }
});

router.get('/swagger.json', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    res.statusCode = 200;
    res.send(swaggersetup);
    res.end();
});

module.exports = {
    accountcontrollerrouter: router
}