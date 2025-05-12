document.addEventListener('DOMContentLoaded', () => {
    // Load cart data and update the UI
    loadCartSummary();
    updateCartCount();
    setupFormValidation();
});

function loadCartSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        // Redirect to cart page if cart is empty
        window.location.href = './cart.html';
        return;
    }
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Add items to summary (limited to first 3 with a "+X more" if there are more)
    const displayItems = cart.slice(0, 3);
    let remainingItems = cart.length - displayItems.length;
    
    displayItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex justify-between items-center py-2';
        itemElement.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-gray-700">${item.quantity}x</span>
                <span class="truncate max-w-[120px]">${item.name}</span>
            </div>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Add "+ X more" if needed
    if (remainingItems > 0) {
        const moreItemsElement = document.createElement('div');
        moreItemsElement.className = 'text-sm text-gray-600 italic mt-2';
        moreItemsElement.textContent = `+ ${remainingItems} more item${remainingItems > 1 ? 's' : ''}`;
        orderItemsContainer.appendChild(moreItemsElement);
    }
    
    // Update order summary
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    updateOrderSummary(subtotal, shipping, tax);
}

function updateOrderSummary(subtotal, shipping, tax) {
    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderShipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function setupFormValidation() {
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    // Place order button action
    placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if form is valid
        const isValid = checkoutForm.checkValidity();
        if (!isValid) {
            // Trigger browser's built-in validation
            checkoutForm.reportValidity();
            return;
        }
        
        // Process order
        processOrder();
    });
}

function processOrder() {
    // Collect form data
    const formData = new FormData(document.getElementById('checkoutForm'));
    const orderData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        shipping: {
            address: formData.get('address'),
            apartment: formData.get('apartment'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        delivery: {
            method: formData.get('deliveryMethod')
        },
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        orderDate: new Date().toISOString()
    };
    
    // In a real application, you would send this data to your server
    console.log('Order data:', orderData);
    
    // For demo purposes, we'll just simulate an order confirmation
    // Save order ID and clear cart
    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    localStorage.setItem('lastOrderId', orderId);
    localStorage.removeItem('cart');
    
    // Show confirmation
    showOrderConfirmation(orderId, orderData);
}

function showOrderConfirmation(orderId, orderData) {
    // Create a simple confirmation dialog
    const confirmationOverlay = document.createElement('div');
    confirmationOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const confirmationDialog = document.createElement('div');
    confirmationDialog.className = 'bg-white p-8 rounded-xl max-w-md w-full mx-4';
    confirmationDialog.innerHTML = `
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 class="text-2xl font-medium mb-2">Order Confirmed!</h2>
            <p class="text-gray-600 mb-4">Your order has been placed successfully.</p>
            <p class="font-medium">Order ID: ${orderId}</p>
        </div>
        <div class="mb-6">
            <p class="text-sm text-gray-600 mb-2">A confirmation email has been sent to:</p>
            <p class="font-medium">${orderData.customer.email}</p>
        </div>
        <div class="text-center">
            <button id="continueShopping" class="bg-black text-white py-3 px-6 rounded-full font-medium hover:opacity-90 transition-opacity">
                Continue Shopping
            </button>
        </div>
    `;
    
    confirmationOverlay.appendChild(confirmationDialog);
    document.body.appendChild(confirmationOverlay);
    
    // Setup continue shopping button
    document.getElementById('continueShopping').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}