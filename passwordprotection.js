const bcrypt = require('bcrypt');

 async function hashpassword(password) {
    var hashedpassword;
// await bcrypt.hash(password, 10, (err, hash) => {
//         if (err) {
//             console.error(err);
//             return;
//         }
//         console.log('Hashed password:', hash);
//         return hash;
//     });
//     return hashedpassword;
var salt = await bcrypt.genSaltSync(10);
hashedpassword = await bcrypt.hashSync(password, salt);
return hashedpassword;
 }

async function isUserRegistered(password, encryptedPassword){
    var issame = await bcrypt.compareSync(password, encryptedPassword);
    return issame;
}

module.exports = {
    hashpassword: hashpassword,
    isUserRegistered: isUserRegistered
}