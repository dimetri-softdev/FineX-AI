// src/screens/AnalyticsScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, RefreshControl, Text } from "react-native";
import { Colors } from "../theme/colors";
import { useTransactionStore } from "../store/useTransactionStore";
import { CategoryBreakdownCard } from "../components/CategoryBreakdownCard";

export const AnalyticsScreen = () => {
  const { fetchTransactions, fetchBudgets, fetchSpendingBreakdown } =
    useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    fetchTransactions();
    fetchBudgets();
    fetchSpendingBreakdown();
  }, [fetchTransactions, fetchBudgets, fetchSpendingBreakdown]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <Text style={styles.headerTitle}>Analytics</Text>

      {/* Category Breakdown Donut Visualizer */}
      <CategoryBreakdownCard />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
});
