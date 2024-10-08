const admin = require('firebase-admin');
const User = require('../models/user.model');
const jwt = require("jsonwebtoken");
const multiavatar = require('@multiavatar/multiavatar');
const authController = require('./auth.controller');
const { slackLogger, webHookURL } = require('../middlewares/webHook');
const { getSecret } = require('../../firebase'); // Import the getSecret function

exports.authController = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    try {
      await admin.auth().getUser(firebaseUid);
    } catch (firebaseError) {
      await slackLogger('Error verifying mobile number', firebaseError.message, firebaseError, null, webHookURL);
      if (firebaseError.code === 'auth/user-not-found') {
        const userToDelete = await User.findOne({ firebaseUid });
        if (userToDelete) {
          await User.deleteOne({ firebaseUid });
          return res.status(404).json({ message: 'No user was found in Firebase with this UID, so it is being removed from the database.' });
        }
      }
      return res.status(400).json({ error: firebaseError.message });
    }

    const userRecord = await admin.auth().getUser(firebaseUid);
    let phoneNumber, email;
    if (userRecord.phoneNumber) {
      phoneNumber = userRecord.phoneNumber;
    } else if (userRecord.email) {
      email = userRecord.email;
    } else {
      return res.status(400).json({ error: 'Invalid Firebase user data' });
    }

    const username = await authController.generateUsername(email || phoneNumber);
    let user;

    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ phoneNumber });
    }

    const secret = await getSecret(); // Fetch JWT secret from Remote Config

    if (user) {
      const token = jwt.sign({ id: user.id }, secret, {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400 * 365,
      });

      user.accessToken = token;  
      user.email = email;
      user.emailVerified = true;
      await user.save();
      return res.status(200).json({ message: 'User signed in successfully', accessToken: token, user_id: user.id, username: user.username, email: user.email });
    }

    let svgCode = multiavatar(email || phoneNumber);
    const otp = authController.generateOTP();
    const userReferral = await authController.generateReferralCode();

    const newUser = new User({
      phoneNumber,
      email,
      avatar: svgCode,
      username,
      createdAt: Date.now(),
      adhaarVerified: "unverified",
      panVerified: "unverified",
      bankVerified: "unverified",
      referral: req?.body?.referral || null,
      otp,
      userReferral
    });

    const token = jwt.sign({ id: newUser.id }, secret, {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: 86400 * 365,
    });

    newUser.firebaseUid = firebaseUid;
    newUser.accessToken = token;
    authController.sendOTP(email, otp);
    await newUser.save();
    
    res.status(200).json({ message: 'User created and signed in successfully', accessToken: token, user_id: newUser.id, username: newUser.username, email: newUser.email });
  } catch (error) {
    await slackLogger('Error verifying mobile number', error.message, error, null, webHookURL);
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
};

// Add the generateUsername, generateOTP, generateReferralCode, and sendOTP functions here

 const generateUsername = async (email) => {
   // Extract the first 4 characters from the email
      const username = email.substring(0, 4).toLowerCase();
//   // Check if the username is already taken
   const existingUser = await User.findOne({ username });
   if (!existingUser) {
     return username;
  }
//   // If the username is taken, add a random number to make it unique
   const randomNumber = Math.floor(1000 + Math.random() * 9000);
   return `${username}${randomNumber}`;
 };
// generate otp function
// function generateOTP() {
//   // Generate a random 6-digit number
//   const otp = Math.floor(100000 + Math.random() * 900000);
//   return otp;
// }

// async function generateReferralCode() {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let referralCode = '';
//   for (let i = 0; i < 6; i++) {
//     referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   const referralExisting = await User.findOne({ userReferral: referralCode }).select('userReferral');
//   if (referralExisting) {
//     generateReferralCode();
//   }
//   console.log('Referral code:', referralCode);
//   return referralCode;
// }

// Send OTP to the user's email
// async function sendOTP(email, otp) {
//   const mailOptions = {
//     from: 'aliamankhan96@gmail.com',
//     to: email,
//     subject: 'OTP Verification',
//     text: `Your OTP for email verification is ${otp}`,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//       return `Error sending email: ${error}`;
//     } else {
//       console.log(`Email sent: ${info.response}`);
//       return `Email sent successfully: ${info.response}`;
//     }
//   });
// }