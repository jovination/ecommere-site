document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    updateCartCount();
    setupCheckoutButton();
});

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        cartItemsContainer.classList.add('hidden');
        emptyCartMessage.classList.remove('hidden');
        updateOrderSummary(0, 0, 0);
        return;
    }
    
    cartItemsContainer.classList.remove('hidden');
    emptyCartMessage.classList.add('hidden');
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Add items to cart
    cart.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update order summary
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    updateOrderSummary(subtotal, shipping, tax);
}

function createCartItemElement(item) {
    const template = document.getElementById('cartItemTemplate');
    const cartItem = document.importNode(template.content, true);
    
    // Set item details
    const img = cartItem.querySelector('img');
img.src = item.image.startsWith('/') ? `..${item.image}` : item.image;
    img.alt = item.name;
    
    cartItem.querySelector('h3').textContent = item.name;
    cartItem.querySelector('.quantity').textContent = item.quantity;
    cartItem.querySelector('.itemPrice').textContent = `$${(item.price * item.quantity).toFixed(2)}`;
    
    // Setup event listeners
    const decreaseBtn = cartItem.querySelector('.decreaseQuantity');
    const increaseBtn = cartItem.querySelector('.increaseQuantity');
    const removeBtn = cartItem.querySelector('.removeItem');
    
    decreaseBtn.addEventListener('click', () => {
        updateItemQuantity(item.id, -1);
    });
    
    increaseBtn.addEventListener('click', () => {
        updateItemQuantity(item.id, 1);
    });
    
    removeBtn.addEventListener('click', () => {
        removeCartItem(item.id);
    });
    
    return cartItem;
}

function updateItemQuantity(itemId, change) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

function removeCartItem(itemId) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    loadCartItems();
    updateCartCount();
}

function updateOrderSummary(subtotal, shipping, tax) {
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function setupCheckoutButton() {
    const checkoutButton = document.querySelector('button.w-full');
    checkoutButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length > 0) {
            window.location.href = './checkout.html';
        } else {
            alert('Your cart is empty. Add some products before checkout.');
        }
    });
}