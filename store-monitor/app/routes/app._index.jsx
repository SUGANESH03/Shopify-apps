import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      shop {
        name
        myshopifyDomain
      }
    }
  `);

  const data = await response.json();

  return {
    shop: data.data.shop,
  };
}

export default function Dashboard() {
  const { shop } = useLoaderData();

  return (
    <Page
      title="Store Monitor"
      subtitle={`Welcome to ${shop.name}`}
    >
      <Layout>

        {/* Store Information */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">

              <Text as="h2" variant="headingMd">
                Store Information
              </Text>

              <Text as="p">
                Store: {shop.name}
              </Text>

              <Text as="p">
                Domain: {shop.myshopifyDomain}
              </Text>

            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Dashboard Cards */}
        <Layout.Section>
          <InlineStack gap="400">

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Products
                </Text>

                <Text as="p" variant="headingLg">
                  125
                </Text>

                <Button>
                  View Products
                </Button>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Orders
                </Text>

                <Text as="p" variant="headingLg">
                  48
                </Text>

                <Button>
                  View Orders
                </Button>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Low Stock
                </Text>

                <Text as="p" variant="headingLg">
                  7
                </Text>

                <Button>
                  View Products
                </Button>
              </BlockStack>
            </Card>

          </InlineStack>
        </Layout.Section>

      </Layout>
    </Page>
  );
}