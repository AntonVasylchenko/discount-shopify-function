import type {
  RunInput,
  FunctionRunResult,
  ProductVariant,
  CartLine,
  ProductVariantTarget,
} from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

function groupByDiscountId(array: any) {
  return array.reduce((result, item) => {
    const key = item?.discountId.value;
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

export function run(input: RunInput): FunctionRunResult {
  const groupProductWithDiscount = input.cart.lines.filter((line) => line.discountId?.value);
  
  console.log(input.cart.lines.length);
  
  if (input.cart.lines.length < 2) {
    return EMPTY_DISCOUNT
  }
  const groupedData = Object.values(groupByDiscountId(groupProductWithDiscount)).filter((group) => {
    return (group as CartLine[]).length === 2;
  })

  const groupedDataCart = (groupedData[0] as CartLine[]).filter(line => line.quantity === 1).map((line) =>   {
    return {
      productVariant: {
        id: String((line.merchandise as ProductVariant).id),
        quantity: 1
      },
    };
  });


  if (groupedDataCart.length && groupedDataCart.length % 2 === 0) {
    const result: FunctionRunResult = {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          targets: groupedDataCart,
          value: {
            percentage: {
              value: 10,
            },
          },
          message: "10% OFF",
        },
      ],
    };
    return result;
  }

  return EMPTY_DISCOUNT
}
