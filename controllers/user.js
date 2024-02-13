const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const auth = require("../auth");
const sendgridTransporter = require("../utilities/sendGridTransporter");

// Register User
module.exports.registerUser = (req, res) => {

    const { firstName, lastName, email, password, mobileNo } = req.body;

    User.findOne({ email })
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

                // Generate a confirmation token
                const confirmationToken = crypto.randomBytes(36).toString("hex");
                const confirmationExpires = Date.now() + 24 * 3600 * 1000; // Token expires in 24 hours

                const hashedPassword = bcrypt.hashSync(password, 10);

                let newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    mobileNo,
                    confirmationToken,
                    confirmationExpires
                });

                newUser.save()
                    .then(user => {
                        const confirmationUrl = `http://ec2-18-218-180-213.us-east-2.compute.amazonaws.com/b6/users/${confirmationToken}`;
                        const mailOptions = {
                            from: "ecommerce-demo-app@hotmail.com",
                            to: email,
                            subject: "EcommerceApp: Confirm your email",
                            html: `Click <a href="${confirmationUrl}">here</a> to confirm your email.`
                        };

                        try {
                            sendgridTransporter.sendMail(mailOptions);
                            return res.status(201).send({ message: "User has been registered successfully. Please check your email for confirmation." });
                        } catch (error) {
                            console.error(error);
                            return res.status(500).send({ error: "Error sending email" });
                        }
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


// Confirm Email
module.exports.confirmEmail = (req, res) => {

    const { token } = req.params;

    User.findOne({
        confirmationToken: token,
        confirmationExpires: { $gt: Date.now() }
    })
        .then(user => {
            if (!user) {
                const error = "Invalid or expired token";
                return res.render("error-alert", { error });
            }

            // Update user's emailConfirmed status
            user.emailConfirmed = true;
            user.confirmationToken = undefined;
            user.confirmationExpires = undefined;

            user.save()
                .then(newUser => {
                    const mailOptions = {
                        from: "ecommerce-demo-app@hotmail.com",
                        to: user.email,
                        subject: "EcommerceApp: Email confirmed successfully",
                        html: "Thank you for confirming your email."
                    };

                    try {
                        sendgridTransporter.sendMail(mailOptions);
                        const message = "Email confirmed successfully";
                        return res.render("successful-alert", { message });
                    } catch (err) {
                        console.error("Error sending email: ", err);
                        const error = "Error sending email";
                        return res.render("error-alert", { error });
                    }
                })
                .catch(err => {
                    console.error("Error in saving the user: ", err);
                    const error = "Error in saving the user";
                    return res.render("error-alert", { error });
                });
        })
        .catch(err => {
            console.error("Error in retrieving the user: ", err);
            const error = "Error in retrieving the user";
            return res.render("error-alert", { error });
        });

};

// Login User
module.exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    User.findOne({ email }).
        then(user => {
            if (!user) {
                return res.status(404).send({ error: "Email not found" });
            }

            if (!user.emailConfirmed) {
                // Generate a confirmation token
                const confirmationToken = crypto.randomBytes(36).toString("hex");
                const confirmationExpires = Date.now() + 24 * 3600 * 1000; // Token expires in 24 hours

                user.confirmationToken = confirmationToken;
                user.confirmationExpires = confirmationExpires;
                user.save();

                const confirmationUrl = `http://ec2-18-218-180-213.us-east-2.compute.amazonaws.com/b6/users/${confirmationToken}`;
                const mailOptions = {
                    from: "ecommerce-demo-app@hotmail.com",
                    to: email,
                    subject: "EcommerceApp: Confirm your email",
                    html: `Click <a href="${confirmationUrl}">here</a> to confirm your email.`
                };

                try {
                    sendgridTransporter.sendMail(mailOptions);
                    return res.status(400).send({ error: "Email is not yet confirmed. We have resent the confirmation link to your email." });
                } catch (error) {
                    console.error(error);
                    return res.status(500).send({ error: "Error sending email" });
                }
            }

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (isPasswordCorrect) {
                return res.status(200).send({ accessToken: auth.createAccessToken(user) });
            } else {
                return res.status(401).send({ error: "Email and password do not match" });
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
                return res.status(404).send({ error: "User not found" });
            } else {
                return res.status(200).send({ user });
            }
        })
        .catch(err => {
            console.error("Error in retrieving user details: ", err)
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
            if (updatedUser) {
                return res.status(200).send({ message: "User has been promoted to admin role", updatedUser: updatedUser });
            } else {
                return res.status(404).send({ error: "User not found" });
            }
        })
        .catch(err => {
            console.error("Error in updating the user: ", err)
            return res.status(500).send({ error: "Error in updating the user" });
        });

};

// Update Password
module.exports.updateUserPassword = (req, res) => {
    // const { newPassword } = req.body;
    // const { id } = req.user;

    // if (newPassword.length < 8) {
    //     return res.status(400).send({ error: "Password must be at least 8 characters" });
    // }

    // let hashedPassword = bcrypt.hashSync(newPassword, 10);

    // User.findByIdAndUpdate(id, { password: hashedPassword })
    //     .then(result => {
    //         if (result) {
    //             return res.status(200).send({ message: "Password has been updated successfully" });
    //         } else {
    //             return res.status(404).send({ error: "User not found" });
    //         }
    //     })
    //     .catch(err => {
    //         console.error("Error in updating the password: ", err)
    //         return res.status(500).send({ error: "Error in updating the password" });
    //     });

    const { email } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }

            // Generate a unique token
            const token = crypto.randomBytes(36).toString("hex");

            // Update user with reset token and expiry
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 900000; // 15 minutes expiry
            user.save();

            // Send email with reset link using nodemailer-sendgrid-transport
            const mailOptions = {
                from: "ecommerce-demo-app@hotmail.com",
                to: email,
                subject: "Ecommerce App: Password Reset Request",
                text: `You have requested to reset your password. Click the following link to continue: http://ec2-18-218-180-213.us-east-2.compute.amazonaws.com/b6/users/update-password/${token}`
            };

            try {
                sendgridTransporter.sendMail(mailOptions);
                return res.status(200).send({ message: "Email sent with password reset instructions" });
            } catch (error) {
                console.error(error);
                return res.status(500).send({ error: "Error sending email" });
            }
        }).catch(err => {
            console.error("Error in retrieving the user: ", err);
            return res.status(500).send({ error: "Error in retrieving the user" });
        });
};

module.exports.updateUserPasswordWithToken = (req, res) => {
    const { token } = req.params;

    User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    })
        .then(user => {
            if (!user) {
                const error = "Invalid or Expired Token"
                return res.render("error-alert", { error });
            }

            // Construct the absolute path to the reset-password.html file
            // const filePath = path.join(__dirname, "..", "views", "update-password.html");

            // Render a form for the user to reset their password
            //return res.sendFile(filePath);
            return res.render("update-password", { token });
        })
        .catch(err => {
            console.error("Error in retrieving the user: ", err);
            const error = "Error in retrieving the user";
            return res.render("error-alert", { error });
        });

};

module.exports.updateUserPasswordForm = (req, res) => {
    const { token } = req.params;
    const { currentPassword, newPassword } = req.body;

    User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    })
        .then(user => {
            if (!user) {
                const error = "Invalid or Expired Token"
                return res.render("error-alert", { error });
            }

            const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);

            if (!isPasswordValid) {
                const error = "Current password is incorrect";
                return res.render("error-alert", { error });
            }

            // Update user's password and clear reset fields
            user.password = bcrypt.hashSync(newPassword, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save()
                .then(savedUser => {
                    const mailOptions = {
                        from: "ecommerce-demo-app@hotmail.com",
                        to: user.email,
                        subject: "Ecommerce App: Password Reset Successful",
                        text: "Your password reset was successful."
                    };

                    try {
                        sendgridTransporter.sendMail(mailOptions);
                        const message = "Password has been updated successfully";
                        return res.render("successful-alert", { message });
                    } catch (err) {
                        console.error("Error sending email: ", err);
                        const error = "Error sending email";
                        return res.render("error-alert", { error });
                    }
                })
                .catch(err => {
                    console.error("Error in saving the user: ", err);
                    const error = "Error in saving the user";
                    return res.render("error-alert", { error });
                });
        })
        .catch(err => {
            console.error("Error in retrieving the user: ", err);
            const error = "Error in retrieving the user";
            return res.render("error-alert", { error });
        });
};