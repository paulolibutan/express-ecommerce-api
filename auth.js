const jwt = require("jsonwebtoken");


const secret = "5lONbacs8CFdnVOeR2v1z0YCF1m1xkaWQZKC68KTVVmtfvA7ClSJ2zpdfY5JtnHp"

// Create access token
module.exports.createAccessToken = (user) => {

    // Data from user login/registration
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };

    // Generate token
    const token = jwt.sign(data, secret, {});

    return token;
};

// Verify User
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        return res.status(401).send({ auth: "Failed. No token" });
    } else {
        token = token.slice(7, token.length);
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) {
                return res.status(400).send({ auth: "Failed", message: err.message });
            } else {
                req.user = decodedToken;
                next();
            }
        });
    }
};

// Verify if admin user
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(403).send({ auth: "Failed", message: "Forbidden" });
    }
};