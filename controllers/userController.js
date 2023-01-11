const express = require('express');
const userHelper = require('../helpers/user-helper');
const adminHelper = require('../helpers/admin-helper');
const router = express.Router();
const session = require('express-session');
// const twilio = require('twilio');
// const client = new twilio(accountSID, authToken);
const accountSID = 'AC70b196fad3b0419ced7fd85f856208de';
const authToken = '366a275850f1947b2b8562922d92dec6';
const serviceSID = 'VAfbf72f3bfe969b61faf5df7fe2d1e856';

const client = require('twilio')(accountSID, authToken);
const twilio = require('twilio');
const { response } = require('express');


module.exports = {

  homePage: async function(req, res, next) {
    let user = req.session.user;
    userHelper.getCartCount().then((cartCount)=>{
      console.log(cartCount);
    })
    let cartCount = req.session.cartCount;
    // let cartCount = null; 
    // if(req.session.user){
    //   cartCount =  await userHelper.getCartCount(req.session.user._id)
    // }
    adminHelper.getAllProducts().then((products) => {
      res.render('index', { user, products, cartCount, home: true});
    });
  },

  //LOGIN
  loginPage: function (req, res) {

    if (req.session.loggedIn) {
      res.redirect('/');
    } else {
      res.render('user/login');
    }
  },

  loginPost: function (req, res) {
    userHelper.doLogin(req.body).then((response) => {

      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.validUser;
        res.redirect('/');
      } else {
        res.render('user/login', { loginErr: true });
      }
    });
  },

  //OTP LOGIN
  otpLogin: function (req, res) {

    if (req.session.loggedIn) {
      res.redirect('/');
    } else {
      res.render('user/otp-login');
    }
  },


  verifyMobnoPost: function (req, res) {
    userHelper.doVerifyMob(req.body).then((response) => {
      const mobNo = req.body.loginMobno;
      console.log(mobNo);

      if (response.status) {
        console.log("Mobile Number Found");
        client.verify.v2.services(serviceSID)
          .verifications
            .create({
              to: `+91${mobNo}`,
              channel: "sms",
          }).then(verification => console.log(verification.status) ) ;
          // => console.log(data, 'Data After'));
            res.render('user/verify-otp');

      } else {
        res.render('user/otp-login', { otpErr: true });
      }

    })
  },

  verifyOtpPost: (req, res) => {
    let user = req.session.user;
    const otp = req.body.loginotp;
    console.log(otp);
    client.verify.v2.services(serviceSID)
      .verificationChecks
        .create({
          to: '+919072901837',
          code: otp,
      }).then((data) => {
            console.log(data, "data in postOTP Verification");
      });
      res.render('index', {user});
  },


  //LOGOUT
  logout: function (req, res) {
    req.session.loggedIn = false;
    req.session.user = null;
    //  req.session.destroy();
    res.redirect('/');
  },

  signupPage: function (req, res) {
    if (req.session.loggedIn) {
      res.redirect('/');
    }
    else {
      res.render('user/signup');
    }
  },

  productView: async (req, res) => {
    let user = req.session.user;
      let products = await userHelper.getProductDetails(req.params.id);
      console.log(req.params.id);
      console.log(products);
      res.render('user/product-view', {user, products});
  },

  cartPage: async (req, res) => {
    let user = req.session.user;
    let products = await userHelper.getCartProducts(req.session.user._id);
    let totalPrice = await userHelper.getTotalAmount(req.session.user._id);
      console.log(req.session.user._id, 'USER ID IN CART LOAD');
      console.log(products +" This is products Passed from getCart Products");
      res.render('user/cart', {user, products, totalPrice});
    // if (req.session.loggedIn) {
      
    // }else{
    //   res.redirect('/login');
    // }

  },

  addToCart: (req, res) => {
    console.log("API CALLED");
    userHelper.addToCart(req.params.id, req.session.user).then(() => {
      console.log(req.params.id+ ' This is Product ID when Add Product Clicked');
      res.json({status: true});
      // res.redirect('/');
    });
    
    
  },
  
  removeCartPost: (req, res)=>{
    userHelper.removeCartProduct(req.body).then((response)=>{
      res.json(response);
    })
  },

  checkout: async(req, res)=>{
    let user = req.session.user;
    let total = await userHelper.getTotalAmount(req.session.user._id);
    let products = await userHelper.getCartProductList(req.session.user._id);
    console.log(total, "Total Amount of CART");
    res.render('user/checkout', {user, total, products});
  },

  placeOrder: async(req, res)=>{
    let products = await userHelper.getCartProductList(req.body.userId);
    let totalPrice = await userHelper.getTotalAmount(req.body.userId);
    userHelper.placeOrder(req.body, products, totalPrice).then((response)=>{
      res.json({status: true});
    })
  
  },

  orderSuccess: (req, res)=>{
    res.render('user/order-success', {user: req.session.user})
  },

  ordersPage: async(req, res)=>{
    let user = req.session.user;
    console.log(user._id);
    let orders = await userHelper.getUserOrders(req.session.user._id);
    res.render('user/orders', {user, orders})
  },

  viewOrder: async(req, res)=>{
    let user = req.session.user;
    let products = await userHelper.getOrderProducts(req.params.id);
    res.render('user/view-order-products', {user, products});
  },

  changePassword: (req, res)=>{
    if (req.session.loggedIn) {
      res.redirect('/');
    }
    else {
      res.render('user/forgot-password');
    } 
  },

  verifyForgotPwdMob: function (req, res) {
    userHelper.doVerifyMob(req.body).then((response) => {
      const mobNo = req.body.loginMobno;
      console.log(mobNo);

      if (response.status) {
        console.log("Mobile Number Found");
        client.verify.v2.services(serviceSID)
          .verifications
            .create({
              to: `+91${mobNo}`,
              channel: "sms",
          }).then(verification => console.log(verification.status) ) ;
          // => console.log(data, 'Data After'));
            res.render('user/verify-changePwd-otp');

      } else {
        res.render('user/forgot-password', { otpErr: true });
      }

    })
  },
  
  verifyForgotPwdOtpPost: (req, res) => {
    const otp = req.body.loginotp;
    console.log(otp);
    client.verify.v2.services(serviceSID)
      .verificationChecks
        .create({
          to: '+919072901837',
          code: otp,
      }).then((data) => {
            console.log(data, "data in postOTP Verification");
      });
      res.render('user/change-password');
  },

  changePasswordPost: async(req, res)=>{
    let user = req.session.user;
    await userHelper.changePassword(req.body, user._id).then((response)=>{
      if(response.status){
        res.render('index', {user});
      }
    });

  }

}