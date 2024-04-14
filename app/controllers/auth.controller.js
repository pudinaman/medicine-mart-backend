const db = require("../models");
const config = require("../config/auth.config");
const crypto = require('crypto');
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

// exports.signup = async (req, res) => {
//     try {
//         if (req.body) {
//             const { email, password } = req.body;
//             if (!email || !password) {
//                 console.log(`Error ${res.status}: User not found.`);
//                 return res.status(400).send({ message: "Email and Password are required." });
//             }
//             const username = await exports.generateUsername(email);
//             // Generate an SVG avatar
//             let svgCode = multiavatar(email);
//             const otp = await exports.generateOTP();
//             console.log(`OTP: ${otp}`);
//             const userReferral = await exports.generateReferralCode();

//             const user = new User({
//                 avatar: svgCode,
//                 username,
//                 email,
//                 password: bcrypt.hashSync(password, 8),
//                 createdAt: Date.now(),
//                 balance: 0,
//                 referralCount: 0,
//                 winContest: 0,
//                 lostContest: 0,
//                 totalContest: 0,
//                 matchesWin: 0,
//                 matchesLost: 0,
//                 totalMatches: 0,
//                 winningAmount: 0,
//                 amountUnlisted: 0,
//                 discountBonus: 0,
//                 depositedAmount: 0,
//                 adhaarVerified: "unverified",
//                 panVerified: "unverified",
//                 bankVerified: "unverified",
//                 referral: req?.body?.referral || null,
//                 otp,
//                 userReferral,
//                 phoneNumber: null,
//                 loggedIn: true,
//             });

//             const token = jwt.sign({ id: user.id },
//                 config.secret,
//                 {
//                     algorithm: 'HS256',
//                     allowInsecureKeySizes: true,
//                     expiresIn: 86400 * 365,
//                 });

//             user.accessToken = token;
//             if (req.body.roles) {
//                 user.roles = await Role.findOne({ name: { $in: req.body.roles } }).lead().map((role) => role._id);
//                 await user.save();

//                 res.status(200).send({ message: "User was registered successfully!" });
//             } else {
//                 const role = await Role.findOne({ name: "user" });

//                 user.roles = [role._id];

//                 // await exports.sendOTP(req.body.email, otp);
//                 // // webhooks: send message to slack channel
//                 // await user.save();

//                 // res.status(200).send({ message: "User was registered successfully! but not yet verified.", user: user });

//                 // Call sendOTP with a callback function
//                 exports.sendOTP(req.body.email, otp)
//                     .then(async (result) => {
//                         console.log("OTP sent successfully:", result);
//                         // Save the user and send the response
//                         try {
//                             await user.save(); // Wait for user save operation
//                             res.status(200).send({ message: "OTP sent to your email, use it for verification!", user: user });
//                         } catch (err) {
//                             console.error("Error saving user:", err);
//                             res.status(500).send({ message: "Error saving user", error: err });
//                         }
//                     }).catch((error) => {
//                         console.error("Error sending OTP:", error);
//                         res.status(500).send({ message: "Error sending OTP", error: error });
//                     });
//             }
//         }
//     } catch (error) {
//         console.error("Error saving user:", error);
//         res.status(500).send({ message: "Internal Server Error", error: error });
//     }
// };