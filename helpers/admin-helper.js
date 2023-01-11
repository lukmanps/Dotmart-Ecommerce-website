const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectId = require('mongodb').ObjectId

module.exports = {

    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let validAdmin = await db.get().collection(collection.ADMINCOLLECTION).findOne({ adminEmail: adminData.adLogEmail, adminPassword: adminData.adLogPassword });
            // console.log(validAdmin);
            if (validAdmin) {
                console.log("login success")
                response.validAdmin = validAdmin;
                response.status = true;
                resolve(response);

            }
            else {
                console.log("login failed");
                response.status = false;
                resolve(response);
            }
        })
    },


    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USERCOLLECTION).find().toArray()
            resolve(users)
        })
    },

    deleteuser: (userid) => {
        return new Promise(async (resolve, reject) => {
            console.log(userid)
            await db.get().collection(collection.USERCOLLECTION).deleteOne({ _id: objectId(userid) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: false } }).then((response) => {
                    console.log(response);
                    resolve();
                });
        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: true } }).then((response) => {
                    console.log(response);
                    resolve();
                });
        })
    },

    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            let oldCategory = {}
            let validCategory = await db.get().collection(collection.CATEGORYCOLLECTION).findOne({ catName: category.catName })

            if (validCategory) {
                oldCategory.status = true
                resolve(oldCategory);
            }
            else {
                db.get().collection(collection.CATEGORYCOLLECTION).insertOne(category);
                resolve({ status: false })
            }
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORYCOLLECTION).find().toArray()
            resolve(category);
        })
    },

    deleteCategory: (catid) => {
        return new Promise(async (resolve, reject) => {
            console.log(catid)
            await db.get().collection(collection.CATEGORYCOLLECTION).deleteOne({ _id: objectId(catid) }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    addProduct: (product) => {
        return new Promise(async (resolve, reject) => {
            // console.log(product);
            let response = {};
            db.get().collection(collection.PRODUCTCOLLECTION).insertOne(product).then((product) => {
                resolve(product);
            });
            // response.status = false;
            // resolve(response);
            // let response = {};
            // let validProduct = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({productID: product.productID});
            // if(validProduct){
            //     console.log(validProduct);
            //     response.status = true;
            //     resolve(response);
            // }else{
            //     db.get().collection(collection.PRODUCTCOLLECTION).insertOne(product);
            //     response.status = false;
            //     resolve(response);
            // }

        });
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = db.get().collection(collection.PRODUCTCOLLECTION).find().toArray()
            resolve(products);
        })
    },

    unlistProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id: objectId(productId)},
                {
                    $set: { status: 'Unlisted' }
                }).then((response) => {
                    console.log(response);
                    resolve();
                });
    })
    },

    listBackProduct: (productId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id: objectId(productId)},
            {
                $set: {status: 'Listed'}
            }).then((response)=>{
                console.log(response);
                resolve();
            })
        })
    },

    getProductDetails: (proId) => {
        console.log(proId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product);
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        console.log(proDetails);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    productBrand: proDetails.productBrand,
                    productTitle: proDetails.productTitle,
                    productID: proDetails.productID,
                    productColor: proDetails.productColor,
                    productSize: proDetails.productSize,
                    productDescription: proDetails.productDescription,
                    productPrice: proDetails.productPrice

                }
            }).then((response) => {
                resolve();
            });
        })
    },

    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            console.log(proId)
            await db.get().collection(collection.PRODUCTCOLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDERCOLLECTION).find().toArray();
            resolve(orders);
        })
    },

    getOrderDetails: (orderId) => {
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
                        quantity: '$products.quantity',
                        deliveryDetails: '$deliveryDetails',
                        paymentMethod: '$paymentMethod',
                        totalAmount: '$totalAmount',
                        status: '$status',
                        date: '$date'
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
                        deliveryDetails: 1,
                        paymentMethod: 1,
                        totalAmount: 1,
                        status: 1,
                        date: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }


            ]).toArray()
            console.log(orderItems, ' -ORDERED PRODUCTS DISPLAY in ADMIN');
            resolve(orderItems);
        })
    },

    updateOrderStatus: (orderId, orderStatus) => {
        console.log(orderStatus, ' ORDER STATUS');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERCOLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: orderStatus.orderStatus
                }
            })
            resolve();
        })
    }




}