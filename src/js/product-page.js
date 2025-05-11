import products from './products.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    
    // Find product
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = '../index.html';
        return;
    }

    // Update product details
    updateProductDetails(product);
    setupQuantityControls();
    setupAddToCart(product);
});

function updateProductDetails(product) {
    // Update text content
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('reviewCount').textContent = `(${product.reviews} reviews)`;
    
    // Update image
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = `..${product.image}`;
    mainImage.alt = product.name;

    // Update rating stars
    const ratingStars = document.getElementById('ratingStars');
    ratingStars.innerHTML = generateStarRating(product.rating);

    // Handle original price and discount if they exist
    const originalPrice = document.getElementById('originalPrice');
    const discountBadge = document.getElementById('discountBadge');

    if (product.originalPrice) {
        originalPrice.textContent = `$${product.originalPrice}`;
        originalPrice.style.display = 'inline';
    } else {
        originalPrice.style.display = 'none';
    }

    if (product.discount) {
        discountBadge.textContent = `${product.discount}% OFF`;
        discountBadge.style.display = 'inline';
    } else {
        discountBadge.style.display = 'none';
    }

    // Update color options if available
    if (product.colors && product.colors.length > 0) {
        const colorOptions = document.getElementById('colorOptions');
        colorOptions.innerHTML = product.colors.map(color => `
            <button class="w-8 h-8 rounded-full border-2 border-gray-300 focus:border-black transition-colors" 
                    style="background-color: ${color}">
            </button>
        `).join('');
    }
}

function generateStarRating(rating) {
    return Array(5).fill('').map((_, index) => `
        <svg class="w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}" 
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
    `).join('');
}

function setupQuantityControls() {
    const quantity = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantity.textContent);
        if (currentValue > 1) {
            quantity.textContent = currentValue - 1;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantity.textContent);
        quantity.textContent = currentValue + 1;
    });
}

function setupAddToCart(product) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const cartCount = document.getElementById('cartCount');
    
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').textContent);
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    });
}