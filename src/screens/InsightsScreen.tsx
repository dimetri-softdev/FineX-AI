import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

export const InsightsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Insights</Text>
        <Text style={styles.subtitle}>Analytics & category breakdown</Text>
      </View>

      {/* Doughnut Chart Mock View */}
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>
        <View style={styles.chartContainer}>
          <View style={styles.donutPlaceholder}>
            <Ionicons name="pie-chart" size={64} color={Colors.secondary} />
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Groceries (37%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Utilities (28%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Colors.income }]} />
              <Text style={styles.legendText}>Dining Out (15%)</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Cash Flow Bar Chart Mock View */}
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Monthly Cash Flow</Text>
        <View style={styles.barChartPlaceholder}>
          <View style={[styles.bar, { height: '60%', backgroundColor: Colors.income }]} />
          <View style={[styles.bar, { height: '80%', backgroundColor: Colors.primary }]} />
          <View style={[styles.bar, { height: '45%', backgroundColor: Colors.income }]} />
          <View style={[styles.bar, { height: '90%', backgroundColor: Colors.secondary }]} />
        </View>
        <Text style={styles.chartHint}>Income vs. Expense ratio over 4 months</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  chartCard: { marginBottom: 20, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  chartContainer: { alignItems: 'center', gap: 16 },
  donutPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  legendContainer: { width: '100%', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: Colors.textPrimary, fontSize: 14 },
  barChartPlaceholder: { height: 120, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 10 },
  bar: { width: 24, borderRadius: 4 },
  chartHint: { textAlign: 'center', color: Colors.textSecondary, fontSize: 12, marginTop: 10 },
});