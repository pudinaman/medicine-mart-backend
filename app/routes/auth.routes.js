module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Signup User
    // app.post(
    //     "/api/auth/signup",
    //     // upload.single('profilePicture'),
    //     [
    //         verifySignUp.checkDuplicateUsernameOrEmail,
    //         verifySignUp.checkRolesExisted
    //     ],
    //     controller.signup
    // );

};