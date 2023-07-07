function validatecreateemployeemodel(body){
    if(!body.Department_id || !body.first_name || !body.last_name || !body.email || !body.hire_date || !body.salary){
        return false;
    }
    return true;
}

module.exports = {
    validatecreateemployeemodel : validatecreateemployeemodel
}