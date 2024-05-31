const orderController = require("../controllers/order.controller");
const authJwt = require("../middlewares/authJwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
 
//Admin Routes  
app.get('/orders', [authJwt.verifyToken, authJwt.isAdmin], orderController.getAllOrders); 
// app.put('/orders/:user_id/:order_id', authJwt.verifyToken, orderController.updateOrder);
// app.delete('/orders/:user_id/:order_id', authJwt.verifyToken, orderController.deleteOrder);

//User Routes
app.post('/orders', authJwt.verifyToken, orderController.createOrder);
app.get('/orders/:user_id/:order_id',  orderController.getOrder);
app.get('/userOrders/:user_id', authJwt.verifyToken, orderController.getAllOrdersByUser);
 

};