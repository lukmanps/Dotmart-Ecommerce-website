const { response } = require('express');
var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const userHelper = require('../model/helpers/user-helper');


const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn && req.session.user.status) {
    next();
  } else {
    res.redirect('/login');
  }
}

//**** SIGNUP ****
router.route('/signup')
      .get(userController.signupPage)
      .post(userController.signupPost);

//**** LOGIN ****
router.route('/login') //Login Pag
      .get(userController.loginPage)
      .post(userController.loginPost); //Login Post

router.get('/otp-login', userController.otpLogin); //OTP Login Page

router.post('/verify-mob', userController.verifyMobnoPost); //verify Mobile Number

router.get('/forgot-password', userController.changePassword) //Forgot Password Mobile verification Page

router.post('/verify-forgotPwd-mob', userController.verifyForgotPwdMob); //Mobile Verification Post

router.post('/verify-forgotPwd-otp', userController.verifyForgotPwdOtpPost); //Otp Verification Post

router.post('/verify-otp', userController.verifyOtpPost);  //Verify OTP

router.get('/logout', userController.logout); //LOGOUT

//**** HOME PAGE ****
router.get('/', userController.homePage);

router.get('/shop', userController.shopPage); //SHOP Page

router.get('/men', userController.mensPage); //Men 

router.get('/women', userController.womenPage); //Women

router.get('/accessories', userController.accessoriesPage);  //Accessories

router.get('/product-view/:id', userController.productView); //Product View Page

router.get('/product-search', userController.productSearch); //Product Search

//**** WISHLIST ****/
router.get('/add-to-wishlist/:id', userController.addToWishlist);

router.get('/wishlist', verifyLogin, userController.wishlistPage);

//**** CART ****

router.get('/add-to-cart/:id', userController.addToCart); //Add to Cart Button

router.get('/cart', verifyLogin, userController.cartPage); //Cart Page

router.post('/change-product-quantity', userController.changeQuantity); //Change Cart Product Quantity

router.post('/remove-cart-product', userController.removeCartPost) //Remove Cart Product

//**** CHECKOUT *****/
router.route('/checkout')
  .get(verifyLogin, userController.checkout)
  .post(userController.checkoutPost)

router.post('/place-order', verifyLogin, userController.placeOrder)

router.get('/order-success', userController.orderSuccess)

router.get('/orders', verifyLogin,  userController.ordersPage)// Order Page

router.get('/view-order-products/:id', userController.viewOrder);


//**** ACCOUNT INFO *****/
router.post('/change-password', userController.changePasswordPost);

router.get('/user-profile', verifyLogin, userController.userProfile); //User Profile Page

router.post('/update-profile/:id', userController.updateProfile);

router.get('/address', verifyLogin, userController.addressPage); //Address Page

router.route('/add-address')
      .get(verifyLogin, userController.addAddress)
      .post(userController.addAddressPost);

router.get('/select-address/:id', userController.selectAddress);

router.route('/edit-address/:id')
      .get(verifyLogin, userController.editAddress);

router.get('/all-coupons', verifyLogin, userController.allCoupons);   

router.post('/apply-coupon', userController.applyCoupon);


      

// router.get('/error', userController.errorPage);





module.exports = router;
