const controller = require('../controllers/firebaseAuth.controller');
module.exports = function (app) {
    app.use(function (req, res, next) {    
      res.header("Access-Control-Allow-Origin", "https://wayumart-9e794.web.app");

      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept", "https://wayumart-9e794.web.app"
      );
      next();
    });

app.post('/authenticate', controller.authController);

};
