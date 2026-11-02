// src/components/CategoryBreakdownCard.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { Colors } from "../theme/colors";
import { Card } from "./Card";
import {
  useTransactionStore,
  CategorySpendingBreakdown,
} from "../store/useTransactionStore";
import { Ionicons } from "@expo/vector-icons";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~314.16

export const CategoryBreakdownCard = () => {
  const { spendingBreakdown } = useTransactionStore();
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySpendingBreakdown | null>(null);

  const grandTotal = spendingBreakdown.reduce(
    (sum, item) => sum + item.total_spent,
    0,
  );

  if (spendingBreakdown.length === 0 || grandTotal === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Spending Breakdown</Text>
        <View style={styles.emptyBox}>
          <Ionicons
            name="pie-chart-outline"
            size={36}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>No spending recorded yet</Text>
        </View>
      </Card>
    );
  }

  // Active highlighted category or defaults to largest category
  const activeItem = selectedCategory || spendingBreakdown[0];
  let accumulatedPercent = 0;

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Spending Breakdown</Text>

      <View style={styles.chartContainer}>
        {/* SVG Donut Chart */}
        <View style={styles.donutWrapper}>
          <Svg width={140} height={140} viewBox="0 0 120 120">
            <G rotation="-90" origin="60, 60">
              {spendingBreakdown.map((item) => {
                const strokeDasharray = `${
                  (item.percentage / 100) * CIRCUMFERENCE
                } ${CIRCUMFERENCE}`;
                const strokeDashoffset =
                  -(accumulatedPercent / 100) * CIRCUMFERENCE;

                accumulatedPercent += item.percentage;
                const isSelected = activeItem?.category_id === item.category_id;

                return (
                  <Circle
                    key={item.category_id}
                    cx="60"
                    cy="60"
                    r={RADIUS}
                    stroke={item.category_color || Colors.primary}
                    strokeWidth={isSelected ? 16 : 12}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                    strokeLinecap="butt"
                    onPress={() => setSelectedCategory(item)}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center Callout Text */}
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerPercentage}>
              {activeItem ? `${activeItem.percentage.toFixed(0)}%` : "100%"}
            </Text>
            <Text style={styles.centerLabel} numberOfLines={1}>
              {activeItem ? activeItem.category_name : "Total"}
            </Text>
          </View>
        </View>

        {/* Total Summary */}
        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Category Legend List */}
      <View style={styles.legendList}>
        {spendingBreakdown.map((item) => {
          const isSelected = activeItem?.category_id === item.category_id;

          return (
            <TouchableOpacity
              key={item.category_id}
              style={[
                styles.legendItem,
                isSelected && styles.legendItemSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <View style={styles.legendLeft}>
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: item.category_color || Colors.primary,
                    },
                  ]}
                />
                <Text style={styles.legendName}>{item.category_name}</Text>
              </View>

              <View style={styles.legendRight}>
                <Text style={styles.legendAmount}>
                  ${item.total_spent.toFixed(2)}
                </Text>
                <Text style={styles.legendPercent}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 20 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  donutWrapper: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  centerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  centerPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  centerLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  totalBadge: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  legendList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  legendItemSelected: {
    backgroundColor: Colors.surfaceLight,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  legendRight: {
    alignItems: "flex-end",
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  legendPercent: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
