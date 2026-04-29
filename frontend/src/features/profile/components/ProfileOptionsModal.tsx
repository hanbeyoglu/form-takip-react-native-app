import { Check } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocale } from "../../../localization/useAppLocale";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";

export type ProfileOptionItem = {
  value: string;
  label: string;
};

type ProfileOptionsModalProps = {
  visible: boolean;
  title: string;
  options: readonly ProfileOptionItem[];
  selectedValue: string | null;
  searchable: boolean;
  searchPlaceholder?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function ProfileOptionsModal({
  visible,
  title,
  options,
  selectedValue,
  searchable,
  searchPlaceholder,
  onClose,
  onSelect
}: ProfileOptionsModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t, textAlign } = useAppLocale();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) {
      return [...options];
    }
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("common.close")} />
        <View
          style={[
            styles.sheet,
            shadows.shadowHero,
            { marginBottom: Math.max(insets.bottom, spacing.lg) }
          ]}
        >
          <Text style={[styles.title, { textAlign }]}>{title}</Text>
          {searchable ? (
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[styles.search, { textAlign }]}
              autoCorrect={false}
              autoCapitalize="none"
            />
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => {
              const selected = item.value === selectedValue;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.rowLabel, { textAlign }]} numberOfLines={2}>
                    {item.label}
                  </Text>
                  <View style={styles.trailing}>
                    {selected ? (
                      <Check color={colors.primary} size={22} strokeWidth={2.5} />
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.empty, { textAlign }]}>{t("profile.pickerEmpty")}</Text>
            }
          />
          <Pressable onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneText}>{t("profile.pickerDone")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg
  },
  sheet: {
    maxHeight: "78%",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.md
  },
  search: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface
  },
  list: {
    maxHeight: 360
  },
  listContent: {
    paddingBottom: spacing.sm
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSoft
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    gap: spacing.md
  },
  rowPressed: {
    opacity: 0.85
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  trailing: {
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  empty: {
    paddingVertical: spacing.xl,
    color: colors.textMuted,
    fontSize: typography.helper
  },
  doneBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    alignSelf: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl
  },
  doneText: {
    fontSize: typography.bodyStrong,
    fontWeight: "700",
    color: colors.primary
  }
});
