// src/screens/BudgetsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Colors } from "../theme/colors";
import { Card } from "../components/Card";
import { Ionicons } from "@expo/vector-icons";
import {
  useTransactionStore,
  CategoryBudget,
} from "../store/useTransactionStore";
import { Button } from "../components/Button";

export const BudgetsScreen = () => {
  const { budgets, fetchBudgets, setBudgetLimit } = useTransactionStore();
  const [selectedBudget, setSelectedBudget] = useState<CategoryBudget | null>(
    null,
  );
  const [limitInput, setLimitInput] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveLimit = () => {
    if (!selectedBudget) return;
    const numericLimit = parseFloat(limitInput);
    if (!isNaN(numericLimit) && numericLimit >= 0) {
      setBudgetLimit(selectedBudget.category_id, numericLimit);
    }
    setSelectedBudget(null);
  };

  const getProgressColor = (
    percent: number,
    isOverBudget: boolean,
    fallbackColor: string,
  ) => {
    if (isOverBudget) return Colors.expense; // Red
    if (percent > 80) return "#FF9800"; // Orange warning threshold
    return fallbackColor || Colors.primary;
  };

  const renderBudgetItem = ({ item }: { item: CategoryBudget }) => {
    const rawPercent =
      item.amount_limit > 0 ? (item.total_spent / item.amount_limit) * 100 : 0;
    const progressWidth = Math.min(rawPercent, 100);
    const isOverBudget =
      item.amount_limit > 0 && item.total_spent > item.amount_limit;
    const remaining = item.amount_limit - item.total_spent;

    return (
      <Card style={styles.budgetCard}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: item.category_color
                    ? `${item.category_color}22`
                    : Colors.surfaceLight,
                },
              ]}
            >
              <Ionicons
                name={(item.category_icon as any) || "cart"}
                size={20}
                color={item.category_color || Colors.primary}
              />
            </View>
            <View>
              <Text style={styles.categoryName}>{item.category_name}</Text>
              <Text style={styles.budgetMeta}>
                Spent: ${item.total_spent.toFixed(2)} /$
                {item.amount_limit.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setSelectedBudget(item);
              setLimitInput(item.amount_limit.toString());
            }}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar Container */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressWidth}%`,
                backgroundColor: getProgressColor(
                  rawPercent,
                  isOverBudget,
                  item.category_color,
                ),
              },
            ]}
          />
        </View>

        {/* Embedded Footer Stats */}
        <View style={styles.cardFooter}>
          <Text
            style={[styles.statusText, isOverBudget && styles.overBudgetText]}
          >
            {item.amount_limit === 0
              ? "No budget set"
              : isOverBudget
                ? `Over limit by $${Math.abs(remaining).toFixed(2)}`
                : `$${remaining.toFixed(2)} remaining`}
          </Text>
          {item.amount_limit > 0 && (
            <Text style={styles.percentageBadge}>{rawPercent.toFixed(0)}%</Text>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Category Budgets</Text>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.category_id}
        renderItem={renderBudgetItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="wallet-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>No expense categories found.</Text>
          </View>
        }
      />

      {/* Set Budget Modal */}
      <Modal visible={!!selectedBudget} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Budget Limit</Text>
            <Text style={styles.modalSub}>{selectedBudget?.category_name}</Text>

            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={limitInput}
              onChangeText={setLimitInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setSelectedBudget(null)}
                style={{ flex: 1, backgroundColor: Colors.surfaceLight }}
              />
              <Button
                title="Save"
                onPress={handleSaveLimit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  listContent: { paddingBottom: 20, gap: 12 },
  budgetCard: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  budgetMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  editBtn: { padding: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "500" },
  overBudgetText: { color: Colors.expense, fontWeight: "600" },
  percentageBadge: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: Colors.textPrimary },
  modalSub: { color: Colors.secondary, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
});
