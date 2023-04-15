const { response } = require('express');
var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const userHelper = require('../model/helpers/user-helper');
const {verifyUser} = require('../controllers/authentication');


//**** SIGNUP ****
router.route('/signup')
  .get(userController.signupPage)
  .post(userController.signupPost);

router.post('/validate-mobileno', userController.validateMobile);  
router.post('/validate-otp', userController.validateOTP);

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
router.get('/add-to-wishlist/:id', verifyUser, userController.addToWishlist);

router.get('/wishlist', verifyUser, userController.wishlistPage);

router.post('/remove-wishlist-product', verifyUser, userController.removeWishlistProduct);

//**** CART ****

router.get('/add-to-cart/:id', verifyUser, userController.addToCart); //Add to Cart Button

router.get('/cart', verifyUser, userController.cartPage); //Cart Page

router.post('/change-product-quantity', verifyUser, userController.changeQuantity); //Change Cart Product Quantity

router.post('/remove-cart-product', verifyUser, userController.removeCartPost) //Remove Cart Product

//**** CHECKOUT *****/
router.route('/checkout')
  .get(verifyUser, userController.checkout)
  .post(verifyUser, userController.placeOrder)



router.get('/order-success', verifyUser, userController.orderSuccess)

//******** ORDERS **********/

router.get('/orders', verifyUser, userController.ordersPage)// Order Page

router.get('/view-order-products/:id', verifyUser, userController.viewOrder);

router.post('/return-order', verifyUser, userController.returnOrder);

router.post('/cancel-order', verifyUser, userController.cancelOrder);


//**** ACCOUNT INFO *****/
router.post('/change-password', userController.changePasswordPost);

router.get('/user-profile', verifyUser, userController.userProfile); //User Profile Page

router.post('/update-profile', verifyUser, userController.updateProfile);

//******** ADDRESS ********/

router.get('/address', verifyUser, userController.addressPage); //Address Page

router.route('/add-address')
  .get(verifyUser, userController.addAddress)
  .post(userController.addAddressPost);

router.post('/select-address', verifyUser, userController.selectAddress);

router.get('/edit-address/:id', verifyUser, userController.editAddress);

router.post('/edit-address', verifyUser, userController.updateAddress);

//******** COUPON ********/

router.get('/all-coupons', verifyUser, userController.allCoupons);

router.post('/apply-coupon', verifyUser, userController.applyCoupon);




module.exports = router;
