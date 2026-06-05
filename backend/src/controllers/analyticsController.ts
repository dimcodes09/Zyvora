import type { Response } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import type { SellerRequest } from '../middleware/sellerAuth.js';

// ─── Day labels for graph output ────────────────────────────────────────────
const DAY_LABELS: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── TYPES ───────────────────────────────────────────────────────────────────
type DayEntry = { date: string; seller: number; platform: number };

// ─── GET /api/seller/analytics ──────────────────────────────────────────────
export const getSellerAnalytics = async (
  req: SellerRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // ── 1. Fetch all orders for this seller ───────────────────────────────
    const orders = await Order.find({ seller: new Types.ObjectId(sellerId) })
      .select('totalPrice commission sellerRevenue createdAt')
      .lean();

    // ── 2. Calculate totals ───────────────────────────────────────────────
    let totalRevenue    = 0;
    let totalCommission = 0;
    let sellerEarnings  = 0;

    for (const order of orders) {
      totalRevenue    += order.totalPrice ?? 0;
      totalCommission += order.commission    ?? order.totalPrice * 0.1;
      sellerEarnings  += order.sellerRevenue ?? order.totalPrice * 0.9;
    }

    totalRevenue    = parseFloat(totalRevenue.toFixed(2));
    totalCommission = parseFloat(totalCommission.toFixed(2));
    sellerEarnings  = parseFloat(sellerEarnings.toFixed(2));

    // ── 3. Unique users across all seller products ────────────────────────
    const sellerProducts = await Product.find({ sellerId })
      .select('uniqueViewers')
      .lean();

    const uniqueUserSet = new Set<string>();
    for (const product of sellerProducts) {
      for (const viewerId of (product.uniqueViewers ?? [])) {
        uniqueUserSet.add(viewerId.toString());
      }
    }
    const totalUsers = uniqueUserSet.size;

    // ── 4. Generate graph data grouped by weekday ─────────────────────────
    const graphMap = new Map<string, DayEntry>();

    // Initialise all 7 days so the chart always renders a full week
    for (const label of DAY_LABELS) {
      graphMap.set(label, { date: label, seller: 0, platform: 0 });
    }

    for (const order of orders) {
      const dayIndex = new Date(order.createdAt).getDay();           // 0–6
      const day      = DAY_LABELS[dayIndex] as string;               // always defined
      const entry    = graphMap.get(day) as DayEntry;                // always defined

      const commission = order.commission    ?? parseFloat((order.totalPrice * 0.1).toFixed(2));
      const sellerRev  = order.sellerRevenue ?? parseFloat((order.totalPrice * 0.9).toFixed(2));

      entry.seller   = parseFloat((entry.seller   + sellerRev).toFixed(2));
      entry.platform = parseFloat((entry.platform + commission).toFixed(2));
    }

    // Return Mon → Sun order (natural for weekly dashboards)
    const graphData: DayEntry[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
      (d) => graphMap.get(d) as DayEntry
    );

    // ── 5. Respond ────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalCommission,
        sellerEarnings,
        totalUsers,
        graphData,
      },
    });
  } catch (error) {
    console.error('[GET /api/seller/analytics]', error);
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
};
