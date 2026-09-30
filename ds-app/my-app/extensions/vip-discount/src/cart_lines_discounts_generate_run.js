import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
} from "../generated/api";

/**
 * @typedef {import("../generated/api").CartInput} RunInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 */

/**
 * @param {RunInput} input
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  const subtotal = Number(
    input.cart.cost.subtotalAmount.amount
  );

  const hasOrderDiscountClass =
    input.discount.discountClasses.includes(
      DiscountClass.Order
    );

  if (!hasOrderDiscountClass) {
    return {
      operations: [],
    };
  }

  if (subtotal <= 3000) {
    return {
      operations: [],
    };
  }

  return {
    operations: [
      {
        orderDiscountsAdd: {
          candidates: [
            {
              message: "5% OFF Orders Above ₹3000",
              targets: [
                {
                  orderSubtotal: {
                    excludedCartLineIds: [],
                  },
                },
              ],
              value: {
                percentage: {
                  value: 5,
                },
              },
            },
          ],
          selectionStrategy:
            OrderDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}