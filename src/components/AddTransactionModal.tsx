// src/components/AddTransactionModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "../theme/colors";
import { Button } from "./Button";
import { useTransactionStore } from "../store/useTransactionStore";
import { db } from "../db/schema";
import { Ionicons } from "@expo/vector-icons";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const AddTransactionModal: React.FC<ModalProps> = ({
  visible,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("cat_1");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  useEffect(() => {
    if (visible) {
      // Fetch available categories from SQLite when modal opens
      const rows = db.getAllSync<CategoryOption>(
        "SELECT id, name, icon, color FROM categories WHERE type = 'expense';",
      );
      setCategories(rows);
      if (rows.length > 0) {
        setCategoryId(rows[0].id);
      }
    }
  }, [visible]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    addTransaction({
      amount: numericAmount,
      category_id: categoryId,
      note: note || "Quick Expense",
      date: new Date().toISOString(),
    });

    setAmount("");
    setNote("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Expense</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPicker}
          >
            {categories.map((cat) => {
              const isSelected = cat.id === categoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      borderColor: Colors.primary,
                      backgroundColor: Colors.surfaceLight,
                    },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Ionicons
                    name={(cat.icon as any) || "pricetag"}
                    size={16}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && {
                        color: Colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Note / Merchant</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Target, Uber, Gas"
            placeholderTextColor={Colors.textSecondary}
            value={note}
            onChangeText={setNote}
          />

          <Button
            title="Save Transaction"
            onPress={handleSubmit}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary },
  label: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPicker: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipText: { color: Colors.textSecondary, fontSize: 13 },
});
