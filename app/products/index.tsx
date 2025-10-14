import { deleteProduct, getProducts } from "@/src/api/products";
import ThemeToggle from "@/src/components/ThemeToggle";
import { useToast } from "@/src/components/ToastProvider";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { AppTheme, useTheme } from "@/src/theme";
import { useAppSelector } from "@/src/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  price: number;
  brand: string;
}

const ProductsScreen = () => {
  const { isSuperAdmin } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  const {
    data: products,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
    retry: 1,
  });

  useEffect(() => {
    if (!isError) {
      lastErrorRef.current = null;
      return;
    }

    const message = getErrorMessage(error, "We couldn't load products. Pull to retry.");
    if (lastErrorRef.current === message) {
      return;
    }

    lastErrorRef.current = message;
    showToast({
      message,
      type: "error",
      actionLabel: "Retry",
      onAction: () => {
        lastErrorRef.current = null;
        refetch();
      },
    });
  }, [error, isError, refetch, showToast]);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const productList = products ?? [];

  const performDelete = useCallback(
    async (id: number) => {
      if (isOffline) {
        showToast({
          message: "Reconnect to delete products.",
          type: "info",
        });
        return;
      }

      setDeletingId(id);

      try {
        const result = await deleteProduct(id);

        if (!result?.isDeleted) {
          throw new Error("Product deletion was not confirmed.");
        }

        queryClient.setQueryData<Product[] | undefined>(["products"], (old) => {
          if (!old) {
            return old;
          }
          return old.filter((product) => product.id !== id);
        });

        showToast({ message: "Product removed.", type: "success" });
      } catch (err) {
        const message = getErrorMessage(err, "Delete failed. Please try again.");
        showToast({
          message,
          type: "error",
          actionLabel: "Retry",
          onAction: () => {
            void performDelete(id);
          },
        });
      } finally {
        setDeletingId(null);
      }
    },
    [isOffline, queryClient, showToast],
  );

  const handleDeletePress = useCallback(
    (product: Product) => {
      if (!isSuperAdmin) {
        return;
      }

      Alert.alert(
        "Delete product",
        `Remove "${product.title}" from the catalog?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              void performDelete(product.id);
            },
          },
        ],
      );
    },
    [isSuperAdmin, performDelete],
  );

  const handleRefresh = useCallback(() => {
    if (isOffline) {
      showToast({
        message: "You're offline. We'll refresh automatically once you're back online.",
        type: "info",
      });
      return;
    }

    refetch();
  }, [isOffline, refetch, showToast]);

  if (isLoading && productList.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isOffline && styles.headerCompact]}>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSubtitle}>{productList.length} items available</Text>
        </View>
        <ThemeToggle size={34} />
      </View>

      {productList.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyStateIcon}>📦</Text>
          </View>
          <Text style={styles.emptyStateTitle}>No Products</Text>
          <Text style={styles.emptyStateText}>No products available at the moment</Text>
        </View>
      ) : (
        <FlatList<Product>
          data={productList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
              enabled={!isOffline}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.85}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.price}>${item.price}</Text>
                </View>
                {item.brand ? (
                  <Text style={styles.brand} numberOfLines={1}>
                    {item.brand}
                  </Text>
                ) : null}
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              {isSuperAdmin ? (
                <TouchableOpacity
                  style={[styles.deleteButton, deletingId === item.id && styles.deleteButtonDisabled]}
                  onPress={() => handleDeletePress(item)}
                  activeOpacity={0.7}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color={theme.colors.destructiveContrast} />
                  ) : (
                    <Text style={styles.deleteText}>×</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default ProductsScreen;

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: theme.colors.secondaryText,
      fontWeight: "500",
    },
    header: {
      paddingTop: 56,
      paddingBottom: 20,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerCompact: {
      paddingTop: 36,
      paddingBottom: 16,
    },
    headerCopy: {
      flex: 1,
      paddingRight: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "600",
      color: theme.colors.primaryText,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 15,
      color: theme.colors.secondaryText,
      fontWeight: "400",
      marginTop: 4,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: theme.mode === "dark" ? 0 : 2,
    },
    image: {
      width: 70,
      height: 70,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      marginRight: 14,
    },
    cardContent: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    productTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primaryText,
      letterSpacing: -0.2,
      flex: 1,
      marginRight: 8,
    },
    price: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.accent,
      letterSpacing: -0.2,
    },
    brand: {
      fontSize: 13,
      color: theme.colors.muted,
      marginBottom: 4,
      fontWeight: "500",
    },
    productDescription: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      lineHeight: 20,
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.destructive,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    deleteText: {
      fontSize: 24,
      color: theme.colors.destructiveContrast,
      fontWeight: "300",
      lineHeight: 24,
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    emptyStateIcon: {
      fontSize: 36,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.primaryText,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
  });
