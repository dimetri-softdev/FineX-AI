// src/components/BudgetProgressCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Card } from "./Card";

interface BudgetProgressProps {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  spent: number;
  limit: number;
}

export const BudgetProgressCard: React.FC<BudgetProgressProps> = ({
  categoryName,
  categoryIcon,
  categoryColor,
  spent,
  limit,
}) => {
  const progressPercent = Math.min((spent / limit) * 100, 100);
  const isOverBudget = spent > limit;

  // Dynamic progress bar color warning thresholds
  const getProgressColor = () => {
    if (isOverBudget) return Colors.expense; // Red
    if (progressPercent > 80) return "#FF9800"; // Orange / Warning
    return categoryColor || Colors.primary;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[styles.iconBox, { backgroundColor: `${categoryColor}22` }]}
          >
            <Ionicons
              name={categoryIcon as any}
              size={18}
              color={categoryColor}
            />
          </View>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
        </View>
        <Text
          style={[styles.amountText, isOverBudget && { color: Colors.expense }]}
        >
          ${spent.toFixed(2)} /${limit.toFixed(2)}
        </Text>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progressPercent}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isOverBudget
            ? `Over budget by $${(spent - limit).toFixed(2)}`
            : `${(100 - progressPercent).toFixed(0)}% remaining`}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, marginBottom: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  amountText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "500" },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 4,
  },
  fill: { height: "100%", borderRadius: 4 },
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  footerText: { color: Colors.textSecondary, fontSize: 11 },
});
