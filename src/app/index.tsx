import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const menu = [
  ['Beef Smash Burger', '₱70'],
  ['Beef Cheese Burger', '₱80'],
  ['Puto', '₱12'],
  ['Ube Cheese Champorado', '₱55'],
  ['Freshly Baked Tuna Sushi', '₱80'],
  ['Cucumber Lemonade', '₱25'],
  ['Pork Mami Overload', '₱65'],
  ['Lumpianada', '₱70'],
];

export default function LandingPage() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />

          <Text style={styles.eyebrow}>WELCOME TO</Text>
          <Text style={styles.title}>The Crisostomos</Text>

          <Text style={styles.description}>
            Comfort food, freshly prepared. Browse our favorites and enjoy a
            simple, friendly ordering experience.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.primaryText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondary}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.secondaryText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Menu</Text>
          <Text style={styles.sectionSubtitle}>
            A selection of customer favorites
          </Text>

          {menu.map(([name, price]) => (
            <View key={name} style={styles.menuRow}>
              <Text style={styles.menuName}>{name}</Text>
              <Text style={styles.price}>{price}</Text>
            </View>
          ))}

          <Text style={styles.note}>
            Menu and prices may change. Please confirm availability when
            ordering.
          </Text>
        </View>

        <Text style={styles.footer}>
          The Crisostomos · Order management powered by PaymentScanner
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F3E9',
  },
  page: {
    padding: 20,
    paddingBottom: 36,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#E8D8B5',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 20,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '800',
    color: '#6B7654',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#342B23',
    textAlign: 'center',
    marginTop: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#65594C',
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  primary: {
    flex: 1,
    backgroundColor: '#244A38',
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#244A38',
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#244A38',
    fontWeight: '800',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4DCCF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#342B23',
  },
  sectionSubtitle: {
    color: '#817565',
    marginTop: 4,
    marginBottom: 14,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE8DC',
  },
  menuName: {
    flex: 1,
    color: '#342B23',
    fontSize: 15,
    fontWeight: '600',
  },
  price: {
    color: '#6B7654',
    fontWeight: '900',
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    color: '#817565',
    marginTop: 14,
    lineHeight: 18,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#958979',
    marginTop: 20,
  },
});
