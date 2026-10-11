import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type PaymentMethod = 'GCash' | 'Cash' | 'Unknown';

export type OrderRecord = {
  id: string;
  result: {
    customer: string;
    orders: any[];
    payment: PaymentMethod;
  };
  paid: boolean;
  created_at?: string;
};

type DatabaseOrder = {
  id: string;
  customer: string;
  payment_method: PaymentMethod;
  items: any[];
  paid: boolean;
  created_at?: string;
};

function toRecord(row: DatabaseOrder): OrderRecord {
  return {
    id: row.id,
    result: {
      customer: row.customer,
      orders: Array.isArray(row.items) ? row.items : [],
      payment: row.payment_method,
    },
    paid: row.paid,
    created_at: row.created_at,
  };
}


/** One-time import of order records saved by older app versions on this device. */
export async function migrateLegacyLocalOrders(userId: string) {
  const migrationFlag = 'ordersMigratedToSupabase_v1';
  if (await AsyncStorage.getItem(migrationFlag)) return { migrated: 0 };

  const legacyKeys: Array<{ key: string; paymentMethod: PaymentMethod }> = [
    { key: 'gcashRecords', paymentMethod: 'GCash' },
    { key: 'cashRecords', paymentMethod: 'Cash' },
    { key: 'unknownRecords', paymentMethod: 'Unknown' },
  ];
  const rows: Array<{
    customer: string;
    payment_method: PaymentMethod;
    items: any[];
    paid: boolean;
    created_by: string;
  }> = [];

  for (const legacy of legacyKeys) {
    const raw = await AsyncStorage.getItem(legacy.key);
    if (!raw) continue;
    let records: any[];
    try {
      const parsed = JSON.parse(raw);
      records = Array.isArray(parsed) ? parsed : [];
    } catch {
      throw new Error(`Could not read old ${legacy.key} records. The local data was left untouched.`);
    }

    for (const record of records) {
      const customer = String(record?.result?.customer ?? '').trim();
      if (!customer) continue;
      rows.push({
        customer,
        payment_method: legacy.paymentMethod,
        items: Array.isArray(record?.result?.orders) ? record.result.orders : [],
        paid: Boolean(record?.paid),
        created_by: userId,
      });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('orders').insert(rows);
    if (error) throw error;
  }

  // Only clear old order data after the database insert succeeds.
  for (const legacy of legacyKeys) {
    await AsyncStorage.removeItem(legacy.key);
  }
  await AsyncStorage.setItem(migrationFlag, 'true');
  return { migrated: rows.length };
}

export async function fetchOrders(paymentMethod: PaymentMethod): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer, payment_method, items, paid, created_at')
    .eq('payment_method', paymentMethod)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DatabaseOrder[]).map(toRecord);
}

export async function createOrdersFromScan(customers: any[], userId: string) {
  const rows = customers.map((customer) => {
    const rawPayment = String(customer?.payment ?? '').toLowerCase().trim();
    const payment_method: PaymentMethod = rawPayment === 'gcash'
      ? 'GCash'
      : rawPayment === 'cash'
        ? 'Cash'
        : 'Unknown';
    const name = String(customer?.customer ?? '').trim();
    if (!name) throw new Error('A scanned order is missing the customer name. Please correct the scan and try again.');
    return {
      customer: name,
      payment_method,
      items: Array.isArray(customer?.orders) ? customer.orders : [],
      paid: false,
      created_by: userId,
    };
  });

  if (rows.length === 0) return [];
  const { data, error } = await supabase.from('orders').insert(rows).select('id');
  if (error) throw error;
  return data ?? [];
}

export async function saveOrder(record: OrderRecord) {
  const { error } = await supabase
    .from('orders')
    .update({
      customer: record.result.customer.trim(),
      items: record.result.orders,
      paid: record.paid,
      payment_method: record.result.payment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', record.id);
  if (error) throw error;
}

export async function setOrderPaid(id: string, paid: boolean) {
  const { error } = await supabase
    .from('orders')
    .update({ paid, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteOrdersForPayment(paymentMethod: PaymentMethod) {
  const { error } = await supabase.from('orders').delete().eq('payment_method', paymentMethod);
  if (error) throw error;
}

export async function markAllOrdersPaid(paymentMethod: PaymentMethod) {
  const { error } = await supabase
    .from('orders')
    .update({ paid: true, updated_at: new Date().toISOString() })
    .eq('payment_method', paymentMethod);
  if (error) throw error;
}

export async function moveOrderPayment(id: string, paymentMethod: 'GCash' | 'Cash') {
  const { error } = await supabase
    .from('orders')
    .update({ payment_method: paymentMethod, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
