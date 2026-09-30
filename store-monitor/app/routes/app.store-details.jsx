import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const res = await admin.graphql(`
    query {
      productsCount {
        count
      }
      collectionsCount {
        count
      }
    }
  `);

  const data = await res.json();

  const prdtcount = data.data.productsCount.count;
  const collectioncount = data.data.collectionsCount.count;

  return {
    prdtcount,
    collectioncount,
  };
};

export default function StoreDetailsPage() {
  const { prdtcount, collectioncount } = useLoaderData();

  return (
    <s-page heading="Store Details">
        <s-section
       heading="Total Products">
        <s-box>
          <s-paragraph>{prdtcount}</s-paragraph>
        </s-box>
      </s-section>

      <s-section heading="Total Collections">
        <s-box>
          <s-paragraph>{collectioncount}</s-paragraph>
        </s-box>
      </s-section>
    </s-page>
  );
}