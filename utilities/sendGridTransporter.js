const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const sendgridTransporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

module.exports = sendgridTransporter;
