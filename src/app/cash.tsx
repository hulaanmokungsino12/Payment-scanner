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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// ========================================
// ITEMS + ALIASES + PRICES
// ========================================

const items = {

  // ========================================
  // BURGERS
  // ========================================

  'beef smash burger': {
    price: 70,
    aliases: [
      'beef smash burger',
      'beef burger',
      'smash burger',
      'burger',
    ],
  },

  'beef cheese burger': {
    price: 80,
    aliases: [
      'beef cheese burger',
      'beef cheeseburger',
      'cheese burger',
    ],
  },

  'beef smash burger with lemonade': {
    price: 85,
    aliases: [
      'beef smash burger with lemonade',
      'beef smash burger lemonade',
      'smash burger with lemonade',
    ],
  },

  'beef smash burger with potato wedges': {
    price: 110,
    aliases: [
      'beef smash burger with potato wedges',
      'beef smash burger and potato wedges',
      'smash burger with potato wedges',
    ],
  },

  'beef smash burger with potato wedges and lemonade': {
    price: 120,
    aliases: [
      'beef smash burger with potato wedges and lemonade',
      'beef smash burger potato wedges lemonade',
      'smash burger potato wedges lemonade',
    ],
  },


  // ========================================
  // PUTO
  // ========================================

  'puto': {
    price: 12,
    aliases: [
      'puto',
      'putos',
      'puto with cheese',
    ],
  },


  // ========================================
  // CHAMPORADO
  // ========================================

  'ube cheese champorado': {
    price: 55,
    aliases: [
      'ube cheese champorado',
      'ube champorado',
      'cheese champorado',
    ],
  },


  // ========================================
  // BAKED TUNA SUSHI
  // ========================================

  'freshly baked tuna sushi': {
    price: 80,
    aliases: [
      'freshly baked tuna sushi',
      'baked tuna sushi',
      'fresh baked tuna sushi',
      'tuna sushi',
    ],
  },

  'baked tuna sushi combo': {
    price: 115,
    aliases: [
      'baked tuna sushi combo',
      'tuna sushi combo',
    ],
  },


  // ========================================
  // NACHOS
  // ========================================

  'beef nachos with veggies': {
    price: 80,
    aliases: [
      'beef nachos with veggies',
      'beef nachos with vegetables',
      'beef nachos veggies',
      'beef nachos',
    ],
  },

  'beef nachos combo': {
    price: 95,
    aliases: [
      'beef nachos combo',
      'nachos combo',
    ],
  },


  // ========================================
  // DRINKS
  // ========================================

  'cucumber lemonade': {
    price: 25,
    aliases: [
      'cucumber lemonade',
      'cucumber lemon',
      'cucumber drink',
      'lemonade',
    ],
  },


  // ========================================
  // MAMI
  // ========================================

  'pork mami overload': {
    price: 65,
    aliases: [
      'pork mami overload',
      'pork mami',
      'mami overload',
    ],
  },

  'pork mami overload with egg': {
    price: 70,
    aliases: [
      'pork mami overload with egg',
      'pork mami with egg',
      'mami overload with egg',
    ],
  },


  // ========================================
  // POTATO WEDGES
  // ========================================

  'potato wedges': {
    price: 45,
    aliases: [
      'potato wedges',
      'potato wedge',
      'wedges',
    ],
  },


  // ========================================
  // LUMPIANADA
  // ========================================

  'lumpianada': {
    price: 60,
    aliases: [
      'lumpianada',
      'lumpia nada',
    ],
  },

  'lumpianada combo': {
    price: 75,
    aliases: [
      'lumpianada combo',
      'lumpianada and cucumber lemonade',
      'lumpianada with cucumber lemonade',
    ],
  },


  // ========================================
  // SEAWEED
  // ========================================

  'seaweed': {
    price: 20,
    aliases: [
      'seaweed',
      'seaweed pack',
    ],
  },


  // ========================================
  // SPECIAL COMBO
  // ========================================

  'baked sushi seaweed cucumber lemonade combo': {
    price: 115,
    aliases: [
      'baked sushi seaweed cucumber lemonade combo',
      'baked sushi seaweed lemonade combo',
      'baked sushi seaweed cucumber lemonade',
      '1 tub baked sushi 1 seaweed 1 cucumber lemonade',
      '1 tub of baked sushi 1 seaweed 1 cucumber lemonade',
    ],
  },

};


// ========================================
// NORMALIZE ITEM NAME
// ========================================

const normalizeItemName = (itemName: string) => {
  return itemName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};


// ========================================
// GET ITEM PRICE
// ========================================

const getItemPrice = (
  itemName: string,
  quantity: number = 1
) => {

  const normalizedItem =
    normalizeItemName(itemName);


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
    normalizedItem === 'seaweed' ||
    normalizedItem === 'seaweed pack'
  ) {

    const bundles =
      Math.floor(quantity / 3);

    const remaining =
      quantity % 3;

    return (
      (bundles * 50) +
      (remaining * 20)
    );
  }


  // ========================================
  // CHEESE DETECTION
  // ========================================

  const hasCheese =
    normalizedItem.includes('with cheese') ||
    normalizedItem.includes('cheese');


  // ========================================
  // FIND ITEM
  // ========================================

  for (const item of Object.values(items)) {

    const matched =
      item.aliases.some(
        (alias) =>
          normalizeItemName(alias) ===
          normalizedItem
      );

    if (matched) {

      let price = item.price;


      // ========================================
      // CHEESE ADD-ON
      //
      // Only these two combinations
      // have the +₱10 cheese option.
      // ========================================

      if (
        hasCheese &&
        (
          normalizedItem.includes(
            'beef smash burger with lemonade'
          ) ||
          normalizedItem.includes(
            'beef smash burger with potato wedges'
          )
        )
      ) {

        price += 10;
      }


      return price;
    }
  }


  // ========================================
  // HANDLE CHEESE MODIFIER SEPARATELY
  //
  // Example:
  // "beef smash burger with lemonade with cheese"
  // ========================================

  if (
    normalizedItem.includes(
      'beef smash burger with lemonade'
    ) &&
    hasCheese
  ) {
    return 95;
  }


  if (
    normalizedItem.includes(
      'beef smash burger with potato wedges'
    ) &&
    hasCheese
  ) {
    return 120;
  }


  return 0;
};


// ========================================
// GET TOTAL FOR ORDER
// ========================================

const getOrderTotal = (order: any) => {

  const itemName =
    order.item || '';

  const quantity =
    Number(order.quantity) || 0;

  return getItemPrice(
    itemName,
    quantity
  );
};


export default function CashScreen() {

  const [cashRecords, setCashRecords] =
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
      [...cashRecords];

    updatedRecords[
      recordIndex
    ].result.customer = newName;

    setCashRecords(
      updatedRecords
    );
  };


  // ========================================
  // LOAD RECORDS
  // ========================================

  const loadRecords = async () => {

    try {

      const savedRecords =
        await AsyncStorage.getItem(
          'cashRecords'
        );

      if (savedRecords) {

        setCashRecords(
          JSON.parse(savedRecords)
        );

      } else {

        setCashRecords([]);

      }

    } catch (error) {

      console.error(
        'Error loading Cash records:',
        error
      );

    }
  };


  // ========================================
  // GET TOTAL PAID
  // ========================================

  const getTotalPaid = () => {

    let totalPaid = 0;

    cashRecords.forEach((record) => {

      if (!record.paid) {
        return;
      }

      record.result?.orders?.forEach(
        (order: any) => {

          totalPaid +=
            getOrderTotal(order);

        }
      );

    });

    return totalPaid;
  };


  // ========================================
  // REFRESH WHEN SCREEN OPENS
  // ========================================

  useFocusEffect(
    useCallback(() => {
      loadRecords();
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

              await AsyncStorage.removeItem(
                'cashRecords'
              );

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

              const updatedRecords =
                cashRecords.filter(
                  (_, index) =>
                    index !== indexToDelete
                );

              setCashRecords(
                updatedRecords
              );

              await AsyncStorage.setItem(
                'cashRecords',
                JSON.stringify(
                  updatedRecords
                )
              );

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

  const togglePaid = async (
    indexToToggle: number
  ) => {

    try {

      const updatedRecords =
        [...cashRecords];

      updatedRecords[indexToToggle] = {
        ...updatedRecords[indexToToggle],

        paid:
          !updatedRecords[indexToToggle]
            .paid,
      };

      setCashRecords(
        updatedRecords
      );

      await AsyncStorage.setItem(
        'cashRecords',
        JSON.stringify(
          updatedRecords
        )
      );

      console.log(
        'Paid status:',
        updatedRecords[indexToToggle].paid
      );

    } catch (error) {

      console.error(
        'Error updating paid status:',
        error
      );

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

      const updatedRecords =
        cashRecords.map(
          (record) => ({
            ...record,
            paid: true,
          })
        );

      setCashRecords(
        updatedRecords
      );

      await AsyncStorage.setItem(
        'cashRecords',
        JSON.stringify(
          updatedRecords
        )
      );

      Alert.alert(
        'Updated',
        'All Cash records have been marked as paid.'
      );

      console.log(
        'All Cash records marked as paid'
      );

    } catch (error) {

      console.error(
        'Error marking all Cash records as paid:',
        error
      );

    }
  };


  // ========================================
  // SAVE UPDATED RECORD
  // ========================================

  const saveUpdate = async (
    index: number
  ) => {

    try {

      await AsyncStorage.setItem(
        'cashRecords',
        JSON.stringify(
          cashRecords
        )
      );

      setEditingIndex(null);

      console.log(
        'Cash record updated successfully'
      );

    } catch (error) {

      console.error(
        'Error saving updated Cash record:',
        error
      );

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


      {/* ========================================
          UPDATE ALL
      ======================================== */}

      <Pressable
        style={styles.updateAllButton}
        onPress={updateAll}
      >

        <Text style={styles.updateAllButtonText}>
          UPDATE ALL
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
                      Number(order.quantity) || 0;

                    const itemTotal =
                      getOrderTotal(order);

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
                            ₱{
                              quantity > 0
                                ? Math.round(
                                    itemTotal /
                                    quantity
                                  )
                                : 0
                            }
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