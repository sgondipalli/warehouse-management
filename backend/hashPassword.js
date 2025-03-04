const bcrypt = require("bcryptjs");

bcrypt.hash("SuperAdmin123!", 10).then(hash => {
    console.log("Hashed Password:", hash);
});
