import { Types } from 'mongoose';

// ─── Shared Item Shape ────────────────────────────────────────

export interface ICartItemInput {
  product: Types.ObjectId;
  quantity: number;
}

// ─── Cart Request Bodies ──────────────────────────────────────

export interface AddToCartBody {
  productId: string;
  quantity: number;
}

export interface UpdateQuantityBody {
  quantity: number;
}

// ─── Order Request Bodies ─────────────────────────────────────

export interface UpdateOrderStatusBody {
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
}

// ─── Populated Item (after .populate) ────────────────────────

export interface PopulatedCartItem {
  product: {
    _id: Types.ObjectId;
    name: string;
    price: number;
    stock: number;
  };
  quantity: number;
}