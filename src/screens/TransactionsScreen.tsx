import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const categories = ['All', 'Income', 'Expense', 'Groceries', 'Utilities'];

export const TransactionsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedFilter(cat)}
            style={[
              styles.chip,
              selectedFilter === cat ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.surface },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedFilter === cat ? '#000000' : Colors.textSecondary, fontWeight: selectedFilter === cat ? 'bold' : 'normal' },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.dateGroup}>Today</Text>

        <Card style={styles.txCard}>
          <View style={styles.txRow}>
            <View style={styles.iconBox}>
              <Ionicons name="cart" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>Groceries</Text>
              <Text style={styles.txSub}>Supermarket Purchase</Text>
            </View>
            <Text style={[styles.amount, { color: Colors.expense }]}>-$200.00</Text>
          </View>
        </Card>

        <Text style={styles.dateGroup}>Yesterday</Text>

        <Card style={styles.txCard}>
          <View style={styles.txRow}>
            <View style={styles.iconBox}>
              <Ionicons name="wallet" size={20} color={Colors.income} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>Salary</Text>
              <Text style={styles.txSub}>Direct Deposit</Text>
            </View>
            <Text style={[styles.amount, { color: Colors.income }]}>+$2,400.00</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.txRow}>
            <View style={styles.iconBox}>
              <Ionicons name="flash" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>Utilities</Text>
              <Text style={styles.txSub}>Monthly Electric Bill</Text>
            </View>
            <Text style={[styles.amount, { color: Colors.expense }]}>-$95.00</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  filterIcon: { padding: 8, backgroundColor: Colors.surface, borderRadius: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, marginLeft: 8, color: Colors.textPrimary },
  chipsContainer: { flexDirection: 'row', marginBottom: 16, maxHeight: 40 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 13 },
  listContent: { paddingBottom: 30 },
  dateGroup: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginVertical: 10 },
  txCard: { padding: 12, marginBottom: 10 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  iconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDetails: { flex: 1 },
  txTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  txSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
});