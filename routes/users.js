const { response } = require('express');
var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const userHelper = require('../helpers/user-helper');
const adminHelper = require('../helpers/admin-helper')
const session = require('express-session');
const { loginPost } = require('../controllers/adminController');

const verifyLogin = (req, res, next)=>{
if(req.session.loggedIn){
  next();
}else{
  res.redirect('/login');
}
}

/* GET users listing. */
router.get('/', userController.homePage);

//SIGNUP
router.get('/signup', userController.signupPage);


router.post('/signup', (req, res) => {

  userHelper.doSignup(req.body).then((userData) => {
    let oldUser = userData.status;

    if (oldUser) {
      res.render('user/signup', {oldUser: true})
    } else {
      res.render('user/signup', {registered: true});
    }
  })
});

//LOGIN
router.get('/login', userController.loginPage); //Login Page

router.post('/login', userController.loginPost); //Login Post

router.get('/otp-login', userController.otpLogin); //OTP Login Page

router.post('/verify-mob', userController.verifyMobnoPost); //verify Mobile Number

// router.get('/verify-otp', userController. verifyOtp);

router.post('/verify-otp', userController.verifyOtpPost);  //Verify OTP

router.get('/logout', userController.logout); //LOGOUT

router.get('/product-view/:id', userController.productView); //Product View Page

router.get('/add-to-cart/:id', userController.addToCart); //Add to Cart Button

router.get('/cart', verifyLogin, userController.cartPage); //Cart Page

router.post('/change-product-quantity', (req, res)=>{
 userHelper.changeProductQuantity(req.body).then(async (response)=>{
    response.total = await userHelper.getTotalAmount(req.body.user);
    console.log(response, "Response In change Quantity");
    res.json(response)
  })
})

router.post('/remove-cart-product', userController.removeCartPost)

router.get('/checkout', verifyLogin, userController.checkout);


router.post('/place-order',verifyLogin, userController.placeOrder)

router.get('/order-success', userController.orderSuccess)

router.get('/orders', userController.ordersPage)

router.get('/view-order-products/:id', userController.viewOrder);

router.get('/forgot-password', userController.changePassword) //Forgot Password Mobile verification Page

router.post('/verify-forgotPwd-mob', userController.verifyForgotPwdMob); //Mobile Verification Post

router.post('/verify-forgotPwd-otp', userController.verifyForgotPwdOtpPost); //Otp Verification Post

router.post('/change-password', userController.changePasswordPost)




module.exports = router;
