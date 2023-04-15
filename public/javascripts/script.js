

let addToCart = (proId) => {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                Toastify({
                    text: "Added to Cart",
                    duration: 2000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: '#198754',

                    },
                }).showToast();
                // let count = $('#cartCount').html();
                // count = parseInt(count) + 1;
                // $('#cartCount').html(count)
                document.getElementById('cartCount').innerHTML = response.cartCount;
            } else {
                Toastify({
                    text: "Please Login to Shop",
                    duration: 2000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: '#bb321f',

                    },
                }).showToast();
            }

        }

    })
}

let addToWishlist = (proId) => {
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                Toastify({
                    text: "Added to Wishlist",
                    duration: 2000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: '#198754',

                    },
                }).showToast();
            } else {
                Toastify({
                    text: "Please Login to Shop",
                    duration: 2000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: '#bb321f',

                    },
                }).showToast();
            }
        }
    })
}

let removeFromWishlist = (wishlistId, proId) => {
    console.log(proId);
    Swal.fire({
        title: "Are you sure want to remove this item from wishlist?",
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Remove',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/remove-wishlist-product',
                method: 'post',
                data: {
                    wishlist: wishlistId,
                    product: proId
                },
                success: (response) => {
                    if (response) {
                        Swal.fire({
                            title: 'Removed!',
                            text: 'Your product has been removed.',
                            icon: 'success',
                        }).then((result) => {
                            location.reload();
                        });
                    }
                }
            })
        }
    })
}

let changeQuantity = (userId, cartId, productId, count) => {
    let qty = parseInt(document.getElementById(productId).innerHTML);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: productId,
            count: parseInt(count),
            quantity: qty
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                Toastify({
                    text: "Item removed from the Cart!",
                    duration: 2000,
                    gravity: "bottom",
                    position: "center",
                    style: {
                        background: '#cc0000',

                    },
                }).showToast();
                location.reload();
            } else {//if there is no product being removed, change count and change total through ajax. if product is removed, as page is reloaded, there is no need for changing via ajax, the count will be changed after refresh
                document.getElementById(productId).innerHTML = qty + parseInt(count);
                document.getElementById('totalPrice').innerHTML = response.total;
            }
        }
    })
}

let removeCartProduct = (cartId, productId, productName) => {
    Swal.fire({
        title: "Are you Sure want to remove ' " + productName + " ' from cart?",
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Remove',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/remove-cart-product',
                data: {
                    cart: cartId,
                    product: productId,
                    productName: productName
                },
                method: 'post',
                success: (response) => {
                    if (response) {
                        Swal.fire({
                            title: 'Removed!',
                            text: 'Your product has been removed.',
                            icon: 'success',
                        }).then((result) => {
                            location.reload();
                        });
                    }

                }
            })

        }
    })

}

let selectAddress = (addressID) => {
    Swal.fire({
        title: "Do you want to change the address?",
        text: "Changing delivery Address!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Select',
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(addressID, 'address id in select address');
            $.ajax({
                url: '/select-address',
                method: 'post',
                data: {
                    addressId: addressID
                },
                success: (response) => {
                    Swal.fire({
                        title: 'Address Changed!',
                        text: 'Your address has been changed.',
                        icon: 'success',
                    }).then((result) => {
                        location.reload();
                    });
                }
            })
        }
    })

}


let returnOrder = (orderId) => {
    console.log(orderId);
    Swal.fire({
        title: "Are you Sure want to Return this Order?",
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Return',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/return-order',
                method: 'post',
                data: {
                    orderId: orderId
                },
                success: (response) => {
                    Swal.fire({
                        title: 'Order Returned!',
                        text: 'Your order has been returned.',
                        icon: 'success',
                    }).then((result) => {
                        location.reload();
                    });
                }
            })
        }
    })
}

let cancelOrder = (orderId) => {
    console.log(orderId);
    Swal.fire({
        title: "Are you Sure want to cancel this Order?",
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Remove',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/cancel-order',
                method: 'post',
                data: {
                    orderId: orderId
                },
                success: (response) => {
                    Swal.fire({
                        title: 'Order Cancelled!',
                        text: 'Your order has been cancelled.',
                        icon: 'success',
                    }).then((result) => {
                        location.reload();
                    });
                }
            })
        }
    })
}

let applyCoupon = (totalAmount) => {
    let couponCode = document.getElementById('couponCode').value;
    $.ajax({
        url: '/apply-coupon',
        data: {
            code: couponCode,
            total: totalAmount
        },
        method: 'post',
        success: (response) => {
            console.log(response.couponCode, 'Response in ajax script');
            if (response.status) {
                document.getElementById('couponApplied').innerHTML = response.couponCode;
                document.getElementById('couponDisAmount').innerHTML = '-' + response.disAmount;
                $('#couponSuccess').html('Coupon added');
                document.getElementById('totalPrice').innerHTML = '&#x20B9;' + response.disPrice;
                document.getElementById('paypalAmount').value = response.disPrice;
            } else {
                $('#couponErr').html('Invalid Coupon');
                document.getElementById('couponSuccess').innerHTML = '';
            }
        }

    })
}

let validateMobileno = () =>{
    console.log('Send OTP Button CLicked');
    let mobileNo = document.getElementById('registerMobileno').value;

    if(!mobileNo || mobileNo.length === 0 || mobileNo.length < 10){
        Swal.fire({
            title: 'Mobile Number not valid!',
            text: 'Enter Valid Mobile Number',
            icon: 'warning',
        })
    } else {
    $.ajax({
        url: '/validate-mobileno',
        method: 'post', 
        data: {
            mobileNo: mobileNo
        },
        success: (response) =>{
            if(response.otpSend){
                Swal.fire({
                    title: 'OTP Sent!',
                    text: 'OTP is sent to ' +mobileNo,
                    icon: 'success',
                }).then(async()=>{
                    const { otp } = await Swal.fire({
                        title: 'Enter your OTP',
                        input: 'text',
                        inputLabel: 'Enter OTP to validate Mobile number',
                        inputPlaceholder: 'Enter your OTP'
                      })
                      validateOTP(otp, mobileNo);
                })
                
            }else{
                Swal.fire({
                    title: 'Mobile Number Exists!',
                    text: 'This Mobile Number already Exists.',
                    icon: 'error',
                })
            }
        }
    })
}
    
}

let validateOTP = (otp, mobileNo) =>{
      console.log(otp, mobileNo, "Entered OTP in dialogue box");
      $.ajax({
        url: '/validate-otp',
        method: 'post',
        data: {
            otp: otp,
            mobileNo: mobileNo
        },
        success: (response)=>{
            if(response.status){
                Swal.fire({
                    title: 'Mobile Number Verified!',
                    text: 'Your Mobile Number has been verified.',
                    icon: 'success',
                })
            }else{
                Swal.fire({
                    title: 'Mobile Number could not Verify!',
                    text: 'You may have entered wrong OTP.',
                    icon: 'error',
                })
            }
        }
      })
}




//*********************  ADMIN SIDE *****************************/

let checkForErrors = () => {
    let code = document.querySelector('#couponCode').value;
    let discount = document.querySelector('#couponDiscount').value;
    let expiryDate = document.querySelector('#expiryDate').value;
    let maxDiscount = document.querySelector('#maxDiscount').value;
    let ToDate = new Date();

    if (!code || code === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Coupon Code cannot be Empty!!'
        })
    } else if (!discount || !expiryDate || !maxDiscount) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Enter all Details!!'
        })
    } else if (code.length <= 5) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Atleast 5 characters required for the Coupon Code!!'
        })
    } else if (discount > 80) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Maximum discount allowed is 80%!!'
        })
    } else if (maxDiscount >= 501) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Maximum discount value upto 500!!'
        })
    } else if (new Date(expiryDate).getTime() <= ToDate.getTime()) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'The date must be Bigger or Equal to today date!!'
        })
    } else {
        submitCoupon(code, discount, expiryDate, maxDiscount);
    }
}

let submitCoupon = (code, discount, expiryDate, maxDiscount) => {

    $.ajax({
        url: '/admin/add-coupon',
        method: 'post',
        data: {
            couponCode: code,
            couponDiscount: discount,
            expiryDate: expiryDate,
            maxDiscount: maxDiscount
        },
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Coupon added Successfully',
                }).then((result) => {
                    location.reload();
                })

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Coupon added already!',
                })
            }
        }
    })
}

let removeCoupon = (couponId) => {
    Swal.fire({
        title: "Are you sure want to remove this coupon?",
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c0d51',
        cancelButtonColor: '#bb321f',
        confirmButtonText: 'Remove',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/remove-coupon',
                data: {
                    id: couponId,
                },
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        Swal.fire({
                            title: 'Removed!',
                            text: 'Coupon has been removed.',
                            icon: 'success',
                        }).then((result) => {
                            location.reload();
                        });
                    }
                }

            })
        }
    })

}

let removeBanner = () => {
    let bannerId = document.getElementById('bannerId').value;
    console.log(bannerId, 'Banner ID');
    let confirmation = confirm('Do you want to remove this Banner');
    if (confirmation === true) {
        $.ajax({
            url: '/admin/remove-banner',
            method: 'post',
            data: {
                id: bannerId,
            },
            success: (response) => {
                if (response.status) {
                    alert('Banner Removed!');
                    location.reload();
                }
            }

        })
    } else {
        alert('Banner could not remove')
    }
}



let updateOrderStatus = (status, orderId) => {
    console.log(status, 'ORder Statsu scchaggerd');
    $.ajax({
        url: '/admin/update-order-status',
        method: 'post',
        data: {
            status: status,
            orderId: orderId
        },
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    title: 'Updated!',
                    text: 'Order status has been updated.',
                    icon: 'success',
                }).then((result) => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    title: 'Oops!',
                    text: 'Order status could not update.',
                    icon: 'error',
                }).then((result) => {
                    location.reload();
                });
            }
        }
    })
}
