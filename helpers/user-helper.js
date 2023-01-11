const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId

module.exports = {

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
            //   console.log(validUser); //Prints Login Data.

            if (validUser) {
                bcrypt.compare(user.loginPassword, validUser.Password).then((status) => {
                    // console.log('status' + status);
                    if (status) {
                        console.log('Login Success');
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
            let validMob = await db.get().collection(collection.USERCOLLECTION).findOne({ registerMobileno: mob.loginMobno });

            if (validMob) {
                console.log("------- Mobile Number Found! -------");
                console.log(validMob);
                response.status = true;
                resolve(response);
            } else {
                console.log('------- Mobile Number not found! -------');
                response.status = false;
                resolve(response);
            }
        })
    },

    otpLogin: (userPhone) => {
        return new Promise(async (resolve, reject) => {

        })
    },

    changePassword: (changedPwd, userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.USERCOLLECTION).updateOne({_id: objectId(userId)},
            {$set: {
                registerPassword: changedPwd.changedPassword
            }})
            resolve({status: true});
        })
        
    },
    
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }

        console.log(proId + " - PRODUCT ID");
        console.log(userId._id + " - USER ID");

        let userID = userId._id;

        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collection.CARTCOLLECTION).findOne({ user: objectId(userID) });
            console.log(userCart);

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId);
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(userID), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then((response) => {
                            resolve(response)
                        });
                } else {
                    db.get().collection(collection.CARTCOLLECTION).updateOne({ user: objectId(userID) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve(response);
                    })
                }

            } else {
                let cartObj = {
                    user: objectId(userID),
                    products: [proObj]
                }
                db.get().collection(collection.CARTCOLLECTION).insertOne(cartObj).then((response) => {
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
            let cart = await db.get().collection(collection.CARTCOLLECTION).findOne({ users: objectId(userId) });
            if (cart) {
                count = cart.products.length;
                console.log(count, "Cart COunt in getCartCOunt");
            }
            resolve(count);

        })
    },

    getProductDetails: (proId) => {
        console.log(proId + " Product ID in Product View");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) }).then((products) => {
                resolve(products);
            })
        })
    },

    changeProductQuantity: (details) => {

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CARTCOLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }).then((response) => {
                            resolve({ removeProducts: true })
                        })
            } else {
                db.get().collection(collection.CARTCOLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': parseInt(details.count) }
                    }).then((response) => {
                        resolve({ removeProducts: false });
                    })
            }
        })
    },

    removeCartProduct: (details)=>{
        console.log(details, " Details in Remove PRoducts");
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.CARTCOLLECTION).updateOne({_id: objectId(details.cart)},
            {
                $pull: {products: {item: objectId(details.product)}}
            }).then((response)=>{
                resolve(true)
            })
        })
    },

    getTotalAmount: (userId) => {
        console.log(userId, " UserID in Get Total Amount");
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
                    if ((response[0] != null)) {
                        resolve(response[0].total)
                    } else {
                        resolve(0);
                    }
                })

        })
    },

    placeOrder: (order, products, totalAmount)=>{
        return new Promise((resolve, reject)=>{
            console.log(order, products, totalAmount);
            let status = order.paymentMethod==='COD'?'Placed':'Payment Pending';
            let orderObj = {
                deliveryDetails:{
                    name: order.orderName,
                    mobile: order.orderMob,
                    address: order.orderAddress,
                    pincode: order.orderPIN
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: totalAmount,
                status: status,
                date: new Date()
            }

            db.get().collection(collection.ORDERCOLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CARTCOLLECTION).deleteOne({user: objectId(order.userId)});
                resolve();
            })

        })
    },

    getCartProductList: (userId)=>{
        console.log(userId, 'User ID in get Cart PRodiuct LIst');
        return new Promise(async(resolve, reject)=>{
            let cart = await db.get().collection(collection.CARTCOLLECTION).findOne({user: objectId(userId)});
            resolve(cart.products);

        })
    },

    getUserOrders: (userId)=>{
        return new Promise(async(resolve, reject)=>{
            let orders = await db.get().collection(collection.ORDERCOLLECTION).find({userId: objectId(userId)}).toArray();
            console.log(orders);
            resolve(orders);
        })
    },

    getOrderProducts: (orderId)=>{
        console.log(orderId, " -THIS IS FROM GET ORDER PRODUCTS");
        return new Promise(async(resolve, reject)=>{
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
                {
                    $match: {_id: objectId(orderId)}
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
                        item:1, quantity: 1, product: {$arrayElemAt: ['$product', 0]}
                    }
                }
            ]).toArray()
            console.log(orderItems, ' -ORDERED PRODUCTS DISPLAY');
            resolve(orderItems);
        })
    }




}