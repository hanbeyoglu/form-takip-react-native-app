import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View
} from "react-native";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type FormDatePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayDate(value: string, locale: string): string {
  const date = parseIsoDate(value);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getCalendarDays(baseDate: Date): Date[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startWeekday);
  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + index);
    return d;
  });
}

export function FormDatePickerField<T extends FieldValues>({
  control,
  name,
  label
}: FormDatePickerFieldProps<T>): React.JSX.Element {
  const [isVisible, setIsVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(new Date());
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const { language, t, textAlign, isRTL } = useAppLocale();
  const hasNativeDatePicker =
    Platform.OS === "ios" || Platform.OS === "android"
      ? Boolean(UIManager.getViewManagerConfig("RNDateTimePicker"))
      : false;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const currentDate = parseIsoDate(String(value ?? ""));

        const onChangeNative = (event: DateTimePickerEvent, selectedDate?: Date): void => {
          if (Platform.OS === "android") {
            setIsVisible(false);
          }
          if (event.type === "set" && selectedDate) {
            onChange(toIsoDate(selectedDate));
          }
        };

        return (
          <View style={styles.container}>
            <Text style={[styles.label, { textAlign }]}>{label}</Text>
            <View style={[styles.inputLike, error ? styles.inputError : null]}>
              <Pressable
                style={styles.dateValueArea}
                onPress={() => {
                  setTempDate(currentDate);
                  setCalendarMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
                  setIsVisible(true);
                }}
              >
                <Text style={[styles.valueText, { textAlign }]}>{toDisplayDate(String(value ?? ""), language)}</Text>
              </Pressable>
              <Pressable
                style={styles.calendarButton}
                onPress={() => {
                  setTempDate(currentDate);
                  setCalendarMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
                  setIsVisible(true);
                }}
              >
                <Text style={styles.calendarButtonText}>{t("datePicker.selectFromCalendar")}</Text>
              </Pressable>
            </View>
            <Text style={[styles.helper, { textAlign }]}>{t("datePicker.helper")}</Text>
            {error ? <Text style={[styles.error, { textAlign }]}>{error.message}</Text> : null}

            {Platform.OS === "android" && isVisible && hasNativeDatePicker ? (
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="default"
                onChange={onChangeNative}
              />
            ) : null}

            {(Platform.OS === "ios" || !hasNativeDatePicker) ? (
              <Modal
                transparent
                visible={isVisible}
                animationType="slide"
                onRequestClose={() => setIsVisible(false)}
              >
                <View style={styles.modalBackdrop}>
                  <View style={styles.modalCard}>
                    <Text style={[styles.modalTitle, { textAlign }]}>{label}</Text>
                    {hasNativeDatePicker ? (
                      <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        onChange={(_, selectedDate) => {
                          if (selectedDate) {
                            setTempDate(selectedDate);
                          }
                        }}
                      />
                    ) : (
                      <View style={styles.fallbackPicker}>
                        <Text style={[styles.fallbackDate, { textAlign }]}>{toDisplayDate(toIsoDate(tempDate), language)}</Text>
                        <View style={styles.calendarHeader}>
                          <Pressable
                            onPress={() => setCalendarMonth((prev) => addMonths(prev, -1))}
                            style={styles.monthNav}
                          >
                            <Text style={styles.monthNavText}>{isRTL ? ">" : "<"}</Text>
                          </Pressable>
                          <Text style={styles.calendarMonthLabel}>
                            {calendarMonth.toLocaleDateString(language, {
                              month: "long",
                              year: "numeric"
                            })}
                          </Text>
                          <Pressable
                            onPress={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                            style={styles.monthNav}
                          >
                            <Text style={styles.monthNavText}>{isRTL ? "<" : ">"}</Text>
                          </Pressable>
                        </View>
                        <View style={styles.weekHeader}>
                          {(t("datePicker.weekdays", { returnObjects: true }) as string[]).map((weekday) => (
                            <Text key={weekday} style={styles.weekHeaderText}>{weekday}</Text>
                          ))}
                        </View>
                        <View style={styles.calendarGrid}>
                          {getCalendarDays(calendarMonth).map((day) => {
                            const iso = toIsoDate(day);
                            const isSelected = iso === toIsoDate(tempDate);
                            const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                            return (
                              <Pressable
                                key={iso}
                                style={[styles.dayCell, isSelected ? styles.dayCellSelected : null]}
                                onPress={() => setTempDate(day)}
                              >
                                <Text
                                  style={[
                                    styles.dayText,
                                    !isCurrentMonth ? styles.dayTextMuted : null,
                                    isSelected ? styles.dayTextSelected : null
                                  ]}
                                >
                                  {day.getDate()}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        <Text style={[styles.fallbackHint, { textAlign }]}>
                          {t("datePicker.fallbackHint")}
                        </Text>
                      </View>
                    )}
                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={() => setIsVisible(false)}
                        style={styles.modalButton}
                      >
                        <Text style={styles.modalButtonText}>{t("datePicker.cancel")}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          onChange(toIsoDate(tempDate));
                          setIsVisible(false);
                        }}
                        style={[styles.modalButton, styles.confirmButton]}
                      >
                        <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                          {t("datePicker.select")}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  inputLike: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  dateValueArea: {
    flex: 1
  },
  calendarButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  calendarButtonText: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  inputError: {
    borderColor: colors.danger
  },
  valueText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  helper: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: typography.caption
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl
  },
  modalTitle: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  modalActions: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm
  },
  modalButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  confirmButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  modalButtonText: {
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  fallbackPicker: {
    marginTop: spacing.sm
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  monthNav: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  monthNavText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  calendarMonthLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: spacing.xs
  },
  weekHeaderText: {
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.caption
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: "14.285%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.md
  },
  dayText: {
    color: colors.textPrimary,
    fontSize: typography.caption
  },
  dayTextMuted: {
    color: colors.textSecondary
  },
  dayTextSelected: {
    color: colors.onPrimary,
    fontWeight: "700"
  },
  fallbackDate: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  fallbackHint: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.caption
  }
});
