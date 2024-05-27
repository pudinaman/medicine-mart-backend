const Coupon = require('../models/coupon.model');

exports.createCoupon = async (req, res) => {
  try {
    const { name, code, discount, expiryDate, couponUsedLimit } = req.body;
    const coupon = await Coupon.create({ name, code, discount, expiryDate, couponUsedLimit });
    res.status(201).send(coupon);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.send(coupons);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.coupon_id);
    if (!coupon) {
      return res.status(404).send({ message: 'Coupon not found' });
    }
    res.send(coupon);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.coupon_id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).send({ message: 'Coupon not found' });
    }
    res.send(coupon);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    // console.log(req.params.coupon_id); 
    const result = await Coupon.deleteOne({ _id: req.params.coupon_id });
    if (result.n === 0) { // if no document was deleted
      return res.status(404).send({ message: 'Coupon not found' });
    }
    res.send({ message: 'Coupon deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
exports.getCouponByCode = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code });
    if (!coupon) {
      return res.status(404).send({ message: 'Coupon not found' });
    }
    res.send({ discount: coupon.discount });
  } catch (err) {
    res.status(500).send(err);
  }
};