// Complete fixed checkout script

document.addEventListener('DOMContentLoaded', () => {
    // Enhanced initialization with error handling
    try {
        loadCartSummary();
        updateCartCount();
        setupFormValidation();
        setupFormInteractions();
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorNotification('Failed to load checkout page. Please refresh.');
    }
});

// Improved cart summary loading with more robust error handling
function loadCartSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const cart = getCartItems();
    
    if (cart.length === 0) {
        redirectToCart();
        return;
    }

    orderItemsContainer.innerHTML = '';

    // Calculate totals with improved precision
    const subtotal = calculateSubtotal(cart);
    const displayItems = cart.slice(0, 3);
    const remainingItems = cart.length - displayItems.length;

    displayItems.forEach(item => {
        const itemElement = createCartItemElement(item);
        orderItemsContainer.appendChild(itemElement);
    });

    if (remainingItems > 0) {
        const moreItemsElement = createMoreItemsElement(remainingItems);
        orderItemsContainer.appendChild(moreItemsElement);
    }

    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    updateOrderSummary(subtotal, shipping, tax);
}

// Helper functions for cart and order calculations
function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
        console.error('Error parsing cart:', error);
        localStorage.removeItem('cart');
        return [];
    }
}

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => {
        // Validate item before calculation
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
            console.warn('Invalid cart item:', item);
            return sum;
        }
        return sum + (item.price * item.quantity);
    }, 0);
}

function calculateShipping(subtotal) {
    // Free shipping for orders over $50, otherwise $5.99
    return subtotal >= 50 ? 0 : 5.99;
}

function calculateTax(subtotal, taxRate = 0.08) {
    // Flexible tax calculation with default 8%
    return subtotal * taxRate;
}

function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'flex justify-between items-center py-2 border-b last:border-b-0';
    itemElement.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-gray-700 font-medium">${item.quantity}x</span>
            <span class="truncate max-w-[200px]">${escapeHTML(item.name)}</span>
        </div>
        <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    return itemElement;
}

function createMoreItemsElement(remainingItems) {
    const moreItemsElement = document.createElement('div');
    moreItemsElement.className = 'text-sm text-gray-600 italic mt-2 text-right';
    moreItemsElement.textContent = `+ ${remainingItems} more item${remainingItems > 1 ? 's' : ''}`;
    return moreItemsElement;
}

function updateOrderSummary(subtotal, shipping, tax) {
    const total = subtotal + shipping + tax;

    // Update DOM with formatted prices
    document.getElementById('orderSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('orderShipping').textContent = formatCurrency(shipping);
    document.getElementById('orderTax').textContent = formatCurrency(tax);
    document.getElementById('orderTotal').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = getCartItems();
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function setupFormValidation() {
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    // Enhanced form validation
    placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (validateForm(checkoutForm)) {
            processOrder();
        }
    });

    // Real-time validation
    addRealTimeValidation(checkoutForm);
}

function validateForm(form) {
    // Custom validation with more detailed checks
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }

    // Phone validation (optional, but if provided)
    const phoneField = form.querySelector('input[name="phone"]');
    if (phoneField && phoneField.value.trim() && !isValidPhone(phoneField.value)) {
        showFieldError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }

    return isValid;
}

function showFieldError(field, message) {
    // Remove any existing error
    const existingError = field.nextElementSibling;
    if (existingError && existingError.classList.contains('error-message')) {
        existingError.remove();
    }

    // Create and add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    field.classList.add('border-red-500');
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

function addRealTimeValidation(form) {
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('blur', () => {
            if (field.required) {
                if (!field.value.trim()) {
                    showFieldError(field, 'This field is required');
                } else {
                    clearFieldError(field);
                }
            }

            // Special validations
            if (field.type === 'email') {
                if (field.value.trim() && !isValidEmail(field.value)) {
                    showFieldError(field, 'Please enter a valid email address');
                } else if (field.value.trim()) {
                    clearFieldError(field);
                }
            }

            if (field.name === 'phone' && field.value.trim()) {
                if (!isValidPhone(field.value)) {
                    showFieldError(field, 'Please enter a valid phone number');
                } else {
                    clearFieldError(field);
                }
            }
        });
    });
}

function setupFormInteractions() {
    // Optional: Add mask or formatting to phone input
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function formatPhoneNumber(e) {
    const input = e.target;
    const cleaned = input.value.replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length > 0) {
        if (cleaned.length < 4) {
            formatted = cleaned;
        } else if (cleaned.length < 7) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
    }

    input.value = formatted;
}

function processOrder() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Final form validation before submission
    if (!validateForm(checkoutForm)) {
        return;
    }
    
    const formData = new FormData(checkoutForm);
    const cartItems = getCartItems();

    if (cartItems.length === 0) {
        showErrorNotification('Your cart is empty');
        return;
    }

    const orderId = generateOrderId();
    const orderData = createOrderData(formData, cartItems, orderId);

    submitOrder(orderData)
        .then(() => {
            // Clear form and cart only after successful submission
            clearCart();
            resetCheckoutForm();
            showOrderConfirmation(orderId, orderData);
        })
        .catch(error => {
            console.error('Order submission error:', error);
            showErrorNotification('Failed to place order. Please try again.');
        });
}

function generateOrderId() {
    return `ORDER-${Date.now().toString().slice(-8)}`;
}

function createOrderData(formData, cartItems, orderId) {
    const subtotal = calculateSubtotal(cartItems);
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    return {
        id: orderId,
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
        items: cartItems,
        orderDate: new Date().toISOString(),
        totals: {
            subtotal,
            shipping,
            tax,
            total
        }
    };
}

function submitOrder(orderData) {
    const pantryId = 'ce73e3ad-57b8-4a32-b825-dc652e3a849c';
    const basketName = 'orders';
    const pantryUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`;
    
    // Show loading indicator
    showLoadingOverlay();
    
    // First, try to get existing orders
    return fetch(pantryUrl)
        .then(response => {
            // If the basket doesn't exist yet, create it with the new order
            if (response.status === 404) {
                return { orders: [] };
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                // Handle case where response isn't JSON
                console.warn("Received non-JSON response, creating new orders array");
                return { orders: [] };
            }
        })
        .catch(error => {
            console.warn("Error fetching existing orders, creating new basket:", error);
            return { orders: [] };
        })
        .then(data => {
            // Append the new order to existing orders
            const existingOrders = Array.isArray(data.orders) ? data.orders : [];
            const updatedData = {
                orders: [...existingOrders, orderData]
            };
            
            // Update the basket with all orders
            return fetch(pantryUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
        })
        .then(async response => {
            // Hide loading indicator
            hideLoadingOverlay();
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Order submission failed: ${response.status} - ${errorText}`);
            }
            
            // Handle response, even if it's not JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return { success: true, message: await response.text() };
            }
        });
}

// Show loading overlay while order is processing
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p class="text-lg font-medium">Processing your order...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function resetCheckoutForm() {
    // Get the form and reset it
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.reset();
        
        // Also clear any validation errors
        const errorMessages = checkoutForm.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        const errorFields = checkoutForm.querySelectorAll('.border-red-500');
        errorFields.forEach(field => field.classList.remove('border-red-500'));
    }
}

function clearCart() {
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    
    // Update cart count display
    updateCartCount();
    
    // For testing, you can verify the cart is empty
    console.log('Cart cleared. Current cart:', getCartItems());
}

function showOrderConfirmation(orderId, orderData) {
    const overlay = createOrderConfirmationOverlay(orderId, orderData);
    document.body.appendChild(overlay);

    document.getElementById('continueShopping').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}

function createOrderConfirmationOverlay(orderId, orderData) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

    const dialog = document.createElement('div');
    dialog.className = 'bg-white p-8 rounded-xl max-w-md w-full mx-auto';
    dialog.innerHTML = `
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 class="text-2xl font-medium mb-2">Order Confirmed!</h2>
            <p class="text-gray-600 mb-4">Your order has been placed successfully.</p>
            <p class="font-medium text-lg">Order ID: <span class="text-blue-600">${escapeHTML(orderId)}</span></p>
        </div>
        <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Confirmation details sent to:</p>
            <p class="font-medium">${escapeHTML(orderData.customer.email)}</p>
            <p class="text-sm text-gray-600 mt-2">Total Order Amount:</p>
            <p class="font-semibold text-lg">$${orderData.totals.total.toFixed(2)}</p>
        </div>
        <div class="text-center">
            <button id="continueShopping" class="bg-black text-white py-3 px-6 rounded-full font-medium hover:opacity-90 transition-opacity w-full">
                Continue Shopping
            </button>
        </div>
    `;

    overlay.appendChild(dialog);
    return overlay;
}

// Utility Functions
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function redirectToCart() {
    window.location.href = './cart.html';
}

function showErrorNotification(message) {
    // Create a toast notification instead of using alert
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-y-0';
    toast.innerHTML = `
        <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${escapeHTML(message)}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Optional: Prevent form resubmission on page refresh
window.addEventListener('beforeunload', (e) => {
    const cart = getCartItems();
    if (cart.length > 0) {
        e.preventDefault(); // Show confirmation dialog
        e.returnValue = ''; // Required for Chrome
    }
});