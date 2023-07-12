const bcrypt = require('bcrypt');

async function hashpassword(password) {
   var hashedpassword = await bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Hashed password:', hash);
        return hash;
    });
    return hashedpassword;
}

module.exports = {
    hashpassword: hashpassword
}