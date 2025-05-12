const PANTRY_API_URL = 'https://getpantry.cloud/apiv1/pantry/ce73e3ad-57b8-4a32-b825-dc652e3a849c/basket/products';

/**
 * Fetches product data from the Pantry API
 * @returns {Promise<Object>} The products data object
 */
async function products() {
  try {
    // Fetch with timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout after 5 seconds

    const response = await fetch(PANTRY_API_URL, { signal: controller.signal });

    clearTimeout(timeoutId); // Clear timeout if fetch is successful

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return the product data or a fallback empty array
    return data || { products: [] };
  } catch (error) {
    // Handle different types of errors
    if (error.name === 'AbortError') {
      console.error('Request timed out.');
    } else {
      console.error('Error fetching products:', error);
    }

    // Return an empty list in case of error
    return { products: [] };
  }
}

export default products;
