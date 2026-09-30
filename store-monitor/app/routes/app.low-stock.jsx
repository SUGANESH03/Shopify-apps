import { useLoaderData, Form } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// LOADER: get saved threshold + query Shopify for products & inventory
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Get or create this shop's threshold setting
  let settings = await db.stockSettings.findUnique({
    where: { shop: session.shop },
  });
  if (!settings) {
    settings = await db.stockSettings.create({
      data: { shop: session.shop, threshold: 5 },
    });
  }

  // Query Shopify Admin API for products with inventory quantities
  const response = await admin.graphql(`
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            totalInventory
          }
        }
      }
    }
  `);
  const data = await response.json();
  const products = data.data.products.edges.map((edge) => edge.node);

  // Filter for low stock
  const lowStockProducts = products.filter(
    (p) => p.totalInventory < settings.threshold
  );

  return { threshold: settings.threshold, lowStockProducts };
};

// ACTION: update the threshold
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const threshold = parseInt(formData.get("threshold"), 10);

  await db.stockSettings.upsert({
    where: { shop: session.shop },
    update: { threshold },
    create: { shop: session.shop, threshold },
  });

  return { success: true };
};

export default function LowStockPage() {
  const { threshold, lowStockProducts } = useLoaderData();

  return (
    <s-page heading="Low Stock Alerts">
      <s-section heading="Alert threshold">
        <Form method="post">
          <s-stack gap="base">
            <s-text-field
              name="threshold"
              label="Alert me when stock is below"
              type="number"
              defaultValue={threshold}
              required
            />
            <s-button type="submit">Save threshold</s-button>
          </s-stack>
        </Form>
      </s-section>

      <s-section heading={`Low stock products (below ${threshold} units)`}>
        {lowStockProducts.length === 0 ? (
          <s-paragraph>No products are currently low on stock. 🎉</s-paragraph>
        ) : (
          <s-stack gap="base">
            {lowStockProducts.map((product) => (
              <s-box
                key={product.id}
                padding="base"
                border="base"
                borderRadius="base"
              >
                <s-text>{product.title}</s-text>
                <s-text tone="critical">
                  {product.totalInventory} units left
                </s-text>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}