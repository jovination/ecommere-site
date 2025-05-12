import fetchProducts from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'), 10);

    const { products } = await fetchProducts();

    const product = products.find(p => p.id === productId);

    if (!product) {
        window.location.href = '../index.html';
        return;
    }

    updateProductDetails(product);
    setupQuantityControls();
    setupAddToCart(product);
    updateCartCount();
});

function updateProductDetails(product) {
    const nameEl = document.getElementById('productName');
    const categoryEl = document.getElementById('productCategory');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDescription');
    const reviewCountEl = document.getElementById('reviewCount');
    const mainImage = document.getElementById('mainProductImage');
    const ratingStars = document.getElementById('ratingStars');
    const originalPriceEl = document.getElementById('originalPrice');
    const discountBadge = document.getElementById('discountBadge');
    const colorOptions = document.getElementById('colorOptions');

    if (nameEl) nameEl.textContent = product.name;
    if (categoryEl) categoryEl.textContent = product.category;
    if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
    if (descEl) descEl.textContent = product.description;
    if (reviewCountEl) reviewCountEl.textContent = `(${product.reviews} reviews)`;

   if (mainImage) {
  mainImage.src = product.image;
  mainImage.alt = product.name;
}


    if (ratingStars) {
        ratingStars.innerHTML = generateStarRating(product.rating);
    }

    if (originalPriceEl) {
        if (product.originalPrice) {
            originalPriceEl.textContent = `$${product.originalPrice}`;
            originalPriceEl.style.display = 'inline';
        } else {
            originalPriceEl.style.display = 'none';
        }
    }

    if (discountBadge) {
        if (product.discount) {
            discountBadge.textContent = `${product.discount}% OFF`;
            discountBadge.style.display = 'inline-block';
        } else {
            discountBadge.style.display = 'none';
        }
    }

    if (product.colors && Array.isArray(product.colors) && colorOptions) {
        colorOptions.innerHTML = product.colors.map(color => `
            <button class="w-8 h-8 rounded-full border-2 border-gray-300 focus:border-black transition-colors" 
                    style="background-color: ${color}" title="${color}">
            </button>
        `).join('');
    }
}

function generateStarRating(rating) {
    return Array.from({ length: 5 }, (_, i) => `
        <svg class="w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}" 
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
    `).join('');
}

function setupQuantityControls() {
    const quantity = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');

    if (!quantity || !decreaseBtn || !increaseBtn) return;

    decreaseBtn.addEventListener('click', () => {
        const current = parseInt(quantity.textContent);
        if (current > 1) quantity.textContent = current - 1;
    });

    increaseBtn.addEventListener('click', () => {
        const current = parseInt(quantity.textContent);
        quantity.textContent = current + 1;
    });
}

function setupAddToCart(product) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity')?.textContent || '1');
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
        updateCartCount();
    });
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}
