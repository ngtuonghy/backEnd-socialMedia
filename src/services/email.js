// emailService.js
import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "youremail@gmail.com",
//     pass: "yourpassword",
//   },
// });
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "jarret.raynor@ethereal.email",
    pass: "Jv8W2hA11ZVgh1UgSP",
  },
});

const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

export { sendEmail };
