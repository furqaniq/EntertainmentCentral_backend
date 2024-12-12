// const jwt = require('jsonwebtoken');
// const User = require('../models/user');
// const EmailVerificationToken = require('../models/emailVerificationToken');
// const { isValidObjectId } = require('mongoose');
// const { generateOTP, generateMailTransporter } = require('../utils/mail');
// const { sendError, generateRandomByte } = require('../utils/helper');
// const PasswordResetToken = require('../models/passwordResetToken');

// exports.create = async (req, res) => {
//   const { name, email, password } = req.body

//   const oldUser = await User.findOne({ email });

//   if (oldUser) return sendError(res, "This email is already in use!")

//   const newUser = new User({ name, email, password })
//   await newUser.save()

//   // generate 6 digit otp
//   let OTP = generateOTP();

//   // store otp inside our db
//   const newEmailVerificationToken = new EmailVerificationToken({ owner: newUser._id, token: OTP })

//   await newEmailVerificationToken.save()

//   // send that otp to our user

//   var transport = generateMailTransporter();

//   transport.sendMail({
//     from: 'verification@reviewapp.com',
//     to: newUser.email,
//     subject: 'Email Verification',
//     html: `
//       <p>You verification OTP</p>
//       <h1>${OTP}</h1>
//     `
//   })

//   res.status(201).json({
//     user: {
//       id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//     },
//    });
// };

// exports.verifyEmail = async (req, res) => {
//   const { userId, OTP } = req.body

//   if (!isValidObjectId(userId)) return sendError(res, "Invalid user!")

//   const user = await User.findById(userId)
//   if (!user) return sendError(res, "user not found!", 404)

//   if (user.isVerified) return sendError(res, "user is already verified!")

//   const token = await EmailVerificationToken.findOne({ owner: userId })
//   if (!token) return sendError(res, 'token not found!')

//   const isMatched = await token.compareToken(OTP)
//   if (!isMatched) return sendError(res, 'Please submit a valid OTP!')

//   user.isVerified = true;
//   await user.save();

//   await EmailVerificationToken.findByIdAndDelete(token._id);

//   var transport = generateMailTransporter();

//   transport.sendMail({
//     from: 'verification@reviewapp.com',
//     to: user.email,
//     subject: 'Welcome Email',
//     html: '<h1>Welcome to our app and thanks for choosing us.</h1>'
//   })

//   const jwtToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET);

//   res.json({ 
//     user: { 
//       id: user._id, 
//       name: user.name, 
//       email: user.email, 
//       token: jwtToken, 
//       isVerified: user.isVerified,
//       role: user.role, }, 
//      message: "Your email is verified." })
// }

// exports.resendEmailVerificationToken = async (req, res) => {
//   const { userId } = req.body;

//   const user = await User.findById(userId);
//   if (!user) return sendError(res, "user not found!");

//   if (user.isVerified)
//     return sendError(res, "This email id is already verified!");

//   const alreadyHasToken = await EmailVerificationToken.findOne({
//     owner: userId,
//   });
//   if (alreadyHasToken)
//     return sendError(res, "Only after one hour you can request for another token!");

//   // generate 6 digit otp
//   let OTP = generateOTP();

//   // store otp inside our db
//   const newEmailVerificationToken = new EmailVerificationToken({ owner: user._id, token: OTP })

//   await newEmailVerificationToken.save()

//   // send that otp to our user

//   var transport = generateMailTransporter()

//   transport.sendMail({
//     from: 'verification@reviewapp.com',
//     to: user.email,
//     subject: 'Email Verification',
//     html: `
//       <p>You verification OTP</p>
//       <h1>${OTP}</h1>
//     `
//   })

//   res.json({
//     message: "New OTP has been sent to your registered email accout.",
//   });
// };

// exports.forgetPassword = async (req, res) => {
//   const { email } = req.body;

//   if (!email) return sendError(res, "email is missing!");

//   const user = await User.findOne({ email });
//   if (!user) return sendError(res, "User not found!", 404);

//   const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
//   if (alreadyHasToken)
//     return sendError(
//       res,
//       "Only after one hour you can request for another token!"
//     );

//   const token = await generateRandomByte();
//   const newPasswordResetToken = await PasswordResetToken({
//     owner: user._id,
//     token,
//   });
//   await newPasswordResetToken.save();

//   //const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`;
//   const resetPasswordUrl = `${process.env.BASE_URL}/auth/reset-password?token=${token}&id=${user._id}`;

//   const transport = generateMailTransporter();

//   transport.sendMail({
//     from: "security@reviewapp.com",
//     to: user.email,
//     subject: "Reset Password Link",
//     html: `
//       <p>Click here to reset password</p>
//       <a href='${resetPasswordUrl}'>Change Password</a>
//     `,
//   });

//   res.json({ message: "Link sent to your email!" });
// };

// exports.sendResetPasswordTokenStatus = (req, res) => {
//   res.json({ valid: true })
// }

// exports.resetPassword = async (req, res) => {
//   const { newPassword, userId } = req.body;

//   const user = await User.findById(userId);
//   const matched = await user.comparePassword(newPassword);
//   if (matched)
//     return sendError(
//       res,
//       "The new password must be different from the old one!"
//     );

//   user.password = newPassword;
//   await user.save();

//   await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

//   const transport = generateMailTransporter();

//   transport.sendMail({
//     from: "security@reviewapp.com",
//     to: user.email,
//     subject: "Password Reset Successfully",
//     html: `
//       <h1>Password Reset Successfully</h1>
//       <p>Now you can use new password.</p>

//     `,
//   });

//   res.json({
//     message: "Password reset successfully, now you can use new password.",
//   });
// };


// exports.signIn = async (req, res) => { 
//   const { email, password} = req.body;

//   const user = await User.findOne({email});
//   if(!user) return sendError(res, 'Email/Password mismatch!');

//    const matched  = await user.comparePassword(password);
//    if(!matched) return sendError(res, 'Email/Password mismatch!');
   
//    const {_id, name, isVerified, role } = user;

//    const jwtToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET);

//    res.json({user: {id: _id, name, email, token: jwtToken, isVerified, role} });

// };

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const { isValidObjectId } = require('mongoose');
const { generateOTP, sendEmail } = require('../utils/mail');
const { sendError } = require('../utils/helper');

// exports.create = async (req, res) => {
//   const { name, email, password } = req.body;

//   const oldUser  = await User.findOne({ email });

//   if (oldUser ) return sendError(res, "This email is already in use!");

//   const newUser  = new User({ name, email, password });
//   await newUser .save();

//   // Generate 6 digit OTP
//   let OTP = generateOTP();

//   // Store OTP inside our DB
//   const newEmailVerificationToken = new EmailVerificationToken({ owner: newUser ._id, token: OTP });
//   await newEmailVerificationToken.save();

//   // Send that OTP to our user
//   try {
//     await sendEmail(newUser .email, 'Email Verification', `
//       <p>Your verification OTP</p>
//       <h1>${OTP}</h1>
//     `);
//   } catch (error) {
//     return sendError(res, "Failed to send verification email.");
//   }

//   res.status(201).json({
//     user: {
//       id: newUser ._id,
//       name: newUser .name,
//       email: newUser .email,
//     },
//   });
// };

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const oldUser  = await User.findOne({ email });
    if (oldUser ) return sendError(res, "This email is already in use!");

    // Create a new user
    const newUser  = new User({ name, email, password });
    await newUser .save();

    // Generate a 6-digit OTP
    const OTP = generateOTP();

    // Store OTP inside our DB
    const newEmailVerificationToken = new EmailVerificationToken({ owner: newUser._id, token: OTP });
    await newEmailVerificationToken.save();

    // Send the OTP to the user
    try {
      await sendEmail(newUser.email, 'Email Verification', `
        <p>Your verification OTP is:</p>
        <h1>${OTP}</h1>
      `);
  } catch (error) {
      return sendError(res, "Failed to send verification email.");
  }

    // Respond with user information
    res.status(201).json({
      user: {
        id: newUser ._id,
        name: newUser .name,
        email: newUser .email,
      },
    });
  } catch (error) {
    console.error("Error during user creation:", error);
    return sendError(res, "An error occurred while creating the user.");
  }
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User  not found!", 404);

  if (user.isVerified) return sendError(res, "User  is already verified!");

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, 'Token not found!');

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, 'Please submit a valid OTP!');

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  try {
    await sendEmail(user.email, 'Welcome Email', '<h1>Welcome to our app and thanks for choosing us.</h1>');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "Your email is verified."
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User  not found!");

  if (user.isVerified) return sendError(res, "This email id is already verified!");

  const alreadyHasToken = await EmailVerificationToken.findOne({ owner: userId });
  if (alreadyHasToken) return sendError(res, "Only after one hour you can request for another token!");

  // Generate 6 digit OTP
  let OTP = generateOTP();

  // Store OTP inside our DB
  const newEmailVerificationToken = new EmailVerificationToken({ owner: user._id, token: OTP });
  await newEmailVerificationToken.save();

  // Send that OTP to our user
  try {
    await sendEmail(user.email, 'Email Verification', `
      <p>Your verification OTP</p>
      <h1>${OTP}</h1>
    `);
  } catch (error) {
    return sendError(res, "Failed to resend verification email.");
  }

  res.json({
    message: "New OTP has been sent to your registered email account.",
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is missing!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User  not found!", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken) {
    return sendError(res, "Only after one hour you can request for another token!");
  }

  const token = await generateRandomByte();
  const newPasswordResetToken = new PasswordResetToken({ owner: user._id, token });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `${process.env.BASE_URL}/auth/reset-password?token=${token}&id=${user._id}`;

  try {
    await sendEmail(user.email, 'Reset Password Link', `
      <p>Click here to reset your password</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
    `);
  } catch (error) {
    return sendError(res, "Failed to send reset password email.");
  }

  res.json({ message: "Link sent to your email!" });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User  not found!", 404);

  const matched = await user.comparePassword(newPassword);
  if (matched) {
    return sendError(res, "The new password must be different from the old one!");
  }

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  try {
    await sendEmail(user.email, 'Password Reset Successfully', `
      <h1>Password Reset Successfully</h1>
      <p>You can now use your new password.</p>
    `);
  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error);
  }

  res.json({
    message: "Password reset successfully, now you can use your new password.",
  });
};

exports.signIn = async (req, res) => { 
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, 'Email/Password mismatch!');

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, 'Email/Password mismatch!');
  
  const { _id, name, isVerified, role } = user;

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({
    user: {
      id: _id,
      name,
      email,
      token: jwtToken,
      isVerified,
      role
    }
  });
};