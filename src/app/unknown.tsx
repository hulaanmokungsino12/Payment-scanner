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
  'lumpianada': 70,
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


export default function UnknownScreen() {

  const { role } = useAuth();

  const [unknownRecords, setUnknownRecords] =
    useState<any[]>([]);

  // Track which record is being edited
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
      [...unknownRecords];

    updatedRecords[
      recordIndex
    ].result.customer =
      newName;

    setUnknownRecords(
      updatedRecords
    );
  };


  // ========================================
  // REFRESH WHEN SCREEN OPENS
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadRecords = async () => {
        try {
          const records = await fetchOrders('Unknown');
          if (isMounted) setUnknownRecords(records);
        } catch (error) {
          console.error('Error loading Unknown orders from Supabase:', error);
          if (isMounted) Alert.alert('Database Error', 'Could not load Unknown orders. Check your internet connection and Supabase setup.');
        }
      };
      void loadRecords();
      return () => { isMounted = false; };
    }, [])
  );


  // ========================================
  // GET TOTAL
  // ========================================

  const getTotal = () => {

    let total =
      0;

    unknownRecords.forEach(
      (record) => {

        record.result?.orders?.forEach(
          (order: any) => {

            const itemName =
              order.item || '';

            const quantity =
              order.quantity || 0;

            const cheese =
              order.cheese === true;

            total +=
              getItemTotal(
                itemName,
                quantity,
                cheese
              );

          }
        );

      }
    );

    return total;
  };



  // ========================================
  // GET TOTAL PAID
  // ========================================

  const getTotalPaid = () => {

    let totalPaid =
      0;

    unknownRecords.forEach(
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

            totalPaid +=
              getItemTotal(
                itemName,
                quantity,
                cheese
              );

          }
        );

      }
    );

    return totalPaid;
  };


  // ========================================
  // DELETE ALL RECORDS
  // ========================================

  const deleteAllRecords = () => {

    Alert.alert(
      'Delete All Unknown Records',
      'Are you sure you want to delete all unknown payment records?',
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

              await deleteOrdersForPayment('Unknown');

              setUnknownRecords([]);

              console.log(
                'All Unknown records deleted'
              );

            } catch (error) {

              console.error(
                'Error deleting all Unknown records:',
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

              const record = unknownRecords[indexToDelete];
              await deleteOrder(record.id);
              setUnknownRecords(unknownRecords.filter((_, index) => index !== indexToDelete));

              console.log(
                'Unknown record deleted'
              );

            } catch (error) {

              console.error(
                'Error deleting Unknown record:',
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
    const record = unknownRecords[indexToToggle];
    const nextPaid = !record.paid;
    try {
      await setOrderPaid(record.id, nextPaid);
      setUnknownRecords((current) => current.map((item, index) => index === indexToToggle ? { ...item, paid: nextPaid } : item));
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
      [...unknownRecords];

    updatedRecords[
      recordIndex
    ].result.orders[
      orderIndex
    ].item =
      newItemName;

    setUnknownRecords(
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
      [...unknownRecords];

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

    setUnknownRecords(
      updatedRecords
    );

  };


  // ========================================
  // SAVE UPDATED RECORD
  // ========================================

  const saveUpdate = async () => {
    try {
      const record = unknownRecords[editingIndex ?? -1];
      if (!record) return;
      if (!record.result.customer.trim()) {
        Alert.alert('Validation', 'Customer name cannot be empty.');
        return;
      }
      await saveOrder(record);
      setEditingIndex(null);
      Alert.alert('Saved', 'Unknown order updated successfully.');
    } catch (error) {
      console.error('Error saving Unknown order:', error);
      Alert.alert('Database Error', 'Could not save this order. Please try again.');
    }
  };


  // ========================================
  // MOVE RECORD TO ANOTHER PAYMENT TYPE
  // ========================================

  const moveRecord = (
    index: number,
    paymentType: 'GCash' | 'Cash'
  ) => {

    const record =
      unknownRecords[index];



    Alert.alert(
      `Move to ${paymentType}`,
      `Move this record to ${paymentType}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Move',
          onPress: async () => {

            try {

              await moveOrderPayment(record.id, paymentType);
              const updatedUnknown = unknownRecords.filter((_, recordIndex) => recordIndex !== index);
              setUnknownRecords(updatedUnknown);


              console.log(
                `Record moved to ${paymentType}`
              );

            } catch (error) {

              console.error(
                `Error moving record to ${paymentType}:`,
                error
              );

              Alert.alert(
                'Error',
                'Unable to move this record.'
              );

            }

          },
        },
      ]
    );

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

          <View style={styles.unknownHeaderIcon}>

            <Text
              style={
                styles.unknownHeaderIconText
              }
            >
              ?
            </Text>

          </View>

          <View>

            <Text style={styles.title}>
              Unknown Payments
            </Text>

            <Text style={styles.subtitle}>
              Payments that need to be identified
            </Text>

          </View>

        </View>

      </View>


      {/* ========================================
          TOTAL CARD
      ======================================== */}

      <View style={styles.totalCard}>

        <View style={styles.totalIcon}>

          <Text style={styles.totalIconText}>
            ₱
          </Text>

        </View>

        <View style={styles.totalInfo}>

          <Text style={styles.totalLabel}>
            Total Unknown
          </Text>

          <Text style={styles.totalAmount}>
            ₱{getTotal()}
          </Text>

          <Text style={styles.totalPaidText}>
            Paid: ₱{getTotalPaid()}
          </Text>

        </View>

      </View>


      {/* ========================================
          DELETE ALL
      ======================================== */}

      {role === 'admin' && (
<Pressable
        style={
          styles.deleteAllButton
        }
        onPress={
          deleteAllRecords
        }
      >

        <Text
          style={
            styles.deleteAllIcon
          }
        >
          🗑
        </Text>

        <Text
          style={
            styles.deleteAllButtonText
          }
        >
          Delete All Unknown Records
        </Text>

      </Pressable>
)}


      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {unknownRecords.length === 0 ? (

        <View
          style={
            styles.emptyCard
          }
        >

          <View
            style={
              styles.emptyIcon
            }
          >

            <Text
              style={
                styles.emptyIconText
              }
            >
              ?
            </Text>

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No Unknown Payments
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Payments that cannot be identified as
            GCash or Cash will appear here.
          </Text>

        </View>

      ) : (

        unknownRecords.map(
          (
            record,
            index
          ) => {

            let total = 0;

            return (

              <View
                key={index}
                style={
                  styles.recordCard
                }
              >

                {/* =================================
                    CARD HEADER
                ================================= */}

                <View
                  style={
                    styles.cardHeader
                  }
                >

                  <View
                    style={
                      styles.customerSection
                    }
                  >

                    <Text
                      style={
                        styles.customerLabel
                      }
                    >
                      CUSTOMER
                    </Text>

                    {editingIndex === index ? (

                      <TextInput
                        style={
                          styles.customerInput
                        }
                        value={
                          record.result?.customer ||
                          ''
                        }
                        onChangeText={
                          (text) =>
                            updateCustomerName(
                              index,
                              text
                            )
                        }
                      />

                    ) : (

                      <Text
                        style={
                          styles.customer
                        }
                      >
                        {
                          record.result?.customer ||
                          'Unknown Customer'
                        }
                      </Text>

                    )}

                  </View>


                  {/* UNKNOWN BADGE */}

                  <View
                    style={
                      styles.unknownBadge
                    }
                  >

                    <Text
                      style={
                        styles.unknownBadgeText
                      }
                    >
                      UNKNOWN
                    </Text>

                  </View>

                </View>


                {/* =================================
                    DIVIDER
                ================================= */}

                <View
                  style={
                    styles.divider
                  }
                />


                {/* =================================
                    ORDERS
                ================================= */}

                <Text
                  style={
                    styles.ordersLabel
                  }
                >
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

                    total +=
                      itemTotal;


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
                            onChangeText={
                              (text) =>
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
                            value={
                              String(
                                order.quantity
                              )
                            }
                            keyboardType="numeric"
                            onChangeText={
                              (text) =>
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
                        style={
                          styles.orderRow
                        }
                      >

                        <View
                          style={
                            styles.orderLeft
                          }
                        >

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

                <View
                  style={
                    styles.amountBox
                  }
                >

                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    TOTAL
                  </Text>

                  <Text
                    style={
                      styles.amount
                    }
                  >
                    ₱{total}
                  </Text>

                </View>


                {/* =================================
                    DETECTED PAYMENT
                ================================= */}

                <View
                  style={
                    styles.paymentBox
                  }
                >

                  <Text
                    style={
                      styles.paymentLabel
                    }
                  >
                    DETECTED PAYMENT
                  </Text>

                  <Text
                    style={
                      styles.payment
                    }
                  >
                    {
                      record.result?.payment ||
                      'Unknown'
                    }
                  </Text>

                </View>


                {/* =================================
                    UPDATE / SAVE
                ================================= */}

                {editingIndex === index ? (

                  <Pressable
                    style={
                      styles.saveButton
                    }
                    onPress={
                      saveUpdate
                    }
                  >

                    <Text
                      style={
                        styles.saveButtonIcon
                      }
                    >
                      ✓
                    </Text>

                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Save Update
                    </Text>

                  </Pressable>

                ) : (

                  <Pressable
                    style={
                      styles.updateButton
                    }
                    onPress={() =>
                      setEditingIndex(index)
                    }
                  >

                    <Text
                      style={
                        styles.updateButtonIcon
                      }
                    >
                      ✎
                    </Text>

                    <Text
                      style={
                        styles.updateButtonText
                      }
                    >
                      Update Order
                    </Text>

                  </Pressable>

                )}


                {/* =================================
                    MOVE TO GCASH
                ================================= */}

                <Pressable
                  style={
                    styles.gcashButton
                  }
                  onPress={() =>
                    moveRecord(
                      index,
                      'GCash'
                    )
                  }
                >

                  <Text
                    style={
                      styles.gcashButtonText
                    }
                  >
                    MOVE TO GCASH
                  </Text>

                </Pressable>


                {/* =================================
                    MOVE TO CASH
                ================================= */}

                <Pressable
                  style={
                    styles.cashButton
                  }
                  onPress={() =>
                    moveRecord(
                      index,
                      'Cash'
                    )
                  }
                >

                  <Text
                    style={
                      styles.cashButtonText
                    }
                  >
                    MOVE TO CASH
                  </Text>

                </Pressable>


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

  screen: {
    flex: 1,
    backgroundColor: '#FFF8EE',
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
    color: '#9A7A5A',
    fontWeight: '600',
    marginBottom: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  unknownHeaderIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,

    backgroundColor: '#F59E0B',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  unknownHeaderIconText: {
    fontSize: 29,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7A4A08',
  },

  subtitle: {
    fontSize: 13,
    color: '#9A7A5A',
    marginTop: 2,
  },


  // ========================================
  // TOTAL CARD
  // ========================================

  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#D97706',

    borderRadius: 20,

    padding: 18,

    marginBottom: 14,

    shadowColor: '#D97706',
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
    color: '#FFE8BF',
    fontWeight: '600',
    marginBottom: 2,
  },

  totalAmount: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  totalPaidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFE8BF',
    marginTop: 2,
  },


  // ========================================
  // DELETE ALL
  // ========================================

  deleteAllButton: {
    height: 48,

    borderRadius: 13,

    backgroundColor: '#FFF0D9',
    borderWidth: 1,
    borderColor: '#F3C98B',

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
    color: '#B45309',
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
    borderColor: '#F1D8B2',
  },

  emptyIcon: {
    width: 65,
    height: 65,

    borderRadius: 20,

    backgroundColor: '#FFF0D9',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#F59E0B',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#5C3B12',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#9A7A5A',
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
    borderColor: '#F1DFC5',

    shadowColor: '#7A4A08',
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
    color: '#B08A5F',
    marginBottom: 4,
  },

  customer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#352615',
  },

  customerInput: {
    height: 43,

    borderWidth: 1,
    borderColor: '#F59E0B',

    borderRadius: 10,

    fontSize: 18,
    fontWeight: '700',

    paddingHorizontal: 10,

    color: '#352615',
  },

  unknownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 8,

    backgroundColor: '#FFF0D9',
  },

  unknownBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#D97706',
  },


  // ========================================
  // DIVIDER
  // ========================================

  divider: {
    height: 1,
    backgroundColor: '#F3E8D8',
    marginVertical: 16,
  },


  // ========================================
  // ORDERS
  // ========================================

  ordersLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#B08A5F',
    marginBottom: 10,
  },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 8,

    borderBottomWidth: 1,
    borderBottomColor: '#F8F1E7',
  },

  orderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  order: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3827',
    flexShrink: 1,
  },

  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A1815D',
    marginLeft: 7,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#65430F',
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
    borderColor: '#E8CFA9',

    borderRadius: 9,

    fontSize: 14,

    paddingHorizontal: 9,

    color: '#352615',

    backgroundColor: '#FFFCF7',

    marginRight: 7,
  },

  quantityInput: {
    width: 52,
    height: 40,

    borderWidth: 1,
    borderColor: '#E8CFA9',

    borderRadius: 9,

    textAlign: 'center',

    fontSize: 15,

    color: '#352615',

    backgroundColor: '#FFFCF7',
  },

  xText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9A7A5A',

    marginHorizontal: 7,
  },


  // ========================================
  // TOTAL
  // ========================================

  amountBox: {
    marginTop: 16,

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: '#F0E3D2',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  amountLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#9A7A5A',
  },

  amount: {
    fontSize: 23,
    fontWeight: '900',
    color: '#D97706',
  },


  // ========================================
  // PAYMENT BOX
  // ========================================

  paymentBox: {
    marginTop: 10,

    padding: 12,

    borderRadius: 10,

    backgroundColor: '#FFF8EA',

    borderWidth: 1,
    borderColor: '#F4DFC0',
  },

  paymentLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#B08A5F',
    marginBottom: 3,
  },

  payment: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8A5708',
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
    borderColor: '#F0D3A3',
  },

  updateButtonIcon: {
    fontSize: 17,
    color: '#D97706',
    marginRight: 7,
  },

  updateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
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

    backgroundColor: '#D97706',
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
  // MOVE TO GCASH
  // ========================================

  gcashButton: {
    marginTop: 9,

    height: 45,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF0F6',

    borderWidth: 1,
    borderColor: '#F2C4D5',
  },

  gcashButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#C2185B',
  },


  // ========================================
  // MOVE TO CASH
  // ========================================

  cashButton: {
    marginTop: 9,

    height: 45,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#EEF8EE',

    borderWidth: 1,
    borderColor: '#B8DDB8',
  },

  cashButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#32803B',
  },


  // ========================================
  // PAID BUTTON
  // ========================================

  paidButton: {
    marginTop: 9,

    height: 45,

    borderWidth: 1,
    borderColor: '#D8C5A8',

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  paidButtonActive: {
    backgroundColor: '#FFF0D9',
    borderColor: '#F59E0B',
  },

  paidButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#806A4D',
  },

  paidButtonTextActive: {
    color: '#D97706',
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

});