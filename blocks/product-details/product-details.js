/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

// Drop-in Tools
import { initializers } from '@dropins/tools/initializer.js';

// Drop-in APIs
import * as product from '@dropins/storefront-pdp/api.js';
import { addProductsToCart } from '@dropins/storefront-cart/api.js';

// Drop-in Providers
import { render as productRenderer } from '@dropins/storefront-pdp/render.js';

// Drop-in Containers
import ProductDetails from '@dropins/storefront-pdp/containers/ProductDetails.js';

// Libs
import { getConfigValue } from '../../scripts/configs.js';
import { getSkuFromUrl } from '../../scripts/commerce.js';

export default async function decorate(block) {
  // Initialize Drop-ins
  initializers.register(product.initialize, {});

  // Set Fetch Endpoint (Service)
  product.setEndpoint(await getConfigValue('commerce-endpoint'));

  // Set Fetch Headers (Service)
  product.setFetchGraphQlHeaders({
    'Content-Type': 'application/json',
    'Magento-Environment-Id': await getConfigValue('commerce-environment-id'),
    'Magento-Website-Code': await getConfigValue('commerce-website-code'),
    'Magento-Store-View-Code': await getConfigValue('commerce-store-view-code'),
    'Magento-Store-Code': await getConfigValue('commerce-store-code'),
    'Magento-Customer-Group': await getConfigValue('commerce-customer-group'),
    'x-api-key': await getConfigValue('commerce-x-api-key'),
  });

  // Render Containers
  return productRenderer.render(ProductDetails, {
    sku: getSkuFromUrl(),
    carousel: {
      controls: 'thumbnailsColumn', // 'thumbnailsColumn', 'thumbnailsRow', 'dots'
      mobile: true,
    },
    hideAttributes: true,
    hideDescription: false,
    slots: {
      Title: (ctx) => {
        const category = document.createElement('div');
        category.classList.add('pdp-tagline');
        category.innerText = 'A WKND Classic';
        ctx.prependSibling(category);
      },
      Quantity: (ctx) => {
        const label = document.createElement('div');
        label.classList.add('pdp-quantity-label');
        label.innerText = 'Quantity';
        ctx.prependChild(label);
      },
      Actions: (ctx) => {
        ctx.appendButton((next) => ({
          text: 'ADD TO CART',
          icon: 'Cart',
          variant: 'primary',
          disabled: !next.data?.inStock || !next.valid,
          onClick: async () => {
            await addProductsToCart([
              {
                ...next.values,
              },
            ]);
            window.location.href = '/cart';
          },
        }));

        ctx.appendButton((next) => ({
          'aria-label': 'Add to Wishlist',
          icon: 'Heart',
          variant: 'primary',
          disabled: !next.valid,
          onClick: () => {
            // eslint-disable-next-line no-console
            console.log('Add To Wishlist', next.values);
          },
        }));
      },
      GalleryContent: (ctx) => {
        const el = document.createElement('div');
        el.className = 'custom-content-section';

        const titleEl = document.createElement('strong');
        titleEl.textContent = 'Product Details';
        el.appendChild(titleEl);

        ctx.data.attributes.forEach(({ label, value }) => {
          const attributeEl = document.createElement('li');
          attributeEl.textContent = `${label}: ${value}`;
          el.appendChild(attributeEl);
        });

        ctx.appendChild(el);
      },
    },
  })(block);
}
