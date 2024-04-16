const billingController = require("../controllers/billing.controller");
const authJwt = require("../middlewares/authJwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
 

app.post('/billing', authJwt.verifyToken, billingController.createBilling);
app.get('/billing/:user_id', authJwt.verifyToken, billingController.getBillingByUserId);
// app.put('/billing/:user_id', authJwt.verifyToken, billingController.updateBilling);
app.delete('/billing/:user_id', authJwt.verifyToken, billingController.deleteBilling);
 
};