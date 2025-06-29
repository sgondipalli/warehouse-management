const bcrypt = require("bcryptjs");

bcrypt.hash("Palavala@3410", 10).then(hash => {
    console.log("Hashed Password:", hash);
});
