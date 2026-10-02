import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const budgetData = [
  { category: 'Groceries', limit: 300, spent: 200, icon: 'cart' },
  { category: 'Utilities', limit: 250, spent: 255, icon: 'flash' },
  { category: 'Dining Out', limit: 150, spent: 85, icon: 'fast-food' },
];

export const BudgetsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Monthly Budget Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Monthly Limit</Text>
        <Text style={styles.summaryAmount}>$700.00</Text>
        <View style={styles.summaryStats}>
          <Text style={{ color: Colors.textSecondary }}>
            Spent: <Text style={{ color: Colors.textPrimary }}>$540.00</Text>
          </Text>
          <Text style={{ color: Colors.textSecondary }}>
            Remaining: <Text style={{ color: Colors.income }}>$160.00</Text>
          </Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Category Progress</Text>

      {/* Budget Item List */}
      {budgetData.map((item) => {
        const progress = Math.min((item.spent / item.limit) * 100, 100);
        const isOver = item.spent > item.limit;

        return (
          <Card key={item.category} style={styles.budgetItem}>
            <View style={styles.itemHeader}>
              <View style={styles.categoryTitleBox}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={Colors.secondary} />
                <Text style={styles.categoryName}>{item.category}</Text>
              </View>
              <Text style={styles.amountText}>
                ${item.spent} / <Text style={{ color: Colors.textSecondary }}>${item.limit}</Text>
              </Text>
            </View>

            {/* Custom Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: isOver ? Colors.expense : Colors.primary },
                ]}
              />
            </View>

            {isOver && (
              <Text style={styles.warningText}>
                ⚠️ Over budget by ${(item.spent - item.limit).toFixed(2)}
              </Text>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { padding: 20, marginBottom: 24 },
  summaryLabel: { color: Colors.textSecondary, fontSize: 13 },
  summaryAmount: { color: Colors.secondary, fontSize: 32, fontWeight: 'bold', marginVertical: 6 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  budgetItem: { marginBottom: 12, padding: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  amountText: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  progressTrack: { height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  warningText: { color: Colors.expense, fontSize: 12, marginTop: 8, fontWeight: '600' },
});