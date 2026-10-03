// src/screens/InsightsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore, CategorySpendingBreakdown } from '../store/useTransactionStore';

export const InsightsScreen = () => {
  const { spendingBreakdown, fetchSpendingBreakdown, transactions } = useTransactionStore();

  useEffect(() => {
    fetchSpendingBreakdown();
  }, [transactions]);

  const totalSpent = spendingBreakdown.reduce((acc, curr) => acc + curr.total_spent, 0);

  const renderCategoryBar = (item: CategorySpendingBreakdown) => (
    <Card key={item.category_id} style={styles.breakdownCard}>
      <View style={styles.rowHeader}>
        <View style={styles.iconRow}>
          <View style={[styles.iconBox, { backgroundColor: item.category_color }]}>
            <Ionicons name={(item.category_icon as any) || 'pricetag'} size={18} color="#000" />
          </View>
          <Text style={styles.categoryName}>{item.category_name}</Text>
        </View>
        <Text style={styles.amountText}>${item.total_spent.toFixed(2)}</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(item.percentage, 100)}%`,
              backgroundColor: item.category_color || Colors.primary,
            },
          ]}
        />
      </View>

      <Text style={styles.percentageText}>{item.percentage.toFixed(1)}% of total spending</Text>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Spending Insights</Text>

      {/* Summary Banner */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Outflow</Text>
        <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
        <Text style={styles.summarySub}>
          Across {spendingBreakdown.length} active spending categories
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Category Breakdown</Text>

      {spendingBreakdown.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="pie-chart-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No spending analytics available yet.</Text>
          <Text style={styles.emptySub}>Log expenses to generate category insights.</Text>
        </Card>
      ) : (
        spendingBreakdown.map(renderCategoryBar)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50, paddingBottom: 30, gap: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  summaryCard: { padding: 20, backgroundColor: Colors.surface },
  summaryLabel: { color: Colors.textSecondary, fontSize: 13 },
  summaryAmount: { color: Colors.expense, fontSize: 32, fontWeight: 'bold', marginVertical: 6 },
  summarySub: { color: Colors.textSecondary, fontSize: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  breakdownCard: { padding: 14, gap: 10 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  categoryName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  amountText: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  percentageText: { color: Colors.textSecondary, fontSize: 11, textAlign: 'right' },
  emptyCard: { padding: 30, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  emptySub: { color: Colors.textSecondary, fontSize: 12 },
});