// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.brand}>FineX Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$1,627.36</Text>
        <View style={styles.balanceRow}>
          <View style={styles.statBox}>
            <Ionicons name="arrow-down-circle" size={18} color={Colors.income} />
            <Text style={styles.statText}>Income: $2,400</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="arrow-up-circle" size={18} color={Colors.expense} />
            <Text style={styles.statText}>Spent: $772.64</Text>
          </View>
        </View>
      </Card>

      {/* Quick Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
          <Ionicons name="camera" size={22} color="#000" />
          <Text style={styles.actionBtnTextDark}>Scan Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.surfaceLight }]}>
          <Ionicons name="add-circle-outline" size={22} color={Colors.secondary} />
          <Text style={styles.actionBtnTextLight}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Spending Preview Box */}
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Monthly Spending Trend</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="analytics" size={48} color={Colors.secondary} />
          <Text style={styles.placeholderText}>Spending Chart View</Text>
        </View>
      </Card>

      {/* Recent Transactions List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      <Card style={styles.txCard}>
        <View style={styles.txItem}>
          <View style={styles.txIconBox}>
            <Ionicons name="cart" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txTitle}>Groceries</Text>
            <Text style={styles.txDate}>Today, 2:30 PM</Text>
          </View>
          <Text style={[styles.txAmount, { color: Colors.expense }]}>-$200.00</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.txItem}>
          <View style={styles.txIconBox}>
            <Ionicons name="flash" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txTitle}>Utilities</Text>
            <Text style={styles.txDate}>Yesterday</Text>
          </View>
          <Text style={[styles.txAmount, { color: Colors.expense }]}>-$95.00</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  brand: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  profileIcon: { padding: 8, backgroundColor: Colors.surface, borderRadius: 20 },
  balanceCard: { backgroundColor: Colors.surface, padding: 20, marginBottom: 20 },
  balanceLabel: { color: Colors.textSecondary, fontSize: 14 },
  balanceAmount: { color: Colors.textPrimary, fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: Colors.textSecondary, fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, height: 50, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionBtnTextDark: { color: '#000000', fontWeight: 'bold', fontSize: 15 },
  actionBtnTextLight: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
  chartCard: { marginBottom: 20 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  chartPlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeholderText: { color: Colors.textSecondary, fontSize: 12 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  txCard: { padding: 12 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  txIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  txDate: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});