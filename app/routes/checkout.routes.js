const checkoutController = require("../controllers/checkout.controller");
const authJwt = require("../middlewares/authJwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin","http://localhost:3000","http://127.0.0.1:5501");

    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //Admin Routes
  app.put('/updateCheckout/:id', [authJwt.verifyToken, authJwt.isAdmin], checkoutController.updateCheckout);
  app.delete('/deleteCheckout/:id', [authJwt.verifyToken, authJwt.isAdmin], checkoutController.deleteCheckout);
  app.get('/getAllCheckouts', [authJwt.verifyToken, authJwt.isAdmin], checkoutController.getAllCheckouts);

  //User Routes
  app.post('/proceed-to-checkout', authJwt.verifyToken, checkoutController.createCheckout);
  app.get('/getCheckout/:id', authJwt.verifyToken, checkoutController.getCheckout); 
  
};





