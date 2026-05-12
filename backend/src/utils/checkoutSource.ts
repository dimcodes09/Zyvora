import { Types } from "mongoose";

import { Cart } from "../models/Cart.js";
import { Hamper } from "../models/Hamper.js";
import { AppError } from "../middleware/errorHandler.js";

export type CheckoutSource = "cart" | "hamper";

const HAMPER_PACKAGING_FEE = 199;

type ProductSnapshot = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  sellerId?: Types.ObjectId;
};

type PopulatedCartItem = {
  product: ProductSnapshot | null;
  quantity: number;
};

type PopulatedHamperItem = {
  productId: ProductSnapshot | null;
  quantity: number;
};

export type CheckoutOrderItem = {
  product: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  name: string;
};

export type CheckoutOrderData = {
  source: CheckoutSource;
  items: CheckoutOrderItem[];
  totalPrice: number;
  seller?: Types.ObjectId;
  notes?: string;
};

export const getCheckoutSource = (value: unknown): CheckoutSource =>
  value === "hamper" ? "hamper" : "cart";

const getSingleSeller = (
  products: ProductSnapshot[],
  requireSeller: boolean
): Types.ObjectId | undefined => {
  const sellerIds = [
    ...new Set(
      products
        .map((product) => product.sellerId?.toString())
        .filter((sellerId): sellerId is string => Boolean(sellerId))
    ),
  ];

  if (requireSeller && sellerIds.length === 0) {
    throw new AppError("Every product in the cart must be assigned to a seller.", 400);
  }

  if (requireSeller && sellerIds.length > 1) {
    throw new AppError("Please order products from one seller at a time.", 400);
  }

  return sellerIds.length === 1 ? new Types.ObjectId(sellerIds[0]) : undefined;
};

const assertStock = (
  entries: Array<{ product: ProductSnapshot; quantity: number }>
) => {
  const stockErrors: string[] = [];

  for (const item of entries) {
    if (item.product.stock < item.quantity) {
      stockErrors.push(
        `"${item.product.name}" has only ${item.product.stock} unit(s) in stock.`
      );
    }
  }

  if (stockErrors.length > 0) {
    throw new AppError(stockErrors.join(" "), 400);
  }
};

const toOrderItems = (
  entries: Array<{ product: ProductSnapshot; quantity: number }>
): CheckoutOrderItem[] =>
  entries.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    priceAtPurchase: item.product.price,
    name: item.product.name,
  }));

const getTotal = (items: CheckoutOrderItem[], packaging = 0): number =>
  Number(
    (
      items.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0
      ) + packaging
    ).toFixed(2)
  );

export const buildCheckoutOrderData = async (
  userId: string,
  source: CheckoutSource
): Promise<CheckoutOrderData> => {
  if (source === "hamper") {
    const hamper = await Hamper.findOne({ userId }).populate<{
      items: PopulatedHamperItem[];
    }>("items.productId", "name price stock sellerId");

    const validItems =
      hamper?.items
        .filter((item): item is { productId: ProductSnapshot; quantity: number } =>
          Boolean(item.productId)
        )
        .map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })) ?? [];

    if (validItems.length === 0) {
      throw new AppError("Your hamper is empty.", 400);
    }

    assertStock(validItems);

    const items = toOrderItems(validItems);
    const products = validItems.map((item) => item.product);
    const seller = getSingleSeller(products, false);
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = getTotal(items, itemCount > 0 ? HAMPER_PACKAGING_FEE : 0);

    return {
      source,
      items,
      totalPrice,
      ...(seller ? { seller } : {}),
      notes: `Hamper packaging fee included: Rs. ${HAMPER_PACKAGING_FEE}`,
    };
  }

  const cart = await Cart.findOne({ user: userId }).populate<{
    items: PopulatedCartItem[];
  }>("items.product", "name price stock sellerId");

  const validItems =
    cart?.items
      .filter((item): item is { product: ProductSnapshot; quantity: number } =>
        Boolean(item.product)
      )
      .map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })) ?? [];

  if (validItems.length === 0) {
    throw new AppError("Your cart is empty.", 400);
  }

  assertStock(validItems);

  const items = toOrderItems(validItems);
  const products = validItems.map((item) => item.product);
  const seller = getSingleSeller(products, true);

  return {
    source,
    items,
    totalPrice: getTotal(items),
    ...(seller ? { seller } : {}),
  };
};

export const clearCheckoutSource = async (
  userId: string,
  source: CheckoutSource
) => {
  if (source === "hamper") {
    await Hamper.findOneAndUpdate({ userId }, { $set: { items: [] } });
    return;
  }

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
};
