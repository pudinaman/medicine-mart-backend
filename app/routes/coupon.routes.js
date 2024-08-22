const couponController = require('../controllers/coupon.controller');
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
app.post('/addCoupon', [authJwt.verifyToken, authJwt.isAdmin], couponController.createCoupon);
app.get('/getCoupons', [authJwt.verifyToken, authJwt.isAdmin],couponController.getAllCoupons);
app.get('/getCoupon/:coupon_id', [authJwt.verifyToken, authJwt.isAdmin], couponController.getCouponById);
app.delete('/deleteCoupon/:coupon_id', [authJwt.verifyToken, authJwt.isAdmin], couponController.deleteCoupon);
app.put('/updateCoupon/:coupon_id', [authJwt.verifyToken, authJwt.isAdmin], couponController.updateCoupon);

app.get('/coupon/:code', couponController.getCouponByCode);

};

