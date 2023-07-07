const {pool} = require('./databaseconnections');

async function getemployees(){
    console.log("Entered get employees.")
    var connection = await pool.connect();
    var querystring = 'select * from employees';
    var result = await connection.query(querystring);
    var resultrows = await result.rows;
    console.log("started returning rows.")
    console.log(await result.rows);
    console.log("finished executing.")
    connection.release();
    return resultrows;
}

async function createemployees(body){
    const {Department_id,first_name,last_name,email,hire_date,salary} = body;
    var connection = await pool.connect();
    var querystring = 'insert into employees (Department_id,first_name,last_name,email,hire_date,salary) values ($1, $2, $3, $4, $5, $6)';
    var result = await connection.query((querystring,[Department_id,first_name,last_name,email,hire_date,salary]));
    var resultrows = await result.rows;
    connection.release();
    return resultrows;
}

module.exports = {
    getemployees: getemployees,
    createemployees: createemployees
}