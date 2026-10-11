import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOrders, saveOrder, setOrderPaid, deleteOrder, deleteOrdersForPayment, markAllOrdersPaid, moveOrderPayment } from '@/lib/orders';
import { useFocusEffect } from 'expo-router';

// ========================================
// OFFICIAL ITEMS + PRICES
// Gemini normalizes customer wording
// before it reaches the app.
// ========================================

const items: Record<string, number> = {
  'beef smash burger': 70,
  'beef cheese burger': 80,
  'puto': 12,
  'ube cheese champorado': 55,
  'freshly baked tuna sushi': 80,
  'baked tuna sushi combo': 115,
  'beef nachos with veggies': 80,
  'beef nachos combo': 95,
  'cucumber lemonade': 25,
  'pork mami overload': 65,
  'pork mami overload with egg': 70,
  'potato wedges': 45,
  'beef smash burger with lemonade': 85,
  'beef smash burger with potato wedges': 110,
  'beef smash burger with potato wedges and lemonade': 120,
  'lumpianada': 60,
  'lumpianada combo': 75,
  'seaweed': 20,
  'combo': 115,
};

// ========================================
// GET ITEM PRICE
// Handles cheese modifier
// ========================================

const getItemPrice = (
  itemName: string,
  cheese: boolean = false
) => {

  const normalizedItem =
    itemName
      .toLowerCase()
      .trim();

  let price =
    items[normalizedItem] || 0;


  // ========================================
  // CHEESE ADD-ON
  // ========================================

  if (
    cheese &&
    (
      normalizedItem ===
        'beef smash burger with lemonade' ||

      normalizedItem ===
        'beef smash burger with potato wedges'
    )
  ) {

    price += 10;

  }

  return price;
};

// ========================================
// GET ITEM TOTAL
// Handles special Seaweed pricing
// ========================================

const getItemTotal = (
  itemName: string,
  quantity: number,
  cheese: boolean = false
) => {

  const normalizedItem =
    itemName
      .toLowerCase()
      .trim();


  // ========================================
  // SEAWEED SPECIAL PRICING
  //
  // 1 = ₱20
  // 2 = ₱40
  // 3 = ₱50
  // 4 = ₱70
  // 5 = ₱90
  // 6 = ₱100
  // ========================================

  if (
    normalizedItem === 'seaweed'
  ) {

    const safeQuantity =
      Math.max(
        0,
        Number(quantity) || 0
      );

    const groupsOfThree =
      Math.floor(
        safeQuantity / 3
      );

    const remaining =
      safeQuantity % 3;

    return (
      groupsOfThree * 50 +
      remaining * 20
    );
  }


  // ========================================
  // NORMAL ITEMS
  // ========================================

  const price =
    getItemPrice(
      itemName,
      cheese
    );

  return (
    price *
    (Number(quantity) || 0)
  );
};

export default function CashScreen() {

  const { role } = useAuth();

  const [cashRecords, setCashRecords] =
    useState<any[]>([]);

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);


  // ========================================
  // UPDATE CUSTOMER NAME
  // ========================================

  const updateCustomerName = (
    recordIndex: number,
    newName: string
  ) => {

    const updatedRecords =
      [...cashRecords];

    updatedRecords[
      recordIndex
    ].result.customer = newName;

    setCashRecords(
      updatedRecords
    );
  };


  // Records are loaded from Supabase when this screen comes into focus.


  // ========================================
  // GET TOTAL PAID
  // ========================================

  const getTotalPaid = () => {

    let totalPaid = 0;

    cashRecords.forEach(
      (record) => {

        if (!record.paid) {
          return;
        }

        record.result?.orders?.forEach(
          (order: any) => {

            const itemName =
              order.item || '';

            const quantity =
              order.quantity || 0;

            const cheese =
              order.cheese === true;

            const itemTotal =
              getItemTotal(
                itemName,
                quantity,
                cheese
              );

            totalPaid +=
              itemTotal;

          }
        );

      }
    );

    return totalPaid;
  };


  // ========================================
  // REFRESH WHEN SCREEN OPENS
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadRecords = async () => {
        try {
          const records = await fetchOrders('Cash');
          if (isMounted) setCashRecords(records);
        } catch (error) {
          console.error('Error loading Cash orders from Supabase:', error);
          if (isMounted) Alert.alert('Database Error', 'Could not load Cash orders. Check your internet connection and Supabase setup.');
        }
      };
      void loadRecords();
      return () => { isMounted = false; };
    }, [])
  );


  // ========================================
  // DELETE ALL RECORDS
  // ========================================

  const deleteAllRecords = () => {

    Alert.alert(
      'Delete All Records',
      'Are you sure you want to delete all records?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete All',
          style: 'destructive',

          onPress: async () => {

            try {

              await deleteOrdersForPayment('Cash');

              setCashRecords([]);

              console.log(
                'All Cash records deleted'
              );

            } catch (error) {

              console.error(
                'Error deleting Cash records:',
                error
              );

            }

          },
        },
      ]
    );
  };


  // ========================================
  // DELETE RECORD
  // ========================================

  const deleteRecord = (
    indexToDelete: number
  ) => {

    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {

            try {

              const record = cashRecords[indexToDelete];
              await deleteOrder(record.id);
              setCashRecords(cashRecords.filter((_, index) => index !== indexToDelete));

              console.log(
                'Cash record deleted'
              );

            } catch (error) {

              console.error(
                'Error deleting Cash record:',
                error
              );

            }

          },
        },
      ]
    );
  };


  // ========================================
  // TOGGLE PAID STATUS
  // ========================================

  const togglePaid = async (indexToToggle: number) => {
    const record = cashRecords[indexToToggle];
    const nextPaid = !record.paid;
    try {
      await setOrderPaid(record.id, nextPaid);
      setCashRecords((current) => current.map((item, index) => index === indexToToggle ? { ...item, paid: nextPaid } : item));
    } catch (error) {
      console.error('Error updating paid status:', error);
      Alert.alert('Database Error', 'Could not update the paid status. Please try again.');
    }
  };


  // ========================================
  // UPDATE ITEM NAME
  // ========================================

  const updateItemName = (
    recordIndex: number,
    orderIndex: number,
    newItemName: string
  ) => {

    const updatedRecords =
      [...cashRecords];

    updatedRecords[
      recordIndex
    ].result.orders[
      orderIndex
    ].item = newItemName;

    setCashRecords(
      updatedRecords
    );
  };


  // ========================================
  // UPDATE QUANTITY
  // ========================================

  const updateQuantity = (
    recordIndex: number,
    orderIndex: number,
    newQuantity: string
  ) => {

    const updatedRecords =
      [...cashRecords];

    const quantity =
      parseInt(
        newQuantity,
        10
      );

    updatedRecords[
      recordIndex
    ].result.orders[
      orderIndex
    ].quantity =
      isNaN(quantity)
        ? 0
        : quantity;

    setCashRecords(
      updatedRecords
    );
  };


  // ========================================
  // SAVE ALL UPDATED RECORD
  // ========================================

  const updateAll = async () => {
    try {
      await markAllOrdersPaid('Cash');
      setCashRecords((current) => current.map((record) => ({ ...record, paid: true })));
      Alert.alert('Updated', 'All Cash records have been marked as paid.');
    } catch (error) {
      console.error('Error marking all Cash records as paid:', error);
      Alert.alert('Database Error', 'Could not mark all records as paid. Please try again.');
    }
  };


  // ========================================
  // SAVE UPDATED RECORD
  // ========================================

  const saveUpdate = async (index: number) => {
    try {
      const record = cashRecords[index];
      if (!record.result.customer.trim()) {
        Alert.alert('Validation', 'Customer name cannot be empty.');
        return;
      }
      await saveOrder(record);
      setEditingIndex(null);
      Alert.alert('Saved', 'Cash order updated successfully.');
    } catch (error) {
      console.error('Error saving updated Cash order:', error);
      Alert.alert('Database Error', 'Could not save this order. Please try again.');
    }
  };


  // ========================================
  // SCREEN
  // ========================================

  return (

    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
    >

      {/* ========================================
          HEADER
      ======================================== */}

      <View style={styles.header}>

        <Text style={styles.smallHeader}>
          Payment Records
        </Text>

        <View style={styles.titleRow}>

          <View style={styles.cashHeaderIcon}>

            <Text style={styles.cashHeaderIconText}>
              ₱
            </Text>

          </View>

          <View>

            <Text style={styles.title}>
              Cash
            </Text>

            <Text style={styles.subtitle}>
              Cash payment records
            </Text>

          </View>

        </View>

      </View>


      {/* ========================================
          TOTAL PAID CARD
      ======================================== */}

      <View style={styles.totalCard}>

        <View style={styles.totalIcon}>

          <Text style={styles.totalIconText}>
            ₱
          </Text>

        </View>

        <View style={styles.totalInfo}>

          <Text style={styles.totalLabel}>
            Total Paid
          </Text>

          <Text style={styles.totalAmount}>
            ₱{getTotalPaid()}
          </Text>

        </View>

      </View>


      {/* ========================================
          DELETE ALL
      ======================================== */}

      {role === 'admin' && (
<Pressable
        style={styles.deleteAllButton}
        onPress={deleteAllRecords}
      >

        <Text style={styles.deleteAllIcon}>
          🗑
        </Text>

        <Text style={styles.deleteAllButtonText}>
          Delete All Records
        </Text>

      </Pressable>
)}


      {/* ========================================
          UPDATE ALL
      ======================================== */}

      <Pressable
        style={styles.updateAllButton}
        onPress={updateAll}
      >

        <Text style={styles.updateAllButtonText}>
          ALL PAID
        </Text>

      </Pressable>


      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {cashRecords.length === 0 ? (

        <View style={styles.emptyCard}>

          <View style={styles.emptyIcon}>

            <Text style={styles.emptyIconText}>
              ₱
            </Text>

          </View>

          <Text style={styles.emptyTitle}>
            No Cash Records
          </Text>

          <Text style={styles.emptyText}>
            Scanned Cash orders will appear here.
          </Text>

        </View>

      ) : (

        cashRecords.map(
          (record, index) => {

            let total = 0;

            return (

              <View
                key={index}
                style={styles.recordCard}
              >

                {/* =================================
                    CARD HEADER
                ================================= */}

                <View style={styles.cardHeader}>

                  <View style={styles.customerSection}>

                    <Text style={styles.customerLabel}>
                      CUSTOMER
                    </Text>

                    {editingIndex === index ? (

                      <TextInput
                        style={styles.customerInput}
                        value={
                          record.result?.customer ||
                          ''
                        }
                        onChangeText={(text) =>
                          updateCustomerName(
                            index,
                            text
                          )
                        }
                      />

                    ) : (

                      <Text style={styles.customer}>
                        {record.result?.customer ||
                          'Unknown Customer'}
                      </Text>

                    )}

                  </View>


                  {/* CASH BADGE */}

                  <View style={styles.cashBadge}>

                    <Text style={styles.cashBadgeText}>
                      CASH
                    </Text>

                  </View>

                </View>


                {/* =================================
                    DIVIDER
                ================================= */}

                <View style={styles.divider} />


                {/* =================================
                    ORDERS
                ================================= */}

                <Text style={styles.ordersLabel}>
                  ORDER
                </Text>

                {record.result?.orders?.map(
                  (
                    order: any,
                    orderIndex: number
                  ) => {

                    const itemName =
                      order.item || '';

                    const quantity =
                      order.quantity || 0;

                    const cheese =
                      order.cheese === true;

                    const price =
                      getItemPrice(
                        itemName,
                        cheese
                      );

                    const itemTotal =
                      getItemTotal(
                        itemName,
                        quantity,
                        cheese
                      );

                    total += itemTotal;


                    // =================================
                    // EDIT MODE
                    // =================================

                    if (
                      editingIndex === index
                    ) {

                      return (

                        <View
                          key={orderIndex}
                          style={
                            styles.editOrderRow
                          }
                        >

                          <TextInput
                            style={
                              styles.itemNameInput
                            }
                            value={
                              order.item || ''
                            }
                            onChangeText={(text) =>
                              updateItemName(
                                index,
                                orderIndex,
                                text
                              )
                            }
                          />

                          <TextInput
                            style={
                              styles.quantityInput
                            }
                            value={String(
                              order.quantity
                            )}
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              updateQuantity(
                                index,
                                orderIndex,
                                text
                              )
                            }
                          />

                          <Text
                            style={
                              styles.xText
                            }
                          >
                            x
                          </Text>

                          <Text
                            style={
                              styles.itemPrice
                            }
                          >
                            ₱{price}
                          </Text>

                        </View>

                      );

                    }


                    // =================================
                    // NORMAL MODE
                    // =================================

                    return (

                      <View
                        key={orderIndex}
                        style={styles.orderRow}
                      >

                        <View style={styles.orderLeft}>

                          <Text
                            style={
                              styles.order
                            }
                          >
                            {itemName}

                            {cheese &&
                              (
                                itemName.toLowerCase().trim() ===
                                  'beef smash burger with lemonade' ||
                                itemName.toLowerCase().trim() ===
                                  'beef smash burger with potato wedges'
                              )
                              ? ' + Cheese'
                              : ''}
                          </Text>

                          <Text
                            style={
                              styles.quantityText
                            }
                          >
                            x{quantity}
                          </Text>

                        </View>

                        <Text
                          style={
                            styles.itemPrice
                          }
                        >
                          ₱{itemTotal}
                        </Text>

                      </View>

                    );

                  }
                )}


                {/* =================================
                    TOTAL
                ================================= */}

                <View style={styles.amountBox}>

                  <Text style={styles.amountLabel}>
                    TOTAL
                  </Text>

                  <Text style={styles.amount}>
                    ₱{total}
                  </Text>

                </View>


                {/* =================================
                    PAYMENT
                ================================= */}

                <Text style={styles.payment}>
                  Payment: {
                    record.result?.payment ||
                    'Cash'
                  }
                </Text>


                {/* =================================
                    UPDATE / SAVE
                ================================= */}

                {editingIndex === index ? (

                  <Pressable
                    style={styles.saveButton}
                    onPress={() =>
                      saveUpdate(index)
                    }
                  >

                    <Text style={styles.saveButtonIcon}>
                      ✓
                    </Text>

                    <Text style={styles.saveButtonText}>
                      Save Update
                    </Text>

                  </Pressable>

                ) : (

                  <Pressable
                    style={styles.updateButton}
                    onPress={() =>
                      setEditingIndex(index)
                    }
                  >

                    <Text style={styles.updateButtonIcon}>
                      ✎
                    </Text>

                    <Text style={styles.updateButtonText}>
                      Update Order
                    </Text>

                  </Pressable>

                )}


                {/* =================================
                    PAID BUTTON
                ================================= */}

                <Pressable
                  style={[
                    styles.paidButton,

                    record.paid &&
                      styles.paidButtonActive,
                  ]}
                  onPress={() =>
                    togglePaid(index)
                  }
                >

                  <Text
                    style={[
                      styles.paidButtonText,

                      record.paid &&
                        styles.paidButtonTextActive,
                    ]}
                  >
                    {record.paid
                      ? '✓  PAID'
                      : 'MARK AS PAID'}
                  </Text>

                </Pressable>


                {/* =================================
                    DELETE
                ================================= */}

                {role === 'admin' && (
<Pressable
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    deleteRecord(index)
                  }
                >

                  <Text
                    style={
                      styles.deleteButtonText
                    }
                  >
                    Delete Record
                  </Text>

                </Pressable>
)}

              </View>

            );

          }
        )

      )}

    </ScrollView>
  );
}


// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  // ========================================
  // SCREEN
  // ========================================

  screen: {
    flex: 1,
    backgroundColor: '#FFF8EA',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    marginBottom: 22,
  },

  smallHeader: {
    fontSize: 14,
    color: '#A98A58',
    fontWeight: '600',
    marginBottom: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cashHeaderIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,

    backgroundColor: '#D69E2E',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  cashHeaderIconText: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#6B4F1D',
  },

  subtitle: {
    fontSize: 13,
    color: '#A98A58',
    marginTop: 2,
  },


  // ========================================
  // TOTAL CARD
  // ========================================

  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#B7791F',

    borderRadius: 20,

    padding: 18,

    marginBottom: 14,

    shadowColor: '#B7791F',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  totalIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: 'rgba(255,255,255,0.18)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  totalIconText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  totalInfo: {
    flex: 1,
  },

  totalLabel: {
    fontSize: 13,
    color: '#FFF1CE',
    fontWeight: '600',
    marginBottom: 2,
  },

  totalAmount: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
  },


  // ========================================
  // DELETE ALL
  // ========================================

  deleteAllButton: {
    height: 48,

    borderRadius: 13,

    backgroundColor: '#FFF0D2',

    borderWidth: 1,
    borderColor: '#E9C77D',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 20,
  },

  deleteAllIcon: {
    fontSize: 16,
    marginRight: 7,
  },

  deleteAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B6815',
  },


  // ========================================
  // EMPTY STATE
  // ========================================

  emptyCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingVertical: 40,
    paddingHorizontal: 25,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#EBDCBF',
  },

  emptyIcon: {
    width: 65,
    height: 65,

    borderRadius: 20,

    backgroundColor: '#FFF0D2',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#D69E2E',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#5A431B',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#A98A58',
    textAlign: 'center',
  },


  // ========================================
  // RECORD CARD
  // ========================================

  recordCard: {
    padding: 18,

    marginBottom: 15,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#EBDCBF',

    shadowColor: '#6B4F1D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },


  // ========================================
  // CARD HEADER
  // ========================================

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  customerSection: {
    flex: 1,
  },

  customerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#B59A6A',
    marginBottom: 4,
  },

  customer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3D301C',
  },

  customerInput: {
    height: 43,

    borderWidth: 1,
    borderColor: '#D69E2E',

    borderRadius: 10,

    fontSize: 18,
    fontWeight: '700',

    paddingHorizontal: 10,

    color: '#3D301C',
  },

  cashBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 8,

    backgroundColor: '#FFF0D2',
  },

  cashBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#B7791F',
  },


  // ========================================
  // DIVIDER
  // ========================================

  divider: {
    height: 1,
    backgroundColor: '#F0E7D6',
    marginVertical: 16,
  },


  // ========================================
  // ORDERS
  // ========================================

  ordersLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#B59A6A',
    marginBottom: 10,
  },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 8,

    borderBottomWidth: 1,
    borderBottomColor: '#F7F1E6',
  },

  orderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  order: {
    fontSize: 15,
    fontWeight: '600',
    color: '#514226',
    flexShrink: 1,
  },

  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A98A58',
    marginLeft: 7,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B4F1D',
  },


  // ========================================
  // EDIT MODE
  // ========================================

  editOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  itemNameInput: {
    flex: 1,

    height: 40,

    borderWidth: 1,
    borderColor: '#E2C78E',

    borderRadius: 9,

    fontSize: 14,

    paddingHorizontal: 9,

    color: '#3D301C',

    backgroundColor: '#FFFCF5',

    marginRight: 7,
  },

  quantityInput: {
    width: 52,
    height: 40,

    borderWidth: 1,
    borderColor: '#E2C78E',

    borderRadius: 9,

    textAlign: 'center',

    fontSize: 15,

    color: '#3D301C',

    backgroundColor: '#FFFCF5',
  },

  xText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A98A58',

    marginHorizontal: 7,
  },


  // ========================================
  // TOTAL
  // ========================================

  amountBox: {
    marginTop: 16,

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: '#EDE3D1',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amountLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#A98A58',
  },

  amount: {
    fontSize: 23,
    fontWeight: '900',
    color: '#B7791F',
  },


  // ========================================
  // PAYMENT
  // ========================================

  payment: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
    color: '#A98A58',
  },


  // ========================================
  // UPDATE BUTTON
  // ========================================

  updateButton: {
    marginTop: 16,

    height: 45,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    backgroundColor: '#FFF8EA',

    borderWidth: 1,
    borderColor: '#EBD39E',
  },

  updateButtonIcon: {
    fontSize: 17,
    color: '#B7791F',
    marginRight: 7,
  },

  updateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B7791F',
  },


  // ========================================
  // SAVE BUTTON
  // ========================================

  saveButton: {
    marginTop: 16,

    height: 45,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    backgroundColor: '#B7791F',
  },

  saveButtonIcon: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 7,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },


  // ========================================
  // PAID BUTTON
  // ========================================

  paidButton: {
    marginTop: 9,

    height: 45,

    borderWidth: 1,
    borderColor: '#D8C39A',

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  paidButtonActive: {
    backgroundColor: '#FFF0D2',
    borderColor: '#D69E2E',
  },

  paidButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#806C49',
  },

  paidButtonTextActive: {
    color: '#B7791F',
  },


  // ========================================
  // DELETE
  // ========================================

  deleteButton: {
    marginTop: 9,

    height: 43,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF1F1',

    borderWidth: 1,
    borderColor: '#F1CACA',
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C03939',
  },


  // ========================================
  // UPDATE ALL
  // ========================================

  updateAllButton: {
    height: 48,

    borderRadius: 13,

    backgroundColor: '#FFF0D2',

    borderWidth: 1,
    borderColor: '#E9C77D',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 20,
  },

  updateAllButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#B7791F',
  },

});