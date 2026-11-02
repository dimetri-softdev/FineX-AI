// src/screens/AuthScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../theme/colors";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/useAuthStore";

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert("Authentication Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? "Create Account" : "Welcome Back"}
      </Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? "Create an account to sync your transactions across devices"
          : "Sign in to sync your transactions"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
        onPress={handleAuth}
        style={{ marginTop: 12 }}
      />

      <TouchableOpacity
        onPress={() => setIsSignUp(!isSignUp)}
        style={styles.switchBtn}
      >
        <Text style={styles.switchText}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  switchBtn: { marginTop: 20, alignItems: "center" },
  switchText: { color: Colors.primary, fontSize: 14, fontWeight: "500" },
});
