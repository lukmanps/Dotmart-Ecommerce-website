const db = require('../connection');
const collection = require('../collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectId = require('mongodb').ObjectId;
const paypal = require('paypal-rest-sdk');



module.exports = {

    getUser: (userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.USERCOLLECTION).findOne({_id: objectId(userId)}).then((user)=>{
                resolve(user);
            })
        })
    },

    doSignup: (userData) => {
        // console.log("req.body" + userData);
        return new Promise(async (resolve, reject) => {
            let userOld = {};
            let oldUser = await db.get().collection(collection.USERCOLLECTION).findOne({ registerEmail: userData.registerEmail });
            if (oldUser) {
                userOld.status = true;
                resolve(userOld);
            }
            else {
                // console.log('Into the Collection' + userData);
                userData.status = true;
                userData.address = [];
                userData.Password = await bcrypt.hash(userData.registerPassword, 10);
                db.get().collection(collection.USERCOLLECTION).insertOne(userData);

                resolve({ status: false })
                resolve(userData);
            }
        });
    },

    
    doLogin: (user) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let validUser = await db.get().collection(collection.USERCOLLECTION).findOne({ registerEmail: user.loginEmail });

            if (validUser) {
                bcrypt.compare(user.loginPassword, validUser.Password).then((status) => {
                    if (status) {
                        response.validUser = validUser;
                        response.status = true;
                        resolve(response);
                    }
                    else {
                        console.log('Login Failed');
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log('No User Found!');
                resolve({ status: false })
            }
        })
    },

    // changePassword: (pwd){
    //     return new Promise((resolve, reject)=>{
    //         db.get().collection(collection.USERCOLLECTION).updateOne
    //     })
    // }, 

    doVerifyMob: (mob) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let validUser = await db.get().collection(collection.USERCOLLECTION).findOne({ registerMobileno: mob.loginMobno });

            if (validUser) {
                console.log("------- Mobile Number Found! -------");
                console.log(validUser);
                response.validUser = validUser;
                response.status = true;
                resolve(response);
            } else {
                console.log('------- Mobile Number not found! -------');
                response.status = false;
                resolve(response);
            }
        })
    },

    changePassword: (changedPwd, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        registerPassword: changedPwd.changedPassword
                    }
                })
            resolve({ status: true });
        })

    },

    addToWishlist: (proId, userId)=>{
        //product is stored as object. Many products together form an array. This Object contains item Id.
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async(resolve, reject)=>{
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId)});

            if(userWishlist){
                let response = {}
                let proExist = userWishlist.products.findIndex((product) => product.item == proId);
                if(proExist != -1){
                    response.status = false;
                    resolve(response);
                }else{
                    //if product is not exist in the products array, then push new product into the array.
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user: objectId(userId)},
                    {
                        $push: { products: proObj}
                    }).then((response)=>{
                        response.status = true;
                        resolve(response);
                    })
                }
                
            }else{
                console.log('bbbbbb');
                //No Previous Wishlist for current user. There will be only one wishlist obj per user.
                let wishlistObj ={
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response)=>{
                    console.log(response, 'Wishlist Created for the user');
                    response.status = true;
                    resolve(response);
                })
            }
        })
    },

    getWishlistProducts: (userId)=>{
        return new Promise((resolve, reject)=>{
            let wishlistItems = db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: {user: objectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1,
                        product: {
                            $arrayElemAt: ['$products', 0]
                        }
                    }
                }
            ]).toArray();
            let wishlistExist = db.get().collection(collection.WISHLIST_COLLECTION).findOne({user: objectId(userId)});
            if(wishlistExist){
                resolve(wishlistItems);
            }else{
                resolve();
            }
        })
    },



    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) });

            if (userCart) {
                let proExist = userCart.products.findIndex((product) => product.item == proId);
                if (proExist != -1) {
                    db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then((response) => {
                            resolve(response)
                        });
                } else {
                    db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve(response);
                    })
                }

            } else {
                console.log('NO Previous Cart For this User');
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                console.log(cartObj, 'Cart Object in add to cart')
                db.get().collection(collection.CARTCOLLECTION).insertOne(cartObj).then((response) => {
                    console.log(response, 'Response when added to cart with no previous cart');
                    resolve(response);
                    //Cart Object Added when user make a first Add to Cart
                })
            }
        })
    },

    getCartProducts: (userId) => {
        console.log(userId + " USER ID");

        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CARTCOLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                {

                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$productInfo', 0]
                        }
                    }
                }

            ]).toArray();

            let cartExistCheck = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) });
            if (cartExistCheck) {
                resolve(cartItems)
            } else {
                resolve();
            }


        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) });
            if (cart) {
                count = cart.products.length;
                console.log(count, "Cart Count in getCartCOunt");
                resolve(count);
            } else {
                resolve(count);
            }
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) }).then((products) => {
                resolve(products);
            })
        })
    },

    productsViewLimit: (pageNum, limit)=>{
        let skipNum = parseInt((pageNum-1) * limit);
        return new Promise(async (resolve, reject)=>{
           let products = await db.get().collection(collection.PRODUCTCOLLECTION).find().skip(skipNum).limit(limit).toArray();
                resolve(products);
        })
    },

    getMensProducts: ()=>{
        return new Promise(async (resolve, reject)=>{
            let mensProducts = await db.get().collection(collection.PRODUCTCOLLECTION).find({'productCategory': 'men'}).toArray();
            resolve(mensProducts);
        })
    },

    getWomenProducts: ()=>{
        return new Promise(async (resolve, reject)=>{
            let womenProducts = await db.get().collection(collection.PRODUCTCOLLECTION).find({'productCategory': 'women'}).toArray();
            resolve(womenProducts);
        })
    },

    getAccessories: ()=>{
        return new Promise(async (resolve, reject)=>{
            let accessories = await db.get().collection(collection.PRODUCTCOLLECTION).find({'productCategory': 'accessories'}).toArray();
            resolve(accessories);
        })
    },

    changeProductQuantity: (details) => {
        console.log(typeof (details.count), 'Count in chagpe proif');
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CARTCOLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }).then((response) => {
                            response.removeProduct = true;
                            resolve(response)
                        })
            } else {
                db.get().collection(collection.CARTCOLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': parseInt(details.count) }
                    }).then((response) => {
                        response.removeProduct = false;
                        resolve(response);
                    })
            }
        })
    },

    removeCartProduct: (details) => {
        console.log(details, " Details in Remove PRoducts");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CARTCOLLECTION).updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }).then((response) => {
                    resolve(true);
                })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CARTCOLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {

                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        price: { $toInt: '$product.productPrice' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$price'] } }
                    }
                }
            ]).toArray()
                .then((response) => {
                    console.log(response, 'Response in Get Total Amount');
                    if ((response[0] != null)) {
                        resolve(response[0].total)
                    } else {
                        resolve(0);
                    }
                })

        })
    },

    placeOrder: (order, products, totalAmount) => {
        return new Promise((resolve, reject) => {
            console.log(order.userId, 'User ID when placing order');
            let paymentMethod = order.paymentMethod;
            let status = paymentMethod === 'COD' ? 'Placed' : 'Payment Pending';

            if(order.paymentMethod){

                let orderObj = {
                    deliveryDetails: {
                        name: order.orderName,
                        mobile: order.orderMob,
                        address: order.orderAddress,
                        pincode: order.orderPIN
                    },
                    userId: objectId(order.userId),
                    paymentMethod: paymentMethod,
                    products: products,
                    totalAmount: totalAmount,
                    status: status,
                    date: new Date().toLocaleDateString('en-US')
                }
                db.get().collection(collection.ORDERCOLLECTION).insertOne(orderObj).then((response) => {
                    if(response.acknowledged){
                        response.status = true;
                        response.order = orderObj;
                        resolve(response);
                        db.get().collection(collection.CARTCOLLECTION).deleteOne({ user: objectId(order.userId) });
                    }else{
                        response.status = false;
                        resolve(response);
                    }
                })
            } else {
                response.status = false;
                resolve(response);
                
            }
            
        })
    },

    getCartProductList: (userId) => {
        console.log(userId, 'User ID in get Cart PRodiuct LIst');
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userId) });
            console.log(cart, 'Cart in get cart product list');
            resolve(cart.products);
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDERCOLLECTION).find({ userId: objectId(userId) }).toArray();
            console.log(orders);
            resolve(orders);
        })
    },

    getOrderProducts: (orderId) => {
        console.log(orderId, " -THIS IS FROM GET ORDER PRODUCTS");
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log(orderItems, ' -ORDERED PRODUCTS DISPLAY');
            resolve(orderItems);
        })
    },

    updateProfile: async (userId, userData) => {
        console.log(userId, 'USeri ID from update Profile')
        console.log(userData, " USER DETAILS from update Profile");

        return new Promise(async (resolve, reject) => {

            if (userData.currentPassword) {
                let validUser = await db.get().collection(collection.USERCOLLECTION).findOne({ _id: objectId(userId) });
                let currentPassword = userData.currentPassword;

                if (validUser.registerPassword === currentPassword) {
                    let newPassword = await bcrypt.hash(validUser.Password, 10);
                    db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                        {
                            $set: {
                                registerName: userData.updateName,
                                registerEmail: userData.updateEmail,
                                registerMobileno: userData.updateMobileno,
                                registerPassword: currentPassword,
                                Password: newPassword,
                                gender: userData.gender
                            }

                        })
                    response.status = true;
                } else {
                    response.status = false;
                }
            } else {
                db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                    {
                        $set: {
                            registerName: userData.updateName,
                            registerEmail: userData.updateEmail,
                            registerMobileno: userData.updateMobileno,
                            gender: userData.gender
                        }
                    })
                response.status = true;
            }
            resolve(response);
        })
    },

    generateAccessToken: async function generateAccessToken() {

        const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")

        const response = await fetch(`${base}/v1/oauth2/token`, {

            method: "post",

            body: "grant_type=client_credentials",

            headers: {

                Authorization: `Basic ${auth}`,

            },

        });

        const data = await response.json();

        return data.access_token;

    },

    createOrder: async function createOrder() {

        const accessToken = await generateAccessToken();

        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {

            method: "post",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${accessToken}`,

            },

            body: JSON.stringify({

                intent: "CAPTURE",

                purchase_units: [

                    {

                        amount: {

                            currency_code: "USD",

                            value: "100.00",

                        },

                    },

                ],

            }),

        });

        const data = await response.json();
        console.log(data, 'Data in Create Order');
        return data;

    },

    capturePayment: async function capturePayment(orderId) {

        const accessToken = await generateAccessToken();

        const url = `${base}/v2/checkout/orders/${orderId}/capture`;

        const response = await fetch(url, {

            method: "post",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${accessToken}`,

            },

        });

        const data = await response.json();

        return data;

    },


    addAddress: (address, user)=>{
        return new Promise(async(resolve, reject)=>{

            if(address.addressName){
                let addressObj = 
                {
                    ID: Math.round(Math.random() * 1E9),
                    name: address.addressName,
                    address: address.addressHouseName + " " + address.addressStreet,
                    town: address.addressTown,
                    state: address.addressState,
                    country: address.addressCountry,
                    pin: address.addressPIN,
                    phone: address.addressMob,
                    default: true
                }

                await db.get().collection(collection.USERCOLLECTION).updateMany({_id: objectId(user._id), 'address.default': true},
                {
                    $set: {'address.$.default': false}
                });

                await db.get().collection(collection.USERCOLLECTION).updateOne({_id: objectId(user._id)},
                {
                    $push: {address: addressObj}
                }).then((response)=>{
                    console.log(response, ' Response from updating address...')
                    response.status = true;
                    resolve(response);
                })
            }
        })

    },

    selectAddress: (userId, addressId)=>{
        return new Promise(async(resolve, reject)=>{
            await db.get().collection(collection.USERCOLLECTION).updateOne({_id: objectId(userId), 'address.default': true}, 
            {
                $set: {'address.$.default': false}
            })
            await db.get().collection(collection.USERCOLLECTION).updateOne({_id: objectId(userId), 'address.ID': addressId},
                {
                    $set: {'address.$.default': true}
                }).then((response)=>{
                    console.log(response, ' Response from updating address...');
                    response.status = true;
                    resolve(response);
                })
        })
    },

    getEditAddress: (userId, addressId)=>{
        return new Promise(async(resolve, reject)=>{
            await db.get().collection(collection.USERCOLLECTION).findOne({_id: objectId(userId), 'address.ID': addressId}).then((response)=>{
                console.log(response, " REsponse in Edit address");
                resolve(response);
            })
        })
    },

    applyCoupon: (code, total)=>{
        console.log(code, 'Coupon code in checkout');
        return new Promise (async(resolve, reject)=>{
            let validCoupon = await db.get().collection(collection.COUPONCOLLECTION).findOne({couponCode: code, expiryDate: {$gte: new Date()}});
                if(validCoupon !== null){
                    console.log(validCoupon, 'Valid Coupon');
                    let disPercent = validCoupon.couponDiscount;   //Coupon Discount %
                    let disAmount = (total*disPercent)/100;  //Discount Amount calculated
                    let maxReduction = parseInt(validCoupon.maxDiscount);  //Maximum Discount Amount
                    if(maxReduction < disAmount){
                        let disPrice = total - maxReduction;
                        var discount = {};
                        discount.couponCode = validCoupon.couponCode;
                        discount.disAmount = maxReduction;
                        discount.disPrice = disPrice;
                        discount.status = true;
                        resolve(discount);
                    }else{
                        let disPrice = total - disAmount;
                        let discount = {};
                        discount.couponCode = validCoupon.couponCode;
                        discount.disPrice = disPrice;
                        discount.disAmount = disAmount;
                        discount.status = true;
                        resolve(discount);
                    }
                }else{
                    resolve(null);
                }
            
            
        })
    },

    searchProduct: (searchItem)=>{
        return new Promise(async(resolve, reject)=>{
            let searchResult = await db.get().collection(collection.PRODUCTCOLLECTION).find({
                $or: [
                    { productBrand: {$regex: searchItem, $options: "i"}},
                    { productTitle: {$regex: searchItem, $options: "i"}},
                    { productCategory: {$regex: searchItem, $options: "i"}},
                ],
            }).toArray();

            if(searchResult.length > 0){
                resolve(searchResult);
            }

            reject();
        })
    }




}