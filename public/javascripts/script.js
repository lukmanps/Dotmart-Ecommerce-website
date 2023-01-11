let addToCart = (proId)=>{
    $.ajax({
        url: '/add-to-cart/'+ proId,
        method: 'get',
        success: (response)=>{
            if(response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1;
                $("#cart-count").html(count)
            }
            // alert(response);
        }
    })
}

let changeQuantity = (userId,cartId,productId,count)=>{
    console.log(userId, 'USER ID in change Qty');
    let qty = parseInt(document.getElementById(productId).innerHTML)
    //console.log(userId);
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:productId,
            count:count,
            quantity:qty
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert('Product removed from cart!')
                location.reload()
            }else{//if there is no product being removed, change count and change total through ajax. if product is removed, as page is reloaded, there is no need for changing via ajax, the count will be changed after refresh
                //console.log(response);
                document.getElementById(productId).innerHTML = qty+parseInt(count);
                document.getElementById('subtotalPrice').innerHTML = response.subtotalPrice
            }
        }
    })
}

let removeCartProduct = (cartId, productId, productName)=>{
    let confirmation = confirm("Are you Sure want to remove ' "+productName+" ' from cart?");
    if(confirmation == true){
        $.ajax({
            url: '/remove-cart-product',
            data: {
                cart: cartId,
                product: productId,
                productName: productName
            },
            method: 'post',
            success: (response)=>{
                if(response){
                    alert('Product removed from Cart!')
                    location.reload();
                }
            }
        })
    }
}