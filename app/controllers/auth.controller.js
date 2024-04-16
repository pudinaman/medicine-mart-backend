const config = require("../config/auth.config");
const db = require("../models");
const { slackLogger, webHookURL } = require('../middlewares/webHook')
const User = db.user;
const Role = db.role;
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
const { sendOTPMobile } = require('../../server.js');
const multiavatar = require('@multiavatar/multiavatar');

const remoteConfig = admin.remoteConfig();
let mailTransport; 

(async () => {
  try {
    const template = await remoteConfig.getTemplate();
    const user = template.parameters.user.defaultValue.value;
    const password = template.parameters.pass.defaultValue.value;
   

    mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: password
      }
    });
  } catch (err) {
    console.error('Error fetching Remote Config template:', err);
  }
})();

exports.mailTransport = mailTransport; 

exports.sendMailFrontend = async (req, res) => {
  const { name, email, phone, message } = req.body;

  const mailOptions = {
    from: 'bhaidekh34@gmail.com',
    to: 'bhaidekh34@gmail.com',
    subject: 'New contact form submission from Khud11.com',
    text: `
      Name: ${name}\n
      Email: ${email}\n
      Phone: ${phone}\n
      Message: ${message}\n
    `
  };

  mailTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    }
  });
};


exports.generateUsername = async () => {
  // Define a pool of characters or numbers from which to generate the username
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const usernameLength = 8;
  let username = '';

  do {
    // Generate a random username of length 8
    for (let i = 0; i < usernameLength; i++) {
      username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return username;
    }
    // If the username is taken, reset and generate a new one
    username = '';
  } while (true);
};
/**
 * 
 * @returns err Cast to string failed for value "Promise {248434}" (type promise) at path "otp"
 */
// generate otp function
exports.generateOTP = () => {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); //converted to string to check if error resolves. 
};

exports.verifyMobile = async (req, res) => {
  try {
    const { user_id, otp } = req.body;
    if (!user_id) {
      return res.status(400).send({ message: "user_id is required." });
    } else if (!otp) {
      return res.status(400).send({ message: "OTP is required." });
    }
    const user = await User.findById(user_id);

    if (user.mobileVerified == false) {
      if (user.otp == otp) {
        user.mobileVerified = true;
        await user.save();
        return res.status(200).send({ message: "User's mobile number verified successfully!" });
      } else {
        return res.status(406).send({ message: "OTP is not correct" })
      }
    }
  } catch (error) {
    console.error(`Error verifying mobile number: ${error}`);
    await slackLogger('Error verifying mobile number', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

// Send OTP to the user's email
exports.sendOTP = (email, otp) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: 'bhaidekh34@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for email verification is ${otp}`,
      };
  
      mailTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(error);
          reject(error); // Reject the promise if there's an error
        } else {
          console.log(`Email sent: ${info.response}`);
          resolve(info); // Resolve the promise if OTP is sent successfully
        }
      });
    });
  };
  
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!otp) {
      return res.status(400).send({ message: "OTP is required." });
    }
    // const user = await User.findOne({
    //   email: req.body.email
    // })
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (user.emailVerified == true) {
      return res.status(406).send({ message: "Email is already verified." });
    }

    if (email && !user.emailVerified) {
      if (user.otp == otp) {
        user.emailVerified = true;
        await user.save();
        return res.status(200).send({ message: "User's email verified successfully!" });
      } else if (user.otp !== otp) {
        return res.status(406).send({ message: "OTP is not correct." })
      }
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    await slackLogger('Error verifying OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.signupWithMobile = async (req, res) => {
  try {
    if (req.body) {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).send({ message: "Phone Number is required." });
      }
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).send({ message: "Phone Number is already in use." });
      }
      const username = await exports.generateUsername(phoneNumber);
      // Generate an SVG avatar
      let svgCode = multiavatar(phoneNumber);
      // const otp = exports.generateOTP();
      const userReferral = await exports.generateReferralCode();
      const user = new User({
        avatar: svgCode,
        username,
        phoneNumber,
        // password: bcrypt.hashSync(password, 8),
        createdAt: Date.now(),
        // balance: 0,
        // referralCount: 0,
        // winContest: 0,
        // lostContest: 0,
        // totalContest: 0,
        // matchesWin: 0,
        // matchesLost: 0,
        // totalMatches: 0,
        // winningAmount: 0,
        // amountUnlisted: 0,
        // discountBonus: 0,
        // depositedAmount: 0,
        adhaarVerified: "unverified",
        panVerified: "unverified",
        bankVerified: "unverified",
        referral: req?.body?.referral || null,
        // otp,
        userReferral,
        email: null,
      });

      const token = jwt.sign({ id: user.id },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400 * 365,
        });

      user.accessToken = token;
      if (req.body.roles) {
        user.roles = await Role.findOne({ name: { $in: req.body.roles } }).lead().map((role) => role._id);
        await user.save();

        res.status(200).send({ message: "User was registered successfully!", user_id: user._id, accessToken: user.accessToken });
      } else {
        const role = await Role.findOne({ name: "user" });

        user.roles = [role._id];

        await user.save();
        await sendOTPMobile(phoneNumber.toString(), user._id);

        res.status(200).send({ message: "User was registered successfully! but not yet verified.", user_id: user._id, accessToken: user.accessToken });
      }
    }
  } catch (error) {
    console.error("Error saving user:", error);
    await slackLogger('Error saving user', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

exports.sentOTPMobile = async (req, res) => {
  try {
    if (req?.body) {
      const { phoneNumber, user_id } = req.body;
      if (!phoneNumber) {
        return res.status(400).send({ message: "Phone Number is required." });
      }
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).send({ message: "Phone Number is already in use." });
      }
      if (!user_id) {
        return res.status(400).send({ message: "user_id is required." });
      }
      await sendOTPMobile(phoneNumber.toString(), user_id);
      return res.status(200).send({ message: "OTP sent successfully!" });
    }
  } catch (error) {
    console.error("Error sending OTP: ", error);
    await slackLogger('Error sending OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.verifyMobileOTP = async (req, res) => {
  try {
    if (req?.body) {
      const { user_id, otp } = req.body;
      if (!user_id) {
        return res.status(400).send({ message: "user_id is required." });
      }
      if (!otp) {
        return res.status(400).send({ message: "OTP is required." });
      }
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      if (user) {
        if (user.mobileVerified == false && user.otp) {
          if (user.otp == otp) {
            user.mobileVerified = true;
            await user.save();
            return res.status(200).send({ message: "User's mobile number verified successfully!", user_id: user._id, accessToken: user.accessToken });
          } else {
            return res.status(400).send({ message: "OTP is not correct." });
          }
        } else if (user.mobileVerified == true) {
          if (user.otp == otp) {
            user.loggedIn = true;
            await user.save();
            return res.status(200).send({ message: "User is verified and logged in successfully!", user_id: user._id, accessToken: user.accessToken });
          } else if (user.otp !== otp) {
            return res.status(400).send({ message: "OTP is not correct." });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error verifying mobile OTP: ", error);
    await slackLogger('Error verifying mobile OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.loginWithMobile = async (req, res) => {
  try {
    if (req?.body) {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).send({ message: "Phone Number is required." });
      }
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      // if (user.loggedIn == true) {
      //   return res.status(400).send({ message: "User is already logged in." });
      // }
      const token = jwt.sign({ id: user.id },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400 * 365,
        });
      user.accessToken = token;
      const response = await sendOTPMobile(phoneNumber.toString(), user._id);
      if (response.status == 200) {
        user.loggedIn = true;
      }
      await user.save();
      return res.status(200).send({ message: "OTP sent successfully!", user_id: user._id, accessToken: user.accessToken });
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 400) {
        // Handle 400 status code error
        console.error('Error: Request failed with status code 400');
        console.error('Error message:', error.response.data.message);
        // Handle specific error message
        if (error.response.data.message === 'Spamming detected (sending multiple sms to same number is not allowed)') {
          // Handle the specific error scenario
          console.error('Spamming detected. Please try again later.');
          await slackLogger('Spamming detected', 'Spamming detected. Please try again later.', error, null, webHookURL);
          res.status(400).send({ message: 'Spamming detected. Please try again later.' });
        }
      } else {
        // Handle other status codes
        console.error('Error: Request failed with status code', error.response.status);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error: No response received from the server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error logging in user: ", error);
      await slackLogger('Error logging in user', error.message, error, null, webHookURL);
      res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
  }
}

exports.logoutWithMobile = async (req, res) => {
  try {
    if (req?.body) {
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).send({ message: "user_id is required." });
      }
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      user.accessToken = null;
      user.loggedIn = false;
      await user.save();
      res.status(200).send({ message: "User was logged out successfully!" });
    }
  } catch (error) {
    console.error("Error logging out user: ", error);
    await slackLogger('Error logging out user', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.resendMobileOTP = async (req, res) => {
  try {
    if (req?.body) {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).send({ message: "Phone Number is required." });
      }
      const user = await User.findOne({ phoneNumber: phoneNumber });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      const responseData = await sendOTPMobile(phoneNumber.toString(), user._id);
      if (responseData && responseData.data.return == true) {
        return res.status(200).send({ message: "OTP sent successfully!" });
      } else {
        return res.status(500).send({ message: "Error sending OTP." });
      }
    }
  } catch (error) {
    console.error("Error resending mobile OTP: ", error);
    await slackLogger('Error resending mobile OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.signup = async (req, res) => {
  try {
    if (req.body) {
      const { email, password } = req.body;
      if (!email || !password) {
        console.log(`Error ${res.status}: User not found.`);
        return res.status(400).send({ message: "Email and Password are required." });
      }
      const username = await exports.generateUsername(email);
      // Generate an SVG avatar
      let svgCode = multiavatar(email);
      const otp = await exports.generateOTP();
      console.log(`OTP: ${otp}`);
    //   const userReferral = await exports.generateReferralCode();

      const user = new User({
        avatar: svgCode,
        username,
        email,
        password: bcrypt.hashSync(password, 8),
        createdAt: Date.now(),
        // balance: 0,
        // referralCount: 0,
        // winContest: 0,
        // lostContest: 0,
        // totalContest: 0,
        // matchesWin: 0,
        // matchesLost: 0,
        // totalMatches: 0,
        // winningAmount: 0,
        // amountUnlisted: 0,
        // discountBonus: 0,
        // depositedAmount: 0,
        adhaarVerified: "unverified",
        panVerified: "unverified",
        bankVerified: "unverified",
        referral: req?.body?.referral || null,
        otp,
        // userReferral,
        phoneNumber: null,
        loggedIn: true,
      });

      const token = jwt.sign({ id: user.id },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400 * 365,
        });

      user.accessToken = token;
      if (req.body.roles) {
        // user.roles = await Role.findOne({ name: { $in: req.body.roles } }).lead().map((role) => role._id);
        const roles = await Role.find({ name: { $in: req.body.roles } });
  user.roles = roles.map((role) => role._id);
        await user.save();

        res.status(200).send({ message: "User was registered successfully!" });
      } else {
        const role = await Role.findOne({ name: "user" });

        user.roles = [role._id];

        // await exports.sendOTP(req.body.email, otp);
        // // webhooks: send message to slack channel
        // await user.save();

        // res.status(200).send({ message: "User was registered successfully! but not yet verified.", user: user });

        // Call sendOTP with a callback function
        exports.sendOTP(req.body.email, otp)
          .then(async (result) => {
            console.log("OTP sent successfully:", result);
            // Save the user and send the response
            try {
              await user.save(); // Wait for user save operation
              res.status(200).send({ message: "OTP sent to your email, use it for verification!", user: user });
            } catch (err) {
              console.error("Error saving user:", err);
              res.status(500).send({ message: "Error saving user", error: err });
            }
          }).catch((error) => {
            console.error("Error sending OTP:", error);
            res.status(500).send({ message: "Error sending OTP", error: error });
          });
      }
    }
  } catch (error) {
    console.error("Error saving user:", error);
    await slackLogger('Error saving user', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

// this is for email verification purpose only
exports.sendOTPEmail = async (req, res) => {
  try {
    if (req?.body?.email) {
      const otp = exports.generateOTP();
      exports.sendOTP(req.body.email, otp);
      const user = await User.findOne({ _id: req.body.user_id });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      if (user) {
        user.email = req.body.email;
        user.otp = otp;
        user.save();
        return res.status(200).send({ message: "OTP sent successfully!" });
      }
    }
  } catch (error) {
    console.log("Error sending OTP: ", error);
    await slackLogger('Error sending OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

exports.resendOtpEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required." });
    }
    const user = await User.findOne({
      email: req.body.email
    })
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (user && user.emailVerified == false) {
      const otp = await exports.generateOTP();
      user.otp = otp;
      await user.save();
      exports.sendOTP(email, otp);
      return res.status(200).send({ message: "OTP has been sent to your email." });

    } else if (user.emailVerified == true) {
      return res.status(406).send({ message: "Email is already verified." });
    }
  } catch (error) {
    console.error("Error resending OTP: ", error);
    await slackLogger('Error resending OTP', error.message, error, null, webHookURL);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign(
        { id: user.id },
        config.secret,
        {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 86400 // 24 hours
        }
      );

      // const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

      // Assuming you have a field to store the token in the User model, you can update it like this:
      user.accessToken = token;
      user.loggedIn = true;
      // Then save the updated user
      user.save();

      res.status(200).send({
        message: `${user.username} logged in successfully!`,
        id: user._id,
        accessToken: token
      });
    })
    .catch(async (err) => {
      console.error('Error:', err);
      await slackLogger('Error signing in the user.', err.message, err, null, webHookURL);
      res.status(500).send({ message: 'Internal Server Error', err: err.message });
    });
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const updateData = req.body;
    if (!userId || !updateData) {
      return res.status(400).json({ message: 'userId and updateData are required' });
    }
    const arrayFields = ['winContest', 'lostContest', 'totalContest'];
    arrayFields.forEach(field => {
      if (updateData[field] && !Array.isArray(updateData[field])) {
        updateData[field] = [updateData[field]];
      }
    });

    // let time = new Date.now();
    // updateData.updatedAt = time;
    updateData.updatedAt = Date.now();

    // Use findByIdAndUpdate to update user data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run validators on update
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User Updated Successfully: ${JSON.stringify(updatedUser)}`);
    return res.status(200).json({ message: 'User updated successfully!', user_id: userId });
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    await slackLogger('Error updating user', error.message, error, null, webHookURL);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;

    // Check if all required fields are provided
    if (!email || !current_password || !new_password) {
      return res.status(400).send({ message: "email, current_password, and new_password are required." });
    }

    // Find the user based on the provided user_id
    const user = await User.findOne({ email: email });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Check if the current password matches the one in the database
    const isPasswordValid = bcrypt.compare(current_password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Current password is incorrect." });
    }

    // Hash the new password and update user's password in the database
    user.password = bcrypt.hashSync(new_password, 8);
    await user.save();

    // Send success response
    return res.status(200).send({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password: ", error);
    await slackLogger('Error resetting password', error.message, error, null, webHookURL);
    return res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).send({ message: "email and password are required." });
    }

    // Find the user based on the provided user_id
    const user = await User.findOne({ email: email });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.password) {
      return res.status(400).send({ message: "Password already set." });
    }
    // Hash the new password and update user's password in the database
    user.password = bcrypt.hashSync(password, 8);
    await user.save();

    // Send success response
    return res.status(200).send({ message: "Password set successfully." });
  } catch (error) {
    console.error("Error setting password: ", error);
    await slackLogger('Error setting password', error.message, error, null, webHookURL);
    return res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
}

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({ message: 'userId is required' });
    }
    // Use findById to get user data and populate the fantasyTeams field
    // const cacheKey = `user_${userId}`;
    // if (nodeCache.has(cacheKey)) {
    //   console.log(`User Fetched Successfully`);
    //   return res.status(200).send(JSON.parse(nodeCache.get(cacheKey)));
    // } else {
      const user = await User.findById(userId).populate('fantasyTeam').select('-transactionHistory');
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      // nodeCache.set(cacheKey, JSON.stringify(user), 300);
      // console.log(user.fantasyTeam);
      // console.log(`User Fetched Successfully`);
      return res.status(200).send(user);
    // }
    // Now, user.fantasyTeams should contain the populated FantasyTeam objects
  } catch (error) {
    console.error('Error getting user:', error);
    await slackLogger('Error getting user', error.message, error, null, webHookURL);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getAllUsersId = async (req, res) => {
  try {
    const users = await User.find().select('_id').lean();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No Users Found" });
    }
    const userIds = users.map(user => user._id.toString());
    console.log(`User IDs Retrieved Successfully: ${JSON.stringify(userIds)}`);
    return res.status(200).json(userIds);
  } catch (error) {
    console.error('Error retrieving user IDs:', error);
    await slackLogger('Error retrieving user IDs', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

const fs = require('fs').promises;

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    const imageBase64 = req.file.buffer.toString('base64');
    if (!req.params.user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = req.params.user_id;
    // Use await to execute the query and get the user instance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Save image to database
    user.profilePicture = imageBase64;
    await user.save();
    // Save image to a folder on the server
    const imagePath = `./uploads/profilePicture/${userId}_profile_picture.png`; // Adjust the path as needed
    await fs.writeFile(imagePath, req.file.buffer);
    return res.status(200).json({ message: 'Profile picture uploaded successfully'});
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    await slackLogger('Error uploading profile picture', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.uploadAdhaar = async (req, res) => {
  try {
    
    console.log(req.body);
    console.log(req.body.length);
    const name = req.body.name;
    const dob = req.body.dob;
    const adhaarNumber = req.body.adhaarNumber;
    const adhaarFrontImage = req.body.adhaarFrontImage;
    const adhaarBackImage = req.body.adhaarBackImage;
    if (!name || !dob || !adhaarNumber) {
      return res.status(400).json({ message: 'Name, DOB, and Aadhaar number are required' });
    }
    if (!req.params.user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = req.params.user_id;

    // Use await to execute the query and get the user instance
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // const cacheKey = `user_${userId}`;
    // nodeCache.del(cacheKey);
    const time = Date.now(); // current time in milliseconds
    // Save Aadhaar image to database
    user.adhaarFrontImage = adhaarFrontImage;
    user.adhaarBackImage = adhaarBackImage;
    user.adhaarNumber = req.body.adhaarNumber;
    user.updatedAt = time;
    user.name = name;
    user.dob = dob;
    user.adhaarVerified = "in progress",
      await user.save();
    //  nodeCache.set(cacheKey, JSON.stringify(user), 300);  // Cache for 5 minutes  

    return res.status(200).json({ message: 'Aadhaar uploaded successfully and is currently under verification.' });
  } catch (error) {
    console.error('Error uploading Aadhaar picture:', error);
    await slackLogger('Error uploading Aadhaar picture', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.uploadPan = async (req, res) => {
  try {
    const time = Date.now(); // current time in milliseconds
    const name = req.body.name;
    const dob = req.body.dob;
    const panNumber = req.body.panNumber;
    const panPhoto = req.body.panPhoto;
    if (!name || !dob || !panNumber) {
      return res.status(400).json({ message: 'Name, DOB, and Pan number are required' });
    }
    if (!req.params.user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = req.params.user_id;
    // Use await to execute the query and get the user instance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // const cacheKey = `user_${userId}`;
    // nodeCache.del(cacheKey);
    // Save Aadhaar image to database
    user.panPhoto = panPhoto;
    user.panNumber = req.body.panNumber;
    user.updatedAt = time;
    user.name = name;
    user.dob = dob;
    user.panVerified = "in progress",
      await user.save();
    // nodeCache.set(cacheKey, JSON.stringify(user), 300);  // Cache for 5 minutes  

    return res.status(200).json({ message: 'Pan uploaded successfully and is currently under verification.'});
  } catch (error) {
    console.error('Error uploading Pan picture:', error);
    await slackLogger('Error uploading Pan picture', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    console.log('Starting logout process...');
    const userId = req.params.user_id;
    console.log('User ID from request parameters:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found');
    user.accessToken = null;
    console.log('Setting accessToken to null...');
    await user.save();
    console.log('User saved successfully.');
    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    await slackLogger('Error logging out user', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const updateData = req.body;

    let time = Date.now(); // current time in milliseconds
    updateData.updatedAt = time;

    // Use findByIdAndUpdate to update user data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run validators on update
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedFields = Object.keys(updateData)
      .reduce((obj, key) => {
        obj[key] = updatedUser[key];
        return obj;
      }, {});

    console.log(`User Updated Successfully: ${JSON.stringify(updatedFields)}`);
    return res.status(200).json(updatedFields);
  } catch (error) {
    console.error('Error updating user:', error);
    await slackLogger('Error updating user', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// exports.referAndEarn = async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     if (userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Check if the user already has a referral code assigned
//     if (user.referral) {
//       return res.status(400).json({ message: 'User already has a referral code assigned' });
//     }
//     if (!req.body.referral) {
//       return res.status(400).json({ message: 'Referral code is required' });
//     }
//     const referralCode = req.body.referral;
//     const referralUser = await User.findOne({ userReferral: referralCode });
//     if (!referralUser) {
//       return res.status(404).json({ message: 'Referral code not found' });
//     }
//     if (referralCode === user.userReferral) {
//       return res.status(404).json({ message: 'Self Referral Code not allowed' });
//     }
//     // Save the referral code to the user who used it
//     user.referral = referralCode;
//     referralUser.referralCount += 1;
//     const bonusAmount = 100;
//     referralUser.bonus = referralUser.bonus || 0;
//     referralUser.bonus += bonusAmount;
//     user.bonus = user.bonus || 0;
//     user.bonus += bonusAmount;
//     const referenceId = generateRandomReferenceId();
//     const bonusTransaction = {
//       id: referenceId,
//       transaction_type: 'bonus',
//       amount: bonusAmount,
//       entity: 'Bonus',
//       description: `Bonus Earned From Referral`,
//       timestamp: new Date()
//     };
//     // referralUser.transactionHistory.total_balance.push(bonusTransaction);
//     referralUser.transactionHistory.bonus.push(bonusTransaction);
//     user.transactionHistory.bonus.push(bonusTransaction);
//     // user.transactionHistory.total_balance.push(bonusTransaction);
//     await Promise.all([referralUser.save(), user.save()]);
//     return res.status(200).json({ message: 'Referral code found for the user', Bonus: `${bonusAmount}` });
//   } catch (error) {
//     console.error('Error updating referral code:', error);
//     await slackLogger('Error updating referral code', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// function generateRandomReferenceId() {
//   try {
//     const prefix = 'REF_';
//     const randomString = crypto.randomBytes(5).toString('hex');
//     return prefix + randomString;
//   } catch (err) {
//     console.error('Error generating random reference ID:', err);
//     return null;
//   }
// }

// exports.addBalanceToAccount = async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     const {
//       id,
//       entity,
//       amount,
//       currency,
//       status,
//       order_id,
//       invoice_id,
//       international,
//       method,
//       amount_refunded,
//       refund_status,
//       captured,
//       description,
//       card_id,
//       bank,
//       wallet,
//       vpa,
//       email,
//       contact,
//       fee,
//       tax,
//       error_code,
//       error_description,
//       error_source,
//       error_step,
//       error_reason,
//       acquirer_data,
//       created_at
//     } = req.body;

//     // Validate the request body
//     if (!id || !entity || !amount || !currency || !status) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }
//     // Find the user by userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Log the transaction
//     const transaction = {
//       id: id,
//       entity: entity,
//       amount: parseFloat(amount) / 100,
//       currency: currency,
//       status,
//       order_id: order_id,
//       invoice_id: invoice_id,
//       international: international,
//       method: method,
//       amount_refunded: parseFloat(amount_refunded) / 100,
//       refund_status: refund_status,
//       captured: captured,
//       description: description,
//       card_id: card_id,
//       bank: bank,
//       wallet: wallet,
//       vpa: vpa,
//       email: email,
//       contact: contact,
//       fee: fee,
//       tax: tax,
//       error_code: error_code,
//       error_description: error_description,
//       error_source: error_source,
//       error_step: error_step,
//       error_reason: error_reason,
//       acquirer_data: acquirer_data,
//       created_at: created_at || Date.now(), // If created_at is not provided, use the current date
//     };

//     // // Push transaction to appropriate subarray based on transaction type
//     // if (status == 'failed') {
//     //   user.transactionHistory.depositfail.push(transaction); 
//     // } else {
//     //   user.transactionHistory.depositsuccess.push(transaction);
//     // }

//     user.transactionHistory.deposit.push(transaction);

//     // If the transaction status is not "failed", add the amount to the user's balance
//     if (status !== 'failed') {
//       user.transactionHistory.total_balance.push(transaction);
//       user.depositedAmount += parseFloat(amount) / 100;
//       user.balance += parseFloat(amount) / 100;
//       console.log(`Amount added to balance: ${amount}`);
//     }

//     // Save the updated user
//     await user.save();
//     console.log(`Balance updated successfully. New balance: ${user.balance}`);

//     // Log the payment method used
//     console.log(`Payment method used: ${method}`);

//     // Send a success response
//     return res.status(200).json({ message: 'Balance updated successfully', balance: user.balance });
//   } catch (error) {
//     console.error('Error updating balance:', error);
//     await slackLogger('Error verifying mobile number', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'An error occurred' });
//   }
// };

// exports.withdrawalRequest = async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     const { id, entity, amount, currency, status, order_id, invoice_id, international, method, amount_refunded, refund_status, captured, description, card_id, bank, wallet, vpa, email, contact, fee, tax, error_code, error_description, error_source, error_step, error_reason, acquirer_data, created_at } = req.body;

//     // Validate the request body
//     if (!id || !entity || !amount) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     if (amount === 0) {
//       return res.status(400).json({ message: 'Amount cannot be zero' });
//     }
//     // Find the user by userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if the user has enough balance
//     if (amount > user.balance) {
//       return res.status(400).json({ message: 'Insufficient balance' });
//     }

//     // Subtract the amount from the user's balance
//     user.balance -= amount;

//     // Log the withdrawal transaction
//     const transaction = {
//       id: id,
//       entity: entity,
//       amount: -parseFloat(amount),
//       currency: currency,
//       status: status,
//       order_id: order_id,
//       invoice_id: invoice_id,
//       international: international,
//       method: method,
//       amount_refunded: amount_refunded,
//       refund_status: refund_status,
//       captured: captured,
//       description: description,
//       card_id: card_id,
//       bank: bank,
//       wallet: wallet,
//       vpa: vpa,
//       email: email,
//       contact: contact,
//       fee: fee,
//       tax: tax,
//       error_code: error_code,
//       error_description: error_description,
//       error_source: error_source,
//       error_step: error_step,
//       error_reason: error_reason,
//       acquirer_data: acquirer_data,
//       created_at: created_at || Date.now() // If created_at is not provided, use the current date
//     };
//     user.transactionHistory.withdrawal.push(transaction);
//     user.transactionHistory.total_balance.push(transaction);
//     // Save the updated user
//     await user.save();

//     // Log the payment method used
//     console.log(`Payment method used for withdrawal: ${method}`);

//     // Send a success response
//     return res.status(200).json({ message: 'Withdrawal request sent successfully', balance: user.balance });
//   } catch (error) {
//     console.error(error);
//     await slackLogger('Withdrawal request error', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'An error occurred' });
//   }
// };

// exports.playingOverview = async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     if (!userId) { return res.status(400).json({ message: 'userId is required' }); }
//     // Find the user by userId
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Send User's winContest, lostConstest. totalContest, matchesWin, matchesLost, totalMatches as response
//     return res.status(200).json({
//       user_id: user._id,
//       winContest: user.winContest,
//       lostContest: user.lostContest,
//       totalContest: user.totalContest,
//       matchesWin: user.matchesWin,
//       matchesLost: user.matchesLost,
//       totalMatches: user.totalMatches,
//     });

//   } catch (error) {
//     console.error(error);
//     await slackLogger('playingOverview error', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'An error occurred' });
//   }
// };


exports.generateReferralCode = async function () {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 6; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const referralExisting = await User.findOne({ userReferral: referralCode }).select('userReferral');
    if (referralExisting) {
      exports.generateReferralCode();
    }
    console.log('Referral code:', referralCode);
    return referralCode;
  } catch (err) {
    console.log(err);
    await slackLogger('Error generating referral code', err.message, err, null, webHookURL);
    return null;
  }
}

// exports.getAllUsersSortedByMaxTotalPoints = async (req, res) => {
//   try {
//     // Aggregate to find the maximum total_points for each user
//     const userMaxPoints = await FantasyTeam.aggregate([
//       {
//         $group: {
//           _id: "$user_id",
//           maxTotalPoints: { $max: "$total_points" },
//         },
//       },
//     ]);

//     // Sort users by their maximum total points in descending order
//     const sortedUsers = await Promise.all(
//       userMaxPoints.map(async (userPoints) => {
//         const user = await User.findById(userPoints._id);
//         return {
//           userId: userPoints._id,
//           // userName: user.username, // Change this based on your user schema
//           maxTotalPoints: userPoints.maxTotalPoints,
//         };
//       })
//     );

//     // Sort the users in descending order of maxTotalPoints
//     sortedUsers.sort((a, b) => b.maxTotalPoints - a.maxTotalPoints);

//     res.status(200).json(sortedUsers);
//   } catch (error) {
//     console.error('Error getting and sorting users:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// exports.getMaxTotalPointsByUserAndMatch = async (req, res) => {
//   const matchId = req.params.match_id;

//   try {
//     const maxTotalPointsByUserAndMatch = await FantasyTeam.aggregate([
//       // Match only documents with the specified match_id
//       { $match: { match_id: matchId } },
//       // Group by user_id and find the maximum total_points
//       {
//         $group: {
//           _id: {
//             user_id: "$user_id",
//             team_id: "$_id",
//           },
//           maxTotalPoints: { $max: "$total_points" },
//         },
//       },
//       // Sort by maxTotalPoints in descending order
//       { $sort: { maxTotalPoints: -1 } },
//       // Optionally, add a $lookup stage to fetch user details
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id.user_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },

//       {
//         $project: {
//           _id: 0,
//           user_id: "$_id.user_id",
//           team_id: "$_id.team_id",
//           username: { $arrayElemAt: ["$user.username", 0] },
//           maxTotalPoints: 1,
//         },
//       },
//     ]);

//     res.status(200).json(maxTotalPointsByUserAndMatch);
//   } catch (error) {
//     console.error('Error fetching max total points by user and match:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// exports.getMaxTotalPointsByUserAndContest = async (req, res) => {
//   const contestId = req.params.contest_id;

//   try {
//     const maxTotalPointsByUserAndContest = await FantasyTeam.aggregate([
//       // Match only documents with the specified contest_id
//       { $match: { contest_id: contestId } },
//       // Group by user_id and find the maximum total_points
//       {
//         $group: {
//           _id: {
//             user_id: "$user_id",
//             team_id: "$_id",
//           },
//           maxTotalPoints: { $max: "$total_points" },
//         },
//       },
//       // Sort by maxTotalPoints in descending order
//       { $sort: { maxTotalPoints: -1 } },

//       {
//         $lookup: {
//           from: "users",
//           localField: "_id.user_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },

//       {
//         $project: {
//           _id: 0,
//           user_id: "$_id.user_id",
//           team_id: "$_id.team_id",
//           username: { $arrayElemAt: ["$user.username", 0] },
//           maxTotalPoints: 1,
//         },
//       },
//     ]);

//     res.json(maxTotalPointsByUserAndContest);
//   } catch (error) {
//     console.error('Error fetching max total points by user and contest:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// exports.getUserDetailsById = async (req, res) => {
//   const userId = req.params.user_id;

//   try {
//     // Find the user by userId
//     const user = await User.findById(userId).populate('fantasyTeam');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }



//     res.json(user);
//     console.log(`User Details Fetched Successfully: ${JSON.stringify(user)}`);
//   } catch (error) {
//     console.error('Error getting user details:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// exports.getTransactionHistory = async (req, res) => {
//   try {
//     const userId = req.params.user_id; // Get the user ID from the request parameters
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }
//     // Find the user by ID
//     const user = await User.findById(userId).select('transactionHistory');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Return the user's transaction history
//     return res.status(200).json({ transactionHistory: user.transactionHistory });
//   } catch (error) {
//     console.error('Error fetching transaction history:', error);
//     await slackLogger('Error fetching transaction history', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

exports.addBankDetails = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const { bankAccountNumber, bankName, ifscCode, branchName, accountHolderName } = req.body;
    if (!bankAccountNumber || !ifscCode || !accountHolderName) {
      return res.status(400).json({ message: 'Name, DOB, and Aadhaar number are required' });
    }
    // Find the user by userId
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's bank details
    user.bankAccountNumber = bankAccountNumber;
    user.bankName = bankName;
    user.ifscCode = ifscCode;
    user.branchName = branchName;
    user.accountHolderName = accountHolderName;
    user.bankVerified = "in progress",

      // Save the updated user
      await user.save();

    return res.status(200).json({ message: 'Bank details added successfully', bankHolderName: user.accountHolderName, bankAccountNumber: user.bankAccountNumber, ifscCode: user.ifscCode, bankVerified: user.bankVerified });
  } catch (error) {
    console.error('Error adding bank details:', error);
    await slackLogger('Error adding bank details', error.message, error, null, webHookURL);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// exports.getTransactions = async (req, res) => {
//   try {
//     const userId = req.params.user_id;
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }
//     const user = await User.findById(userId).select('transactionHistory');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const { type } = req.query; // type parameter specifies the type of transaction history to fetch

//     let transactionHistory;
//     switch (type) {
//       case 'deposit':
//         transactionHistory = user.transactionHistory.deposit;
//         break;
//       case 'contestFee':
//         transactionHistory = user.transactionHistory.contestfee;
//         break;
//       case 'winningAmount':
//         transactionHistory = user.transactionHistory.winningAmount;
//         break;
//       case 'totalBalance':
//         transactionHistory = user.transactionHistory.total_balance;
//         break;
//       case 'bonus':
//         transactionHistory = user.transactionHistory.bonus;
//         break;
//       case 'withdrawal':
//         transactionHistory = user.transactionHistory.withdrawal;
//         break;
//       default:
//         transactionHistory = user.transactionHistory;
//         break;
//     }

//     return res.status(200).json({ transactionHistory });
//   } catch (error) {
//     console.error('Error fetching transaction history:', error);
//     await slackLogger('Error fetching transaction history', error.message, error, null, webHookURL);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

exports.handleWebhookEvent = async function (req, res) {
  try {
    console.log('Webhook event started.');
    // const event = req.body.event;
    // const payload = req.body.payload;
    const entityData = req.body.payload.payment.entity;
    const error_code = entityData.error_code;
    const amount = entityData.amount;
    const userId = entityData.notes.user_id;


    // await newEvent.save();
    const user = await User.findById(userId);
    if (user) {
      user.transactionHistory.deposit.push({ ...entityData, amount: amount / 100 });

      if (error_code == null || error_code == "null") {
        user.transactionHistory.total_balance.push({ ...entityData, amount: amount / 100 });
        user.depositedAmount += parseFloat(amount) / 100;
        user.balance += parseFloat(amount) / 100;
        console.log(`Amount added to balance: ${amount}`);
      }
      await user.save();
    } else {
      console.log('User not found.');
    }

    console.log('User ID:', userId);
    return res.status(200).json({ message: 'Webhook event received and stored successfully' });
  } catch (error) {
    await slackLogger('Error processing paymentwebhook event', error.message, error, null, webHookURL);
    console.error('Error processing paymentwebhook event:', error);
    throw new Error('Internal server error');
  }
}

// // Function to generate a secure random password
async function generateSecurePassword() {
  try {
    const uppercaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseCharset = "abcdefghijklmnopqrstuvwxyz";
    const numberCharset = "0123456789";
    const specialCharset = "@#$";

    let password = "";
    let charsets = [uppercaseCharset, lowercaseCharset, numberCharset, specialCharset];

    for (let i = 0; i < 8; i++) {
      let randomCharset = charsets[Math.floor(Math.random() * charsets.length)];
      password += randomCharset.charAt(Math.floor(Math.random() * randomCharset.length));
    }
    return password;
  } catch (err) {
    console.log(err);
    await slackLogger('Error generating secure password', err.message, err, null, webHookURL);
    return null;
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const temporaryPassword = generateSecurePassword(8);
    const hashedPassword = bcrypt.hashSync(temporaryPassword, 8);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: 'bhaidekh34@gmail.com',
      to: email,
      subject: 'Temporary Password',
      // text: `Your temporary password is: ${temporaryPassword}. Please login using this temporary password and change it immediately after logging in.`
      html: `<p>Your temporary password is: <strong>${temporaryPassword}</strong> Please login using this temporary password and change it immediately after logging in.</p>`
    };

    mailTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send({ message: "Failed to send temporary password via email." });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).send({ message: "Temporary password sent to your email." });
      }
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    await slackLogger('Error in forgot password', error.message, error, null, webHookURL);
    return res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};


exports.getAdhaarDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id)
      .select('name dob adhaarNumber adhaarFrontImage adhaarBackImage adhaarVerified')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user details:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getPanDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id)
      .select('name dob panNumber panPhoto panVerified')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user details:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};