const http = require('http');
const express = require('express');
const swaggersetup = require('./swagger');
const swaggerDocument = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
const bodyparser = require('body-parser');
const { Connection } = require('pg');
const {accountcontrollerrouter} = require('./Controllers/accountcontrollers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
console.log('entry point');

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next)=>{
    const tested = /^\/api-docs\//.test(req.path)
    
    if(req.path == '/login' || req.path == '/refresh-token'){
        next();
    }
    else{
        if(!req.header('Authorization') ){
            return res.setHeader('statusCode', 401).send("user is unauthorized")
        }
        const token = req.header('Authorization').split(' ')[1]
        const secretkey = process.env.secretkey;
        jwt.verify(token, secretkey,(err, val)=>{
            if(err){
                return res.setHeader('statusCode', 401).send("user is unauthorized")
            }
            //return res.setHeader('statusCode',200).send("user is authorized")
            req.user = val
            next();
        })
    }
 
    //next();

    //return res.setHeader('statusCode',200).send("user is authorized")
})

app.use([accountcontrollerrouter]);


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});


console.log('done creating server');


