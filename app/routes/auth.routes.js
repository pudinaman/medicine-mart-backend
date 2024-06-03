const { verifySignUp } = require("../middlewares/verifySignUp");
const controller = require("../controllers/auth.controller");
const authJwt = require("../middlewares/authJwt");
const multer = require("multer");
// Configure multer to handle the file upload
const storage = multer.memoryStorage(); // Using memory storage for simplicity, you can adjust this based on your needs
const upload = multer({ storage: storage });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");

    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // app.post( "/api/auth/verifyMobile", controller.verifyMobile );

  // Signup User
  app.post(
    "/api/auth/signup",
    // upload.single('profilePicture'),
    [
      // verifySignUp.checkDuplicateUsernameOrEmail,
      // verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  // verify Mobile
  app.post(
    "/api/auth/verifyMobile",
    authJwt.verifyToken,
    controller.verifyMobile
  );
  // send otp mobile
  // app.post("/api/auth/sendOtpMobile", authJwt.verifyToken, controller.sendOtpMobile);
  // reset password
  app.post("/api/auth/resetPassword", controller.resetPassword);
  // resend otp email
  app.post(
    "/api/auth/resendEmailOTP",
    authJwt.verifyToken,
    controller.resendOtpEmail
  );
  // send otp email
  app.post("/sendOTPEmail", authJwt.verifyToken, controller.sendOTPEmail);
  // verify email otp
  app.post("/api/auth/emailVerify", authJwt.verifyToken, controller.verifyOTP);
  // Signin User
  app.post("/api/auth/signin", controller.signin);
  // Update User
  app.put(
    "/api/auth/updateUser/:id",
    authJwt.verifyToken,
    controller.updateUser
  );
  // Get User by ID
  app.get("/api/auth/getUser/:id", authJwt.verifyToken, controller.getUser);
  // Get All Users IDs
  app.get("/api/auth/getAllUserId", controller.getAllUsersId);
  // Upload Profile Picture
  app.post(
    "/api/auth/uploadProfilePicture/:user_id",
    upload.single("profilePicture"),
    authJwt.verifyToken,
    controller.uploadProfilePicture
  );
  // Logout User
  app.post("/api/auth/logout/:user_id", authJwt.verifyToken, controller.logout);
  //Update Users personal info
  app.post(
    "/api/auth/updatePersonalInfo/:user_id",
    authJwt.verifyToken,
    controller.updatePersonalInfo
  );
  //Change user's username

  // POST route to add bank details
  app.post(
    "/api/:user_id/bank-details",
    authJwt.verifyToken,
    controller.addBankDetails
  );
  app.post(
    "/api/auth/changeUsername/:userId",
    authJwt.verifyToken,
    controller.changeUsername
  );

  // app.post('/webhook', async (req, res) => {
  //   try {
  //     const response = await controller.handleWebhookEvent(req, res);
  //     res.status(200).json(response);
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // });

  app.post("/webhook", controller.handleWebhookEvent);

  app.post("/signupWithMobile", controller.signupWithMobile);
  app.post("/verifyMobileOTP", authJwt.verifyToken, controller.verifyMobileOTP);
  app.post("/sentOTPMobile", authJwt.verifyToken, controller.sentOTPMobile);
  app.post("/loginWithMobile", controller.loginWithMobile);
  app.post(
    "/logoutWithMobile",
    authJwt.verifyToken,
    controller.logoutWithMobile
  );
  app.post("/resendMobileOTP", authJwt.verifyToken, controller.resendMobileOTP);
  app.post("/setPassword", authJwt.verifyToken, controller.setPassword);
  app.post("/forgot-password", controller.forgotPassword);

  app.post("/addReview", controller.addReview);
};
