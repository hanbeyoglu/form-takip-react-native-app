import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { FormTextField } from '../../../shared/components/FormTextField';
import { OptionChipItem, OptionChips } from '../../../shared/components/OptionChips';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { MealInput, MealItem } from '../../../types/diet-plan.types';
import { Card } from '../../../shared/components/Card';
import { useAppLocale } from '../../../localization/useAppLocale';
import {
  formatReadablePlanDate,
  getLocalDateRange,
} from '../../../shared/utils/mealApplicability';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

const mealNameOptions = [
  'Kahvalti',
  'Ogle Yemegi',
  'Ara Ogun',
  'Aksam Yemegi',
  'Gece Ogunu',
  'Diger',
] as const;

const defaultTimeByMeal: Record<(typeof mealNameOptions)[number], string> = {
  Kahvalti: '08:00',
  'Ogle Yemegi': '12:30',
  'Ara Ogun': '10:30',
  'Aksam Yemegi': '19:00',
  'Gece Ogunu': '22:00',
  Diger: '14:00',
};

const commonTimeOptions: OptionChipItem<string>[] = [
  { label: '07:30', value: '07:30' },
  { label: '10:30', value: '10:30' },
  { label: '12:30', value: '12:30' },
  { label: '16:00', value: '16:00' },
  { label: '19:00', value: '19:00' },
  { label: '22:00', value: '22:00' },
];

type MealForm = {
  mealType: (typeof mealNameOptions)[number];
  customMealName?: string;
  time: string;
  note?: string;
  appliesToType: 'every_day' | 'selected_dates';
  appliesToDates: string[];
};

type MealEditorSectionProps = {
  meals: Array<MealInput | MealItem>;
  onAddMeal: (meal: MealInput) => void;
  weekStartDate: string;
  weekEndDate: string;
};

export function MealEditorSection({
  meals,
  onAddMeal,
  weekStartDate,
  weekEndDate,
}: MealEditorSectionProps): React.JSX.Element {
  const { t, language } = useAppLocale();
  const mealSchema = React.useMemo(
    () =>
      z
        .object({
          mealType: z.enum(mealNameOptions),
          customMealName: z.string().optional(),
          time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t('mealEditor.validation.time')),
          note: z.string().optional(),
          appliesToType: z.enum(['every_day', 'selected_dates']),
          appliesToDates: z.array(z.string()).default([]),
        })
        .refine(
          (data) => data.mealType !== 'Diger' || (data.customMealName?.trim().length ?? 0) >= 2,
          {
            message: t('mealEditor.validation.customMealName'),
            path: ['customMealName'],
          }
        )
        .refine(
          (data) => data.appliesToType === 'every_day' || data.appliesToDates.length > 0,
          {
            message: t('mealEditor.validation.selectedDates'),
            path: ['appliesToDates'],
          }
        ),
    [t]
  );
  const selectableDates = React.useMemo(
    () => getLocalDateRange(weekStartDate, weekEndDate),
    [weekEndDate, weekStartDate]
  );
  const mealOptionChips: OptionChipItem<(typeof mealNameOptions)[number]>[] = React.useMemo(
    () => [
      { label: t('mealEditor.mealTypes.kahvalti'), value: 'Kahvalti' },
      { label: t('mealEditor.mealTypes.ogle'), value: 'Ogle Yemegi' },
      { label: t('mealEditor.mealTypes.ara'), value: 'Ara Ogun' },
      { label: t('mealEditor.mealTypes.aksam'), value: 'Aksam Yemegi' },
      { label: t('mealEditor.mealTypes.gece'), value: 'Gece Ogunu' },
      { label: t('mealEditor.mealTypes.diger'), value: 'Diger' },
    ],
    [t]
  );
  const applicabilityOptions: OptionChipItem<'every_day' | 'selected_dates'>[] = React.useMemo(
    () => [
      { label: t('mealEditor.applicabilityOptions.everyDay'), value: 'every_day' },
      { label: t('mealEditor.applicabilityOptions.selectedDates'), value: 'selected_dates' },
    ],
    [t]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MealForm>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      mealType: 'Kahvalti',
      customMealName: '',
      time: defaultTimeByMeal.Kahvalti,
      note: '',
      appliesToType: 'every_day',
      appliesToDates: [],
    },
  });

  const selectedMealType = watch('mealType');
  const mealContent = watch('note');
  const selectedTime = watch('time');
  const appliesToType = watch('appliesToType');
  const appliesToDates = watch('appliesToDates');

  const toMinuteOfDay = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const buildSortedMeals = (incomingMeal: MealInput): MealInput[] => {
    const merged = [...meals, incomingMeal];
    return merged
      .map((meal, index) => ({ meal, index }))
      .sort((a, b) => {
        const timeDiff = toMinuteOfDay(a.meal.time) - toMinuteOfDay(b.meal.time);
        if (timeDiff !== 0) {
          return timeDiff;
        }
        const nameDiff = a.meal.name.localeCompare(b.meal.name, language);
        if (nameDiff !== 0) {
          return nameDiff;
        }
        return a.index - b.index;
      })
      .map(({ meal }, orderIndex) => ({
        ...meal,
        order: orderIndex + 1,
      }));
  };

  const toggleDate = (date: string): void => {
    const nextDates = appliesToDates.includes(date)
      ? appliesToDates.filter((value) => value !== date)
      : [...appliesToDates, date].sort();

    setValue('appliesToDates', nextDates, { shouldValidate: true });
  };

  const submit = (form: MealForm): void => {
    const resolvedName =
      form.mealType === 'Diger' ? (form.customMealName?.trim() ?? '') : form.mealType;
    const candidateMeal: MealInput = {
      name: resolvedName,
      time: form.time.trim(),
      note: form.note?.trim(),
      order: 1,
      appliesToType: form.appliesToType,
      appliesToDates: form.appliesToType === 'selected_dates' ? form.appliesToDates : undefined,
    };
    const sortedMeals = buildSortedMeals(candidateMeal);
    const insertedMeal = sortedMeals.find(
      (meal) =>
        meal.name === candidateMeal.name &&
        meal.time === candidateMeal.time &&
        meal.note === candidateMeal.note &&
        meal.appliesToType === candidateMeal.appliesToType
    );
    onAddMeal(insertedMeal ?? sortedMeals[sortedMeals.length - 1]);
    reset({
      mealType: 'Kahvalti',
      customMealName: '',
      time: defaultTimeByMeal.Kahvalti,
      note: '',
      appliesToType: 'every_day',
      appliesToDates: [],
    });
  };

  return (
    <Card style={styles.container} variant="elevated">
      <Text style={styles.kicker}>{t('mealEditor.kicker')}</Text>
      <Text style={styles.title}>{t('mealEditor.title')}</Text>
      <Text style={styles.description}>{t('mealEditor.description')}</Text>
      <OptionChips<MealForm['mealType']>
        label={t('mealEditor.mealSelection')}
        options={mealOptionChips}
        value={selectedMealType}
        onChange={(nextType) => {
          setValue('mealType', nextType, { shouldValidate: true });
          setValue('time', defaultTimeByMeal[nextType], { shouldValidate: true });
        }}
      />
      {selectedMealType === 'Diger' ? (
        <FormTextField<MealForm>
          control={control}
          name="customMealName"
          label={t('mealEditor.mealName')}
          placeholder={t('mealEditor.mealNamePlaceholder')}
          autoCapitalize="words"
        />
      ) : null}
      <FormTextField<MealForm>
        control={control}
        name="note"
        label={t('mealEditor.mealContent')}
        placeholder={t('mealEditor.mealContentPlaceholder')}
        autoCapitalize="sentences"
        helperText={t('mealEditor.mealContentHelper')}
      />
      {!mealContent?.trim() ? (
        <Text style={styles.emptyHint}>{t('mealEditor.contentHint')}</Text>
      ) : null}
      <FormTextField<MealForm>
        control={control}
        name="time"
        label={t('mealEditor.time')}
        placeholder="08:00"
        helperText={t('mealEditor.timeHelper')}
      />
      <OptionChips<string>
        label={t('mealEditor.quickTime')}
        options={commonTimeOptions}
        value={selectedTime}
        onChange={(nextTime) => {
          setValue('time', nextTime, { shouldValidate: true });
        }}
      />
      <OptionChips<'every_day' | 'selected_dates'>
        label={t('mealEditor.applicability')}
        options={applicabilityOptions}
        value={appliesToType}
        onChange={(nextValue) => {
          setValue('appliesToType', nextValue, { shouldValidate: true });
          if (nextValue === 'every_day') {
            setValue('appliesToDates', [], { shouldValidate: true });
          }
        }}
      />
      {appliesToType === 'selected_dates' ? (
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>{t('mealEditor.datesLabel')}</Text>
          <View style={styles.dateGrid}>
            {selectableDates.map((date) => {
              const isSelected = appliesToDates.includes(date);
              return (
                <Pressable
                  key={date}
                  onPress={() => toggleDate(date)}
                  style={[styles.dateChip, isSelected ? styles.dateChipSelected : null]}
                >
                  <Text style={[styles.dateChipText, isSelected ? styles.dateChipTextSelected : null]}>
                    {formatReadablePlanDate(date, language)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.appliesToDates?.message ? (
            <Text style={styles.errorText}>{errors.appliesToDates.message}</Text>
          ) : null}
        </View>
      ) : null}
      <PrimaryButton
        label={t('mealEditor.addToList')}
        onPress={() => {
          void handleSubmit(submit)();
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  kicker: {
    marginBottom: spacing.sm,
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    marginBottom: spacing.xs,
    fontWeight: '800',
    fontSize: typography.sectionTitle,
    color: colors.textPrimary,
  },
  description: {
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  emptyHint: {
    marginBottom: spacing.lg,
    fontSize: typography.helper,
    color: colors.textSecondary,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dateChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  dateChipText: {
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: '600',
  },
  dateChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: typography.caption,
  },
});
