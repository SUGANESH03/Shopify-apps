import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  DataTable,
  BlockStack,
  Banner,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      products(first: 20) {
        edges {
          node {
            title
            variants(first: 10) {
              edges {
                node {
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `);

  const result = await response.json();

  const lowStockProducts = [];

  result.data.products.edges.forEach((product) => {
    product.node.variants.edges.forEach((variant) => {
      const inventory = variant.node.inventoryQuantity;

      if (inventory < 5) {
        lowStockProducts.push({
          title: product.node.title,
          inventory,
        });
      }
    });
  });

  return {
    lowStockProducts,
  };
};

export default function Index() {
  const { lowStockProducts } = useLoaderData();

  return (
    <Page title="Low Stock Alert Dashboard">
      <Layout>
        <Layout.Section>
          <Banner tone="warning">
            <p>
              {lowStockProducts.length} product(s) need restocking.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                Low Stock Products
              </Text>

              <DataTable
                columnContentTypes={[
                  "text",
                  "numeric",
                  "text",
                ]}
                headings={[
                  "Product",
                  "Inventory",
                  "Status",
                ]}
                rows={lowStockProducts.map((product) => [
                  product.title,
                  product.inventory,
                  product.inventory <= 2 ? (
                    <Badge tone="critical">
                      Critical
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      Low
                    </Badge>
                  ),
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}