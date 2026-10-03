// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';

export const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { transactions, fetchTransactions, fetchBudgets } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  // Compute live summary figures from SQLite data
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = 2400; // Placeholder until income streams are logged dynamically
  const netBalance = totalIncome - totalSpent;

  return (
    <View style={styles.flexContainer}>
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

        {/* Dynamic Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${netBalance.toFixed(2)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.statBox}>
              <Ionicons name="arrow-down-circle" size={18} color={Colors.income} />
              <Text style={styles.statText}>Income: ${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="arrow-up-circle" size={18} color={Colors.expense} />
              <Text style={styles.statText}>Spent: ${totalSpent.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
            <Ionicons name="camera" size={22} color="#000" />
            <Text style={styles.actionBtnTextDark}>Scan Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.surfaceLight }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.secondary} />
            <Text style={styles.actionBtnTextLight}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Spending Trend Placeholder */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Monthly Spending Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="analytics" size={48} color={Colors.secondary} />
            <Text style={styles.placeholderText}>
              {transactions.length} expense record(s) logged in SQLite
            </Text>
          </View>
        </Card>

        {/* Live Recent Transactions Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        <Card style={styles.txCard}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions logged yet.</Text>
          ) : (
            transactions.slice(0, 5).map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <View style={styles.txItem}>
                  <View style={[styles.txIconBox, { backgroundColor: tx.category_color ? `${tx.category_color}22` : Colors.surfaceLight }]}>
                    <Ionicons 
                      name={(tx.category_icon as any) || 'pricetag'} 
                      size={20} 
                      color={tx.category_color || Colors.secondary} 
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.note || tx.category_name || 'Expense'}</Text>
                    <Text style={styles.txSubtext}>
                      {tx.category_name ? `${tx.category_name} • ` : ''}
                      {new Date(tx.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: Colors.expense }]}>
                    -${tx.amount.toFixed(2)}
                  </Text>
                </View>
                {idx < Math.min(transactions.length, 5) - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
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
  txIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  txSubtext: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});