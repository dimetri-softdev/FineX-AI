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
} from "react-native";
import { Colors } from "../theme/colors";
import { useTransactionStore } from "../store/useTransactionStore";

export interface PreFilledTransactionData {
  amount: number | null;
  note: string | null;
  categoryId: string | null;
  date?: string | null;
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
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString());

  const { addTransaction } = useTransactionStore();

  // Populate or reset form fields whenever modal visibility or initialData changes
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAmount(initialData.amount ? initialData.amount.toString() : "");
        setNote(initialData.note || "");
        setSelectedCategory(initialData.categoryId || "");
        setDate(initialData.date || new Date().toISOString());
      } else {
        // Reset form for manual entry
        setAmount("");
        setNote("");
        setSelectedCategory("");
        setDate(new Date().toISOString());
      }
    }
  }, [visible, initialData]);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid expense amount.");
      return;
    }

    try {
      await addTransaction({
        amount: numericAmount,
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {initialData ? "Verify Scanned Expense" : "Add Expense"}
          </Text>

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

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
