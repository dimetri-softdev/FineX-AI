// src/components/AddTransactionModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Colors } from "../theme/colors";
import {
  useTransactionStore,
  type Category,
} from "../store/useTransactionStore";

export interface PreFilledTransactionData {
  amount: number | null;
  note: string | null;
  categoryId: string | null;
  date?: string | null;
  type?: "income" | "expense";
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: PreFilledTransactionData | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  initialData,
}) => {
  const categories = useTransactionStore((state) => state.categories);
  const fetchCategories = useTransactionStore((state) => state.fetchCategories);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {visible ? (
        <TransactionForm
          categories={categories}
          initialData={initialData}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
};

interface TransactionFormProps {
  categories: Category[];
  initialData?: PreFilledTransactionData | null;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  initialData,
  onClose,
}) => {
  const type = initialData?.type || "expense";
  const availableCategories = categories.filter(
    (category) => category.type === type,
  );
  const [amount, setAmount] = useState(
    initialData?.amount != null ? initialData.amount.toString() : "",
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (
      initialData?.categoryId &&
      availableCategories.some(
        (category) => category.id === initialData.categoryId,
      )
    ) {
      return initialData.categoryId;
    }
    return availableCategories[0]?.id || "";
  });
  const date = initialData?.date || new Date().toISOString();
  const [transactionType, setTransactionType] = useState(type);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const handleTypeChange = (nextType: "income" | "expense") => {
    setTransactionType(nextType);
    setSelectedCategory(
      categories.find((category) => category.type === nextType)?.id || "",
    );
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid expense amount.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Category required", "Please select a transaction category.");
      return;
    }

    try {
      await addTransaction({
        amount: numericAmount,
        type: transactionType,
        title: transactionType === "income" ? "Income" : "Expense",
        category_id: selectedCategory,
        note,
        date,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      Alert.alert("Error", "Could not save transaction.");
    }
  };

  return (
    <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {initialData ? "Verify Scanned Transaction" : "Add Transaction"}
          </Text>

          <View style={styles.typeRow}>
            {(["expense", "income"] as const).map((optionType) => (
              <TouchableOpacity
                key={optionType}
                style={[
                  styles.typeButton,
                  transactionType === optionType &&
                    styles.selectedTypeButton,
                ]}
                onPress={() => handleTypeChange(optionType)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    transactionType === optionType &&
                      styles.selectedTypeButtonText,
                  ]}
                >
                  {optionType === "expense" ? "Expense" : "Income"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Merchant / Note</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Walmart, Starbucks"
            placeholderTextColor={Colors.textSecondary}
            value={note}
            onChangeText={setNote}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories
              .filter((category) => category.type === transactionType)
              .map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.selectedCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                Save {transactionType === "income" ? "Income" : "Expense"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  selectedTypeButton: { backgroundColor: Colors.primary },
  typeButtonText: { color: Colors.textSecondary, fontWeight: "600" },
  selectedTypeButtonText: { color: "#000000" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  label: { fontSize: 13, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryRow: { gap: 8, paddingVertical: 2 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  selectedCategoryChip: { backgroundColor: Colors.primary },
  categoryText: { color: Colors.textSecondary, fontSize: 13 },
  selectedCategoryText: { color: "#000000", fontWeight: "600" },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
  },
  cancelBtnText: { color: Colors.textPrimary, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  saveBtnText: { color: "#000000", fontWeight: "bold" },
});
