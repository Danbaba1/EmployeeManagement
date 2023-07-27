const {pool} = require('./databaseconnections');

async function getemployees(page,size){
    console.log("Entered get employees.")
    var connection = await pool.connect();
    var querystring = {text :`SELECT *
                FROM employees
                ORDER BY employee_id
                LIMIT $2
                OFFSET (($1 - 1) * $2)`,
            values: [page,size]};
    var result = await connection.query(querystring);
    var resultrows = await result.rows;
    console.log("started returning rows.");
    connection.release();
    return resultrows;
    // console.log(await resultrows);
    // console.log("finished executing.")
    // connection.release();
    
}

async function getemployeeId(id){
    var connection = await pool.connect(); 
    var query = {
        text : 'select * from employees WHERE employee_id = $1',
        values : [id]
    }
    var result = await connection.query(query.text,query.values);
    var resultrows = await result.rows;
    connection.release();
    return resultrows;
}

async function createemployees(body){
    const {Department_id,first_name,last_name,email,hire_date,salary,password} = body;
    var connection = await pool.connect();
    // var querystring = 'insert into employees (Department_id,first_name,last_name,email,hire_date,salary) values ($1, $2, $3, $4, $5, $6)';
    const query = {
        text: 'insert into employees (Department_id,first_name,last_name,email,hire_date,salary,password) values ($1, $2, $3, $4, $5, $6, $7)',
        values: [Department_id,first_name,last_name,email,hire_date,salary,password]
      };
    // var result = await connection.query((query,[Department_id,first_name,last_name,email,hire_date,salary]));
    var result = await connection.query((query));
    return result;
    // var resultrows = await result.rows;
    // connection.release();
    // return resultrows;
}

async function createEmployeeRecords(employees) {
  const connection = await pool.connect(); // Get a client from the connection pool
  var result;
  //try {
    // await client.query('BEGIN'); // Start a transaction

    for (const employee of employees) {
      const {Department_id,first_name,last_name,email,hire_date,salary,password} = employee;
      const insertQuery = {
        text : 'INSERT INTO employees (Department_id,first_name,last_name,email,hire_date,salary,password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        values : [Department_id,first_name,last_name,email,hire_date,salary,password]
      }

      result = await connection.query(insertQuery.text, insertQuery.values);
    }
    
    // await client.query('COMMIT'); // Commit the transaction
//   } catch (error) {
    // await client.query('ROLLBACK'); // Rollback the transaction in case of an error
    // throw error; // Rethrow the error
//   } finally {
    connection.release(); // Release the client back to the pool
    return result;
}

async function updateemployee(id, body){
    var connection = await pool.connect();
    const {salary} = body;
    const query = {
        text: 'UPDATE employees SET salary = $1 WHERE employee_id = $2',
        values : [salary,id]
    }
    var result = await connection.query(query.text,query.values);
    connection.release();
    return result; 
}

async function deleteemployee(id){
    var connection = await pool.connect();
    const query = {
        text: 'delete from employees where employee_id = $1',
        values: [id]
    }
    var result = connection.query(query.text,query.values);
    connection.release();
    return result;
}

async function getEmployee(email){
    const connection = await pool.connect();
    const query = {
        text : "select employee_id, password from employees where email = $1",
        values: [email]
    }
    var result = await connection.query(query.text,query.values);
    var resultrows = await result.rows;
    connection.release();
    return resultrows[0];
}
// async function updateEmployeeRecord(employeeId, newValues) {
//     const client = await pool.connect();
  
//     try {
//       await client.query('BEGIN');
  
//       const query = 'UPDATE employees SET column1 = $1, column2 = $2 WHERE id = $3';
//       const values = [newValues.column1, newValues.column2, employeeId];
//       await client.query(query, values);
  
//       await client.query('COMMIT');
//       return true;
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

module.exports = {
    getemployees: getemployees,
    createemployees: createemployees,
    updateemployee: updateemployee,
    getemployeeId: getemployeeId,
    deleteemployee: deleteemployee,
    createEmployeeRecords: createEmployeeRecords,
    getEmployee: getEmployee
}