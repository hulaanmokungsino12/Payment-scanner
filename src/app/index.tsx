import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {

  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const scanOrder = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0].uri;

    console.log('Captured image:', imageUri);

    // ========================================
    // START SCANNING
    // ========================================

    setScanning(true);
    setScanComplete(false);

    try {
      const file = new File(imageUri);

      console.log('File URI:', file.uri);

      const base64data = await file.base64();

      console.log(
        'Base64 length:',
        base64data.length
      );

      console.log(
        'Base64 first 30:',
        base64data.substring(0, 30)
      );

      // ========================================
      // SEND IMAGE TO SERVER
      // ========================================

      const serverResponse = await fetch(
        'https://payment-scanner.onrender.com/scan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64data,
          }),
        }
      );

      const data = await serverResponse.json();

      console.log(
        'Server response:',
        JSON.stringify(data, null, 2)
      );

      // ========================================
      // GET ALL CUSTOMERS
      // ========================================

      const customers = data.result;

      if (!Array.isArray(customers)) {
        console.error(
          'Invalid Gemini response:',
          customers
        );

        setScanning(false);

        Alert.alert(
          'Scan Error',
          'The server returned an invalid order format.'
        );

        return;
      }

      console.log(
        'Customers detected:',
        customers.length
      );

      // ========================================
      // LOAD EXISTING RECORDS
      // ========================================

      const existingGcash =
        await AsyncStorage.getItem('gcashRecords');

      const existingCash =
        await AsyncStorage.getItem('cashRecords');

      const gcashRecords = existingGcash
        ? JSON.parse(existingGcash)
        : [];

      const cashRecords = existingCash
        ? JSON.parse(existingCash)
        : [];

      // ========================================
      // PROCESS EVERY CUSTOMER
      // ========================================

      let gcashCount = 0;
      let cashCount = 0;

      for (const customer of customers) {

        const paymentMethod =
          customer.payment?.toLowerCase().trim();

        console.log(
          'Customer:',
          customer.customer
        );

        console.log(
          'Payment:',
          customer.payment
        );

        // ========================================
        // GCASH
        // ========================================

        if (paymentMethod === 'gcash') {

          gcashRecords.push({
            result: customer,
            paid: false,
          });

          gcashCount++;

          console.log(
            `GCash record added: ${customer.customer}`
          );

        }

        // ========================================
        // CASH
        // ========================================

        else if (paymentMethod === 'cash') {

          cashRecords.push({
            result: customer,
            paid: false,
          });

          cashCount++;

          console.log(
            `Cash record added: ${customer.customer}`
          );

        }

        // ========================================
        // UNKNOWN PAYMENT
        // ========================================

        else {

          console.log(
            'Unknown payment method:',
            customer.payment,
            'for customer:',
            customer.customer
          );

        }
      }

      // ========================================
      // SAVE GCASH RECORDS
      // ========================================

      await AsyncStorage.setItem(
        'gcashRecords',
        JSON.stringify(gcashRecords)
      );

      // ========================================
      // SAVE CASH RECORDS
      // ========================================

      await AsyncStorage.setItem(
        'cashRecords',
        JSON.stringify(cashRecords)
      );

      // ========================================
      // LOG RESULTS
      // ========================================

      console.log(
        `Added ${gcashCount} GCash record(s)`
      );

      console.log(
        `Added ${cashCount} Cash record(s)`
      );

      // ========================================
      // SCANNING COMPLETE
      // ========================================

      setScanning(false);
      setScanComplete(true);

      setTimeout(() => {
        setScanComplete(false);
      }, 1500);

    } catch (error) {

      console.error(
        'Scan error:',
        error
      );

      setScanning(false);

      Alert.alert(
        'Scan Error',
        'Something went wrong while scanning the order.'
      );
    }
  };


  return (
    <View style={styles.container}>

      {/* ========================================
          HEADER
      ======================================== */}

      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome to
        </Text>

        <Text style={styles.title}>
          The Crisostomos
        </Text>

        <Text style={styles.subtitle}>
          Manage your orders with ease
        </Text>
      </View>


      {/* ========================================
          SCAN ORDER CARD
      ======================================== */}

      <TouchableOpacity
        style={styles.scanCard}
        onPress={scanOrder}
        activeOpacity={0.85}
      >

        <View style={styles.scanIconContainer}>
          <Text style={styles.scanIcon}>
            📷
          </Text>
        </View>

        <View style={styles.scanContent}>
          <Text style={styles.scanCardTitle}>
            Scan Order
          </Text>

          <Text style={styles.scanCardSubtitle}>
            Take a photo of an order to process it
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>


      {/* ========================================
          PAYMENT RECORDS
      ======================================== */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Payment Records
        </Text>

        <Text style={styles.sectionSubtitle}>
          View and manage your orders
        </Text>
      </View>


      {/* ========================================
          PAYMENT BUTTONS
      ======================================== */}

      <View style={styles.paymentContainer}>

        {/* GCASH */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            styles.gcashCard,
          ]}
          onPress={() => router.push('/gcash')}
          activeOpacity={0.85}
        >

          <View
            style={[
              styles.paymentIcon,
              styles.gcashIcon,
            ]}
          >
            <Text style={styles.paymentIconText}>
              G
            </Text>
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>
              GCash
            </Text>

            <Text style={styles.paymentDescription}>
              GCash payment records
            </Text>
          </View>

          <Text style={styles.paymentArrow}>
            ›
          </Text>

        </TouchableOpacity>


        {/* CASH */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            styles.cashCard,
          ]}
          onPress={() => router.push('/cash')}
          activeOpacity={0.85}
        >

          <View
            style={[
              styles.paymentIcon,
              styles.cashIcon,
            ]}
          >
            <Text style={styles.paymentIconText}>
              ₱
            </Text>
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>
              Cash
            </Text>

            <Text style={styles.paymentDescription}>
              Cash payment records
            </Text>
          </View>

          <Text style={styles.paymentArrow}>
            ›
          </Text>

        </TouchableOpacity>

      </View>


      {/* ========================================
          SCANNING MODAL
      ======================================== */}

      <Modal
        visible={scanning || scanComplete}
        transparent={true}
        animationType="fade"
      >

        <View style={styles.overlay}>

          <View style={styles.scanBox}>

            {scanning ? (

              <>
                <View style={styles.loadingCircle}>
                  <ActivityIndicator
                    size="large"
                    color="#C2185B"
                  />
                </View>

                <Text style={styles.scanTitle}>
                  Scanning...
                </Text>

                <Text style={styles.scanSubtitle}>
                  Analyzing the order
                </Text>
              </>

            ) : (

              <>
                <View style={styles.successCircle}>
                  <Text style={styles.completeIcon}>
                    ✓
                  </Text>
                </View>

                <Text style={styles.scanTitle}>
                  Scanning Complete!
                </Text>

                <Text style={styles.scanSubtitle}>
                  Order successfully processed
                </Text>
              </>

            )}

          </View>

        </View>

      </Modal>

    </View>
  );
}


// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  // ========================================
  // MAIN SCREEN
  // ========================================

  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
    paddingHorizontal: 20,
    paddingTop: 65,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    marginBottom: 30,
  },

  welcomeText: {
    fontSize: 16,
    color: '#9A6A7C',
    fontWeight: '500',
    marginBottom: 3,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7A123B',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#9A6A7C',
    marginTop: 6,
  },


  // ========================================
  // SCAN ORDER
  // ========================================

  scanCard: {
    width: '100%',
    minHeight: 105,
    backgroundColor: '#C2185B',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 35,

    shadowColor: '#C2185B',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },

  scanIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  scanIcon: {
    fontSize: 28,
  },

  scanContent: {
    flex: 1,
  },

  scanCardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },

  scanCardSubtitle: {
    fontSize: 13,
    color: '#FFE6EF',
    lineHeight: 18,
  },

  arrow: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    marginLeft: 8,
  },


  // ========================================
  // SECTION
  // ========================================

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#351620',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#9A6A7C',
    marginTop: 4,
  },


  // ========================================
  // PAYMENT CONTAINER
  // ========================================

  paymentContainer: {
    gap: 14,
  },


  // ========================================
  // PAYMENT CARDS
  // ========================================

  paymentCard: {
    width: '100%',
    minHeight: 88,

    borderRadius: 18,

    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
  },

  gcashCard: {
    backgroundColor: '#FFF0F6',
    borderColor: '#F2C4D5',
  },

  cashCard: {
    backgroundColor: '#FFF8EA',
    borderColor: '#F0D9A8',
  },


  // ========================================
  // PAYMENT ICON
  // ========================================

  paymentIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  gcashIcon: {
    backgroundColor: '#E83E8C',
  },

  cashIcon: {
    backgroundColor: '#D69E2E',
  },

  paymentIconText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },


  // ========================================
  // PAYMENT TEXT
  // ========================================

  paymentInfo: {
    flex: 1,
  },

  paymentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#351620',
    marginBottom: 3,
  },

  paymentDescription: {
    fontSize: 13,
    color: '#9A6A7C',
  },

  paymentArrow: {
    fontSize: 30,
    color: '#9A6A7C',
    fontWeight: '300',
    marginLeft: 8,
  },


  // ========================================
  // MODAL OVERLAY
  // ========================================

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(53, 22, 32, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },


  // ========================================
  // SCAN MODAL
  // ========================================

  scanBox: {
    width: 300,
    paddingVertical: 32,
    paddingHorizontal: 25,

    borderRadius: 24,

    backgroundColor: '#FFF9FB',

    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  loadingCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,

    backgroundColor: '#FFE6F0',

    alignItems: 'center',
    justifyContent: 'center',
  },

  successCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,

    backgroundColor: '#F8D7E5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  scanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#57132D',

    marginTop: 20,

    textAlign: 'center',
  },

  scanSubtitle: {
    fontSize: 14,
    color: '#9A6A7C',

    marginTop: 8,

    textAlign: 'center',
  },

  completeIcon: {
    fontSize: 42,
    fontWeight: '800',
    color: '#C2185B',
  },

});