import products from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');

    // Fetch product data
    const data = await products();
    const productList = data.products || [];

    // Render product list
    function renderProducts(items) {
        productsGrid.innerHTML = items.map(product => {
            const isInStock = product.inStock;
            // Apply opacity and cursor styles based on stock status
            const productCardClasses = `bg-white rounded-3xl overflow-hidden shadow-md transition-shadow duration-300 ${isInStock ? 'hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed'}`;
            // Disable click handler if not in stock
            const clickHandler = isInStock ? `window.location.href='pages/product.html?id=${product.id}'` : '';

            return `
                    <div class="relative bg-white max-w-[360px] w-full h-auto rounded-[30px] shadow-md p-6" onclick="${clickHandler}">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-[300px] rounded-[24px] object-cover ${isInStock ? '' : 'opacity-60'}" />
                        ${!isInStock ? 
                            `<div class="absolute top-5 left-5 right-5 h-[300px] flex items-center justify-center bg-opacity-75 text-white text-sm font-bold text-center rounded-[24px]">
                                OUT OF STOCK
                            </div>`
                            : ''}
                        <div class="mt-3">
                            <h3 class="font-medium text-gray-900 text-lg">${product.name}</h3>
                            <p class="text-sm text-gray-600 mt-1">${product.description}</p>
                            <div class="flex items-center mt-2">
                                <div class="flex text-yellow-400" id="rating-${product.id}">
                                    ${renderStarRating(product.rating)}
                                </div>
                                <span class="text-xs text-gray-500 ml-1">(${product.reviews})</span>
                            </div>
                            <div class="flex items-center justify-between mt-3">
                                <div>
                                    <span class="font-medium text-lg">$${product.price}</span>
                                ${product.originalPrice ?
                                        `<span class="text-gray-400 line-through text-sm ml-1">$${product.originalPrice}</span>`
                                        : ''}
                                </div>
                                ${product.discount ?
                                    `<span class="text-xs font-medium bg-red-100 text-red-500 px-2 py-0.5 rounded-full">${product.discount}% OFF</span>`
                                    : ''}
                            </div>
                        </div>
                    </div>
            `;
        }).join('');
    }

    function renderStarRating(rating) {
        return Array(5)
            .fill(null)
            .map((_, index) => `
                <svg class="w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-200'}"
                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
            `).join('');
    }

    renderProducts(productList);
});