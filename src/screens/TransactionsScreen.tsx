// src/screens/TransactionsScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Colors } from "../theme/colors";
import { Card } from "../components/Card";
import { Ionicons } from "@expo/vector-icons";
import {
  useTransactionStore,
  TransactionWithCategory,
} from "../store/useTransactionStore";

export const TransactionsScreen = () => {
  const { transactions, fetchTransactions, deleteTransaction } =
    useTransactionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter list by search text and selected category
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.category_name &&
          tx.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory
        ? tx.category_id === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  const handleDelete = (id: string, note: string) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${note || "Expense"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: TransactionWithCategory }) => (
    <Card style={styles.txCard}>
      <View style={styles.txRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.category_color || Colors.surfaceLight },
          ]}
        >
          <Ionicons
            name={(item.category_icon as any) || "cart"}
            size={20}
            color="#000"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.txTitle}>{item.note || "Quick Expense"}</Text>
          <Text style={styles.txMeta}>
            {item.category_name || "Uncategorized"} •{" "}
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.txAmount}>-${item.amount.toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.note)}
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.expense} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Transaction History</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search note or category..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction Feed */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              No matching transactions found.
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    marginLeft: 8,
    fontSize: 14,
  },
  listContent: { paddingBottom: 20, gap: 10 },
  txCard: { padding: 12 },
  txRow: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: { flex: 1 },
  txTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  txMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  rightContainer: { alignItems: "flex-end", gap: 6 },
  txAmount: { color: Colors.expense, fontSize: 16, fontWeight: "bold" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
