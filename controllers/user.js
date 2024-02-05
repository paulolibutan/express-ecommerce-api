const User = require("../models/User");
const bcrypt = require("bcrypt");

const auth = require("../auth");

// Register User
module.exports.registerUser = (req, res) => {

    User.findOne({ email: req.body.email })
        .then(existingUser => {
            if (!existingUser) {

                if (!req.body.email.includes("@")) {
                    return res.status(400).send({ error: "Invalid email address" });
                }

                if (req.body.password.length < 8) {
                    return res.status(400).send({ error: "Password must be at least 8 characters" });
                }
                if (req.body.mobileNo.length !== 11) {
                    return res.status(400).send({ error: "Invalid mobile number" });
                }

                const { firstName, lastName, email, password, mobileNo } = req.body;

                const hashedPassword = bcrypt.hashSync(password, 10);

                let newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    mobileNo
                });

                newUser.save()
                    .then(user => {
                        return res.status(201).send({ message: "User has been registered successfully" });
                    })
                    .catch(err => {
                        console.error("Error in saving the user: ", err);
                        return res.status(500).send({ error: "Error in saving the user" })
                    });
            } else {
                return res.status(409).send({ error: "Email already in use" });
            }
        });
};

// Login User
module.exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    User.findOne({ email }).
        then(user => {
            if (!user) {
                return res.status(404).send({ error: "Email not found" });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);

                if (isPasswordCorrect) {
                    return res.status(200).send({ accessToken: auth.createAccessToken(user) });
                } else {
                    return res.status(401).send({ message: "Email and password do not match" });
                }
            }
        })
        .catch(err => {
            console.error("Error logging in: ", err)
            return res.status(500).send({ error: "Error logging in" })
        });
};

// Get user details
module.exports.getUserDetails = (req, res) => {
    User.findById(req.user.id, { password: 0 })
        .then(user => {
            if (!user) {
                return res.status(401).send({ error: "User not found" });
            } else {
                return res.status(200).send({ user });
            }
        })
        .catch(err => {
            console.error("Error in retrieving user details", err)
            return res.status(500).send({ error: 'Error in retrieving user details' })
        });
};

// Update user as admin
module.exports.updateUserAsAdmin = (req, res) => {

    let updateIsAdminField = {
        isAdmin: true
    }
    User.findByIdAndUpdate(req.params.userId, updateIsAdminField, { new: true })
        .then(updatedUser => {
            return res.status(200).send({
                message: "User has been promoted to admin role",
                updatedUser: updatedUser
            });
        })
        .catch(err => {
            console.error("Error in updating the user: ", err)
            return res.status(500).send({ error: 'Error in updating the use' });
        });

};

module.exports.updateUserPassword = (req, res) => {
    const { newPassword } = req.body;
    const { id } = req.user;

    if (newPassword.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters" });
    }

    let hashedPassword = bcrypt.hashSync(newPassword, 10);

    console.log(id);
    console.log(hashedPassword);

    User.findByIdAndUpdate(id, { password: hashedPassword })
        .then(result => {
            return res.status(200).send({ message: "Password has been updated successfully" });
        })
        .catch(err => {
            console.error("Error in updating the password", err)
            return res.status(500).send({ error: "Error in updating the password" });
        });
};
