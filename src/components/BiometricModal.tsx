import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BiometricModalProps {
  visible: boolean;
  username: string;
  onSuccess: () => void;
  onCancel: () => void;
  onFallbackToPassword: () => void;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  visible,
  username,
  onSuccess,
  onCancel,
  onFallbackToPassword,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("biometric");

  const checkBiometricType = async () => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType("Face ID");
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType("Fingerprint");
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      setBiometricType("Iris");
    } else {
      setBiometricType("Biometric");
    }
  };

  const authenticateWithBiometric = useCallback(async () => {
    try {
      setIsAuthenticating(true);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsAuthenticating(false);
        onFallbackToPassword();
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setIsAuthenticating(false);
        onFallbackToPassword();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock with ${biometricType}`,
        fallbackLabel: "Use Password",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        onSuccess();
      } else {
        if (result.error === "user_fallback") {
          onFallbackToPassword();
        } else {
          onCancel();
        }
      }
    } catch (error) {
      onCancel();
    } finally {
      setIsAuthenticating(false);
    }
  }, [biometricType, onFallbackToPassword, onSuccess, onCancel]);

  useEffect(() => {
    if (visible && !isAuthenticating) {
      checkBiometricType();
      authenticateWithBiometric();
    }
  }, [visible, isAuthenticating, authenticateWithBiometric]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print" size={64} color="#000" />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.subtitle}>
            Use {biometricType} to unlock
          </Text>

          {isAuthenticating ? (
            <ActivityIndicator
              size="large"
              color="#000"
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={authenticateWithBiometric}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={onFallbackToPassword}
            >
              <Text style={styles.fallbackText}>Use Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  fallbackButton: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  fallbackText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cancelText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
});
