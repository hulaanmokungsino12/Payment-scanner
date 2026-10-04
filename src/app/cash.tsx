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
