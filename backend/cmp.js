const bcrypt = require("bcryptjs");

bcrypt.compare("Palavala@3410", "$2b$10$gQnO47NKON4ew8G2MmIpvefnlagda7RkzuImZ85ZMfaZxUEbYDAay").then(console.log);
