// const nodemailer = require('nodemailer')

// exports.generateOTP = (otp_length = 6) => {
//  // generate 6 digit otp
//  let OTP = "";
//  for (let i = 1; i <= otp_length ; i++) {
//    const randomVal = Math.round(Math.random() * 9);
//    OTP += randomVal;
//  }

//  return OTP; 
// };


// exports.generateMailTransporter = () => nodemailer.
// createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: process.env.MAIL_TRAP_USER,
//       pass: process.env.MAIL_TRAP_PASS
//     }
//    }); 

////////////////////////////////////////////////////////

// require('dotenv').config();
// const Brevo = require('@getbrevo/brevo');

// exports.generateOTP = (otp_length = 6) => {
//   // generate 6 digit otp
//   let OTP = "";
//   for (let i = 1; i <= otp_length; i++) {
//     const randomVal = Math.round(Math.random() * 9);
//     OTP += randomVal;
//   }
//   return OTP;
// };

// exports.generateMailTransporter = () => {
//   const brevo = new Brevo();
//   brevo.setApiKey(Brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);
//   return brevo;
// };

// exports.sendEmail = async (to, subject, htmlContent) => {
//   const brevo = exports.generateMailTransporter();
//   const sendSmtpEmail = {
//     sender: { name: "Your Name", email: "your_email@example.com" },
//     to: [{ email: to }],
//     subject: subject,
//     htmlContent: htmlContent,
//   };

//   try {
//     const response = await brevo.sendTransacEmail(sendSmtpEmail);
//     console.log('Email sent successfully:', response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Rethrow the error to handle it in the controller
//   }
// };

/////////////////////////////////////////////////////////////////////////

const nodemailer = require("nodemailer");


exports.generateOTP = (otp_length = 6) => {
    // generate 6 digit otp
    let OTP = "";
    for (let i = 1; i <= otp_length; i++) {
      const randomVal = Math.round(Math.random() * 9);
      OTP += randomVal;
    }
    return OTP;
  };

  exports.sendEmail = async (to, subject, html) => {
    // Create a transporter object using the Brevo SMTP settings
    let transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587, // Use 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.BREVO_USER, // Your Brevo account email
            pass: process.env.BREVO_PASS  // Your generated SMTP key
        },
    });

    // Define the email options
    let mailOptions = {
        from: '"Your Name" <YOUR_EMAIL@DOMAIN.COM>', // Sender address
        to: to, // Use the recipient's email passed as a parameter
        subject: subject, // Use the subject passed as a parameter
        html: html, // Use the HTML content passed as a parameter
    };

    // Send the email
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error; // Rethrow the error to handle it in the calling function
    }
};

