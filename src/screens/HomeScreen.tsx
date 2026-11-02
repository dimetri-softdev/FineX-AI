// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import type { PreFilledTransactionData } from "../components/AddTransactionModal";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Text as SvgText,
} from "react-native-svg";

import { Colors } from "../theme/colors";
import { Card } from "../components/Card";
import { Ionicons } from "@expo/vector-icons";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { useTransactionStore } from "../store/useTransactionStore";
import * as ImagePicker from "expo-image-picker";
import { parseReceiptImage } from "../services/receiptOcrService";
import {
  getMonthlySpending,
  summarizeTransactions,
  type MonthlySpendingPoint,
} from "../lib/finance";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 72; // Padding accounting
const CHART_HEIGHT = 150;

export const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] =
    useState<PreFilledTransactionData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { transactions, fetchTransactions, fetchBudgets } =
    useTransactionStore();

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, [fetchTransactions, fetchBudgets]);

  const { income: totalIncome, expenses: totalSpent } = useMemo(
    () => summarizeTransactions(transactions),
    [transactions],
  );
  const netBalance = totalIncome - totalSpent;

  const chartData: MonthlySpendingPoint[] = useMemo(
    () => getMonthlySpending(transactions, new Date()),
    [transactions],
  );

  // Compute smooth bezier points and coordinates for chart rendering
  const maxTotal = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.total), 100);
    return Math.ceil(max / 50) * 50; // Round up to clean step
  }, [chartData]);

  const points = useMemo(() => {
    const stepX = CHART_WIDTH / (chartData.length - 1 || 1);
    const paddingY = 20;
    const usableHeight = CHART_HEIGHT - paddingY * 2;

    return chartData.map((d, i) => {
      const x = i * stepX;
      const y =
        CHART_HEIGHT - paddingY - (d.total / maxTotal) * usableHeight;
      return { x, y, total: d.total, label: d.label };
    });
  }, [chartData, maxTotal]);

  // Construct SVG Path String
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth curve interpolation
      const prev = points[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return "";
    const last = points[points.length - 1];
    const first = points[0];
    return `${linePath} L ${last.x} ${CHART_HEIGHT} L ${first.x} ${CHART_HEIGHT} Z`;
  }, [linePath, points]);

  const handleScanReceipt = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Camera access is needed to scan receipts."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]?.base64) {
        return;
      }

      setIsScanning(true);
      const extractedData = await parseReceiptImage(result.assets[0].base64);

      setScannedData({
        amount: extractedData.amount,
        note: extractedData.merchant,
        categoryId: extractedData.suggestedCategoryId,
        date: extractedData.date
          ? new Date(extractedData.date).toISOString()
          : new Date().toISOString(),
      });

      setModalVisible(true);
    } catch (error) {
      console.error("Receipt scan failed:", error);
      Alert.alert("Error", "Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const activePoint = selectedIndex !== null ? points[selectedIndex] : null;

  return (
    <View style={styles.flexContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.brand}>FineX Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Dynamic Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${netBalance.toFixed(2)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.statBox}>
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={Colors.income}
              />
              <Text style={styles.statText}>
                Income: ${totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={Colors.expense}
              />
              <Text style={styles.statText}>
                Spent: ${totalSpent.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={handleScanReceipt}
            disabled={isScanning}
            activeOpacity={0.7}
          >
            {isScanning ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="camera" size={22} color="#000" />
                <Text style={styles.actionBtnTextDark}>Scan Receipt</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.surfaceLight }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={Colors.secondary}
            />
            <Text style={styles.actionBtnTextLight}>Add Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Spending Trend Line Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>Monthly Spending Trend</Text>
              <Text style={styles.cardSubTitle}>
                {activePoint
                  ? `${activePoint.label}: $${activePoint.total.toFixed(2)}`
                  : "Tap data points to inspect monthly total"}
              </Text>
            </View>
            {activePoint && (
              <TouchableOpacity onPress={() => setSelectedIndex(null)}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.svgWrapper}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
              <Defs>
                <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop
                    offset="0%"
                    stopColor={Colors.primary}
                    stopOpacity="0.4"
                  />
                  <Stop
                    offset="100%"
                    stopColor={Colors.primary}
                    stopOpacity="0.0"
                  />
                </LinearGradient>
              </Defs>

              {/* Horizontal Grid lines */}
              <Line
                x1="0"
                y1={CHART_HEIGHT / 2}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT / 2}
                stroke={Colors.border}
                strokeDasharray="4 4"
              />

              {/* Gradient Fill under path */}
              <Path d={areaPath} fill="url(#gradient)" />

              {/* Line Stroke */}
              <Path
                d={linePath}
                fill="none"
                stroke={Colors.primary}
                strokeWidth={3}
              />

              {/* Interactive Point Circles and Labels */}
              {points.map((pt, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <React.Fragment key={idx}>
                    {/* Active Point Indicator Line */}
                    {isSelected && (
                      <Line
                        x1={pt.x}
                        y1={0}
                        x2={pt.x}
                        y2={CHART_HEIGHT}
                        stroke={Colors.primary}
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    )}

                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 7 : 4}
                      fill={isSelected ? Colors.primary : Colors.surface}
                      stroke={Colors.primary}
                      strokeWidth={2}
                      onPress={() => setSelectedIndex(idx)}
                    />

                    {/* Month Label */}
                    <SvgText
                      x={pt.x}
                      y={CHART_HEIGHT + 20}
                      fill={
                        isSelected ? Colors.primary : Colors.textSecondary
                      }
                      fontSize={11}
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                    >
                      {pt.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </Card>

        {/* Live Recent Transactions Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        <Card style={styles.txCard}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions logged yet.</Text>
          ) : (
            transactions.slice(0, 5).map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <View style={styles.txItem}>
                  <View
                    style={[
                      styles.txIconBox,
                      {
                        backgroundColor: tx.category_color
                          ? `${tx.category_color}22`
                          : Colors.surfaceLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(tx.category_icon as any) || "pricetag"}
                      size={20}
                      color={tx.category_color || Colors.secondary}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>
                      {tx.note || tx.category_name || "Expense"}
                    </Text>
                    <Text style={styles.txSubtext}>
                      {tx.category_name ? `${tx.category_name} • ` : ""}
                      {new Date(tx.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color:
                          tx.type === "income" ? Colors.income : Colors.expense,
                      },
                    ]}
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {tx.amount.toFixed(2)}
                  </Text>
                </View>
                {idx < Math.min(transactions.length, 5) - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setScannedData(null);
        }}
        initialData={scannedData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  brand: { fontSize: 22, fontWeight: "bold", color: Colors.textPrimary },
  profileIcon: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: { color: Colors.textSecondary, fontSize: 14 },
  balanceAmount: {
    color: Colors.textPrimary,
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: Colors.textSecondary, fontSize: 13 },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionBtnTextDark: { color: "#000000", fontWeight: "bold", fontSize: 15 },
  actionBtnTextLight: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 15,
  },
  chartCard: { marginBottom: 20, padding: 16 },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubTitle: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  svgWrapper: {
    alignItems: "center",
    paddingVertical: 8,
  },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "bold" },
  txCard: { padding: 12 },
  txItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  txSubtext: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "bold" },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: 16,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});