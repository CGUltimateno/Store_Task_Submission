import { getCategories, getProductsByCategory } from "@/src/api/products";
import ThemeToggle from "@/src/components/ThemeToggle";
import { useToast } from "@/src/components/ToastProvider";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { AppTheme, useTheme } from "@/src/theme";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoryItem {
  slug: string;
  name: string;
}

interface ProductItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

const FEATURED_CATEGORY = "smartphones";
const FEATURED_CATEGORY_LABEL = "Smartphones";
const FEATURED_CATEGORY_BLURB = "Curated flagship and budget-friendly devices ready for quick comparison.";

const CategoryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(FEATURED_CATEGORY);
  const { isOffline } = useNetworkStatus();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const categoriesErrorRef = useRef<string | null>(null);
  const productsErrorRef = useRef<string | null>(null);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<(CategoryItem | string)[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    retry: 1,
  });

  const {
    data: products,
    isLoading: isLoadingProducts,
    refetch,
    isFetching,
    isError: isProductsError,
    error: productsError,
  } = useQuery<ProductItem[]>({
    queryKey: ["products", selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory),
    enabled: !!selectedCategory,
    retry: 1,
  });

  useEffect(() => {
    if (!isCategoriesError) {
      categoriesErrorRef.current = null;
      return;
    }

    const message = getErrorMessage(
      categoriesError,
      "We couldn't load categories. Pull to retry.",
    );

    if (categoriesErrorRef.current === message) {
      return;
    }

    categoriesErrorRef.current = message;
    showToast({
      message,
      type: "error",
      actionLabel: "Retry",
      onAction: () => {
        categoriesErrorRef.current = null;
        void refetchCategories();
      },
    });
  }, [categoriesError, isCategoriesError, refetchCategories, showToast]);

  useEffect(() => {
    if (!isProductsError) {
      productsErrorRef.current = null;
      return;
    }

    const message = getErrorMessage(
      productsError,
      "We couldn't load this category. Try again soon.",
    );

    if (productsErrorRef.current === message) {
      return;
    }

    productsErrorRef.current = message;
    showToast({
      message,
      type: "error",
      actionLabel: "Retry",
      onAction: () => {
        productsErrorRef.current = null;
        void refetch();
      },
    });
  }, [isProductsError, productsError, refetch, showToast]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const normalizedCategories = useMemo<CategoryItem[]>(() => {
    if (!categories || categories.length === 0) {
      return [{ slug: FEATURED_CATEGORY, name: FEATURED_CATEGORY_LABEL }];
    }

    const mapped: CategoryItem[] = categories.map((item: CategoryItem | string) => {
      if (typeof item === "string") {
        return {
          slug: item,
          name: item.replace(/-/g, " "),
        };
      }

      return item;
    });

    const containsFeatured = mapped.some((category: CategoryItem) => category.slug === FEATURED_CATEGORY);
    if (!containsFeatured) {
      mapped.unshift({ slug: FEATURED_CATEGORY, name: FEATURED_CATEGORY_LABEL });
      return mapped;
    }

    return [
      ...mapped.filter((category) => category.slug === FEATURED_CATEGORY),
      ...mapped.filter((category) => category.slug !== FEATURED_CATEGORY),
    ];
  }, [categories]);

  const selectedCategoryMeta = useMemo(() => {
    return (
      normalizedCategories.find((category) => category.slug === selectedCategory) ?? {
        slug: selectedCategory,
        name: selectedCategory.replace(/-/g, " "),
      }
    );
  }, [normalizedCategories, selectedCategory]);

  const handleCategoryPress = useCallback(
    (category: CategoryItem) => {
      if (isOffline) {
        showToast({
          message: "You're offline. We'll sync this category when you're back.",
          type: "info",
        });
      }
      setSelectedCategory(category.slug);
    },
    [isOffline, showToast],
  );

  const handleRefresh = useCallback(() => {
    if (isOffline) {
      showToast({
        message: "You're offline. We'll refresh as soon as you're back.",
        type: "info",
      });
      return;
    }

    if (selectedCategory) {
      void refetch();
    } else {
      void refetchCategories();
    }
  }, [isOffline, refetch, refetchCategories, selectedCategory, showToast]);

  if (isLoadingCategories) {
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
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>Browse by category</Text>
        </View>
        <ThemeToggle size={34} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
              enabled={!isOffline}
            />
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScroll}
          >
            {normalizedCategories.map((category: CategoryItem) => (
              <TouchableOpacity
                key={category.slug}
                onPress={() => handleCategoryPress(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.slug && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.slug && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedCategory ? (
            <View
              style={[
                styles.featuredBanner,
                selectedCategory === FEATURED_CATEGORY && styles.featuredBannerHighlighted,
              ]}
            >
              <Text style={styles.featuredHeading}>
                {selectedCategory === FEATURED_CATEGORY ? "Featured:" : "Now viewing:"} {selectedCategoryMeta.name}
              </Text>
              <Text style={styles.featuredDescription}>
                {selectedCategory === FEATURED_CATEGORY
                  ? FEATURED_CATEGORY_BLURB
                  : "Pull to refresh or pick another category from the chips above."}
              </Text>
            </View>
          ) : null}

          {isLoadingProducts ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
          ) : null}

          {selectedCategory && products && products.length === 0 && !isLoadingProducts ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
              </View>
              <Text style={styles.emptyStateTitle}>No Products</Text>
              <Text style={styles.emptyStateText}>
                No items in this category yet
              </Text>
            </View>
          ) : null}

          {products && products.length > 0 ? (
            <View style={styles.productsContainer}>
              {products.map((item: ProductItem) => (
                <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.82}>
                  <Image source={{ uri: item.thumbnail }} style={styles.productImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={3}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
};

export default CategoryScreen;

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
    contentContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
    },
    categoriesScroll: {
      marginHorizontal: -24,
      marginBottom: 20,
    },
    categoriesContainer: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      alignItems: "center",
    },
    categoryChip: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      marginRight: 10,
      minHeight: 60,
      marginBottom: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryChipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.secondaryText,
      textTransform: "capitalize",
      textAlign: "center",
      flexShrink: 1,
      includeFontPadding: false,
    },
    categoryTextActive: {
      color: theme.colors.accentContrast,
    },
    featuredBanner: {
      marginHorizontal: 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: theme.mode === "dark" ? 0 : 2,
    },
    featuredBannerHighlighted: {
      borderColor: theme.colors.accent,
      shadowColor: theme.colors.accent,
    },
    featuredHeading: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.primaryText,
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    featuredDescription: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      lineHeight: 20,
    },
    loadingState: {
      paddingVertical: 40,
      justifyContent: "center",
      alignItems: "center",
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
    productsContainer: {
      marginTop: 16,
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
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      marginRight: 16,
    },
    cardContent: {
      flex: 1,
    },
    productTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primaryText,
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    productDescription: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      lineHeight: 20,
    },
  });
