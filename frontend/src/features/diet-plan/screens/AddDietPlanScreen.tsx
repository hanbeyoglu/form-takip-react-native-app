import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { LayoutAnimation, Modal, Pressable, UIManager, View } from 'react-native';
import { z } from 'zod';

import { AppStackParamList } from '../../../app/navigation/types';
import { useAppLocale } from '../../../localization/useAppLocale';
import { AppHeader } from '../../../shared/components/AppHeader';
import { Card } from '../../../shared/components/Card';
import { FormDatePickerField } from '../../../shared/components/FormDatePickerField';
import { FormTextField } from '../../../shared/components/FormTextField';
import { OptionChipItem, OptionChips } from '../../../shared/components/OptionChips';
import { MealList } from '../components/MealList';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { TextField } from '../../../shared/components/TextField';
import { useDietPlanStore } from '../../../store/dietPlan.store';
import { MealAppliesToType, MealInput } from '../../../types/diet-plan.types';
import {
  formatReadablePlanDate,
  getLocalDateRange,
} from '../../../shared/utils/mealApplicability';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

type FormValues = {
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  notes?: string;
};
type Props = NativeStackScreenProps<AppStackParamList, 'AddDietPlan'>;

const mealTypeOptions = [
  'Kahvalti',
  'Ogle Yemegi',
  'Ara Ogun',
  'Aksam Yemegi',
  'Gece Ogunu',
  'Diger',
] as const;

const defaultTimeByMeal: Record<(typeof mealTypeOptions)[number], string> = {
  Kahvalti: '08:00',
  'Ogle Yemegi': '12:30',
  'Ara Ogun': '10:30',
  'Aksam Yemegi': '19:00',
  'Gece Ogunu': '22:00',
  Diger: '14:00',
};

export function AddDietPlanScreen({ navigation, route }: Props): React.JSX.Element {
  const { t, language } = useAppLocale();
  const isDietDayFlow = Boolean(route.params?.fromDietDay);
  const fallbacks = getDietPlanFallbacks(language);
  const schema = React.useMemo(
    () =>
      z.object({
        title: z.string().min(2, t('dietPlanForm.validation.title', { defaultValue: fallbacks.validationTitle })),
        weekStartDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, t('dietPlanForm.validation.startDate', { defaultValue: fallbacks.validationStartDate })),
        weekEndDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, t('dietPlanForm.validation.endDate', { defaultValue: fallbacks.validationEndDate })),
        notes: z.string().optional(),
      }),
    [fallbacks.validationEndDate, fallbacks.validationStartDate, fallbacks.validationTitle, t]
  );
  const createPlan = useDietPlanStore((state) => state.createPlan);
  const isLoading = useDietPlanStore((state) => state.isLoading);
  const [meals, setMeals] = React.useState<MealInput[]>([]);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isMealModalVisible, setIsMealModalVisible] = React.useState(false);
  const [mealType, setMealType] = React.useState<(typeof mealTypeOptions)[number]>('Kahvalti');
  const [mealTime, setMealTime] = React.useState(defaultTimeByMeal.Kahvalti);
  const [mealNote, setMealNote] = React.useState('');
  const [mealCustomName, setMealCustomName] = React.useState('');
  const [mealAppliesToType, setMealAppliesToType] =
    React.useState<MealAppliesToType>('every_day');
  const [mealAppliesToDates, setMealAppliesToDates] = React.useState<string[]>([]);
  const [mealModalError, setMealModalError] = React.useState<string | null>(null);
  const { control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      weekStartDate: new Date().toISOString().slice(0, 10),
      weekEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
    },
  });
  const weekStartDate = watch('weekStartDate');
  const weekEndDate = watch('weekEndDate');
  const mealTypeLabelMap: Record<(typeof mealTypeOptions)[number], string> = {
    Kahvalti: t('mealEditor.mealTypes.kahvalti', { defaultValue: fallbacks.mealTypes.kahvalti }),
    'Ogle Yemegi': t('mealEditor.mealTypes.ogle', { defaultValue: fallbacks.mealTypes.ogle }),
    'Ara Ogun': t('mealEditor.mealTypes.ara', { defaultValue: fallbacks.mealTypes.ara }),
    'Aksam Yemegi': t('mealEditor.mealTypes.aksam', { defaultValue: fallbacks.mealTypes.aksam }),
    'Gece Ogunu': t('mealEditor.mealTypes.gece', { defaultValue: fallbacks.mealTypes.gece }),
    Diger: t('mealEditor.mealTypes.diger', { defaultValue: fallbacks.mealTypes.diger }),
  };
  const mealTypeChips: OptionChipItem<(typeof mealTypeOptions)[number]>[] = mealTypeOptions.map(
    (option) => ({ label: mealTypeLabelMap[option], value: option })
  );
  const applicabilityOptions: OptionChipItem<MealAppliesToType>[] = [
    { label: t('mealEditor.applicabilityOptions.everyDay', { defaultValue: fallbacks.everyDay }), value: 'every_day' },
    { label: t('mealEditor.applicabilityOptions.selectedDates', { defaultValue: fallbacks.selectedDates }), value: 'selected_dates' },
  ];
  const selectableDates = React.useMemo(
    () => getLocalDateRange(weekStartDate, weekEndDate),
    [weekEndDate, weekStartDate]
  );

  const toMinuteOfDay = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const normalizeMealOrders = (items: MealInput[]): MealInput[] => {
    return [...items]
      .sort((a, b) => {
        const timeDiff = toMinuteOfDay(a.time) - toMinuteOfDay(b.time);
        if (timeDiff !== 0) {
          return timeDiff;
        }
        return a.name.localeCompare(b.name, 'tr');
      })
      .map((meal, index) => ({
        ...meal,
        order: index + 1,
      }));
  };

  const onAddMeal = (meal: MealInput): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMeals((prev) => normalizeMealOrders([...prev, meal]));
  };

  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const openMealModal = (): void => {
    setMealModalError(null);
    setMealType('Kahvalti');
    setMealTime(defaultTimeByMeal.Kahvalti);
    setMealNote('');
    setMealCustomName('');
    setMealAppliesToType('every_day');
    setMealAppliesToDates([]);
    setIsMealModalVisible(true);
  };

  const closeMealModal = (): void => {
    setIsMealModalVisible(false);
  };

  const toggleMealDate = (date: string): void => {
    setMealAppliesToDates((prev) =>
      prev.includes(date) ? prev.filter((value) => value !== date) : [...prev, date].sort()
    );
  };

  const saveMealFromModal = (): void => {
    setMealModalError(null);
    const mealName = mealType === 'Diger' ? mealCustomName.trim() : mealType;
    if (!mealName) {
      setMealModalError(t('mealEditor.validation.customMealName', { defaultValue: fallbacks.validationCustomMealName }));
      return;
    }
    const trimmedTime = mealTime.trim();
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmedTime)) {
      setMealModalError(t('mealEditor.validation.time', { defaultValue: fallbacks.validationTime }));
      return;
    }
    if (mealAppliesToType === 'selected_dates' && mealAppliesToDates.length === 0) {
      setMealModalError(t('mealEditor.validation.selectedDates', { defaultValue: fallbacks.validationSelectedDates }));
      return;
    }
    onAddMeal({
      name: mealName,
      time: trimmedTime,
      note: mealNote.trim() || undefined,
      order: 1,
      appliesToType: mealAppliesToType,
      appliesToDates: mealAppliesToType === 'selected_dates' ? mealAppliesToDates : undefined,
    });
    closeMealModal();
  };

  const submit = async (form: FormValues): Promise<void> => {
    setSubmitError(null);
    if (meals.length === 0) {
      setSubmitError(t('dietPlanForm.validation.atLeastOneMeal', { defaultValue: fallbacks.validationAtLeastOneMeal }));
      return;
    }
    try {
      const created = await createPlan({
        title: form.title.trim(),
        weekStartDate: form.weekStartDate,
        weekEndDate: form.weekEndDate,
        notes: form.notes?.trim(),
        meals,
        activateNow: true,
      });
      if (isDietDayFlow) {
        navigation.replace('DietDaySuccess');
        return;
      }
      navigation.replace('DietPlanDetail', { planId: created.id });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t('dietPlanForm.validation.createFailed', { defaultValue: fallbacks.validationCreateFailed })
      );
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={
              isDietDayFlow
                ? t('dietPlanForm.dietDayTitle', { defaultValue: fallbacks.dietDayTitle })
                : t('dietPlanForm.addTitle', { defaultValue: fallbacks.addTitle })
            }
            subtitle={
              isDietDayFlow
                ? t('dietPlanForm.dietDaySubtitle', { defaultValue: fallbacks.dietDaySubtitle })
                : t('dietPlanForm.addSubtitle', { defaultValue: fallbacks.addSubtitle })
            }
            showBackButton
          />
          <Card style={styles.heroCard} variant="elevated">
            <Text style={styles.heroKicker}>
              {isDietDayFlow
                ? t('dietPlanForm.heroDietDay', { defaultValue: fallbacks.heroDietDay })
                : t('dietPlanForm.heroCreate', { defaultValue: fallbacks.heroCreate })}
            </Text>
            <Text style={styles.heroTitle}>
              {isDietDayFlow
                ? t('dietPlanForm.heroDietDayTitle', { defaultValue: fallbacks.heroDietDayTitle })
                : t('dietPlanForm.heroCreateTitle', { defaultValue: fallbacks.heroCreateTitle })}
            </Text>
            <Text style={styles.heroText}>{t('dietPlanForm.heroText', { defaultValue: fallbacks.heroText })}</Text>
          </Card>
          <Card style={styles.sectionCard}>
            <FormTextField<FormValues> control={control} name="title" label={t('dietPlanForm.title', { defaultValue: fallbacks.title })} />
            <FormDatePickerField<FormValues>
              control={control}
              name="weekStartDate"
              label={t('dietPlanForm.startDate', { defaultValue: fallbacks.startDate })}
            />
            <FormDatePickerField<FormValues>
              control={control}
              name="weekEndDate"
              label={t('dietPlanForm.endDate', { defaultValue: fallbacks.endDate })}
            />
            <FormTextField<FormValues> control={control} name="notes" label={t('dietPlanForm.notes', { defaultValue: fallbacks.notes })} />
          </Card>
          <Text style={styles.mealsTitle}>{t('dietPlanForm.mealsTitle', { defaultValue: fallbacks.mealsTitle })}</Text>
          {meals.length === 0 ? (
            <Card style={styles.emptyStateCard} variant="muted">
              <Text style={styles.emptyStateTitle}>{t('dietPlanForm.emptyTitle', { defaultValue: fallbacks.emptyTitle })}</Text>
              <Text style={styles.emptyStateDescription}>{t('dietPlanForm.emptyDescription', { defaultValue: fallbacks.emptyDescription })}</Text>
            </Card>
          ) : null}
          <PrimaryButton label={t('dietPlanForm.addMeal', { defaultValue: fallbacks.addMeal })} variant="secondary" onPress={openMealModal} />
          {meals.length > 0 ? (
            <MealList meals={meals.map((m, i) => ({ ...m, mealId: `temp-${i}` }))} />
          ) : null}
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={t('dietPlanForm.finish', { defaultValue: fallbacks.finish })}
            isLoading={isLoading}
            onPress={() => {
              void handleSubmit(submit)();
            }}
          />
        </View>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={isMealModalVisible}
        animationType="slide"
        onRequestClose={closeMealModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeMealModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{t('dietPlanForm.mealModalTitle', { defaultValue: fallbacks.mealModalTitle })}</Text>
            <OptionChips<(typeof mealTypeOptions)[number]>
              label={t('mealEditor.mealSelection', { defaultValue: fallbacks.mealSelection })}
              options={mealTypeChips}
              value={mealType}
              onChange={(nextType) => {
                setMealType(nextType);
                setMealTime(defaultTimeByMeal[nextType]);
              }}
            />
            {mealType === 'Diger' ? (
              <TextField
                label={t('mealEditor.mealName', { defaultValue: fallbacks.mealName })}
                value={mealCustomName}
                onChangeText={setMealCustomName}
                placeholder={t('mealEditor.mealTypes.diger', { defaultValue: fallbacks.mealTypes.diger })}
                autoCapitalize="words"
              />
            ) : null}
            <TextField
              label={t('mealEditor.time', { defaultValue: fallbacks.time })}
              value={mealTime}
              onChangeText={setMealTime}
              placeholder="08:00"
              helperText={t('mealEditor.validation.time', { defaultValue: fallbacks.validationTime })}
            />
            <TextField
              label={t('mealEditor.mealContent', { defaultValue: fallbacks.mealContent })}
              value={mealNote}
              onChangeText={setMealNote}
              placeholder={t('mealEditor.mealContentPlaceholder', { defaultValue: fallbacks.mealContentPlaceholder })}
              autoCapitalize="sentences"
              helperText={t('mealEditor.mealContentHelper', { defaultValue: fallbacks.mealContentHelper })}
            />
            <OptionChips<MealAppliesToType>
              label={t('mealEditor.applicability', { defaultValue: fallbacks.applicability })}
              options={applicabilityOptions}
              value={mealAppliesToType}
              onChange={(value) => {
                setMealAppliesToType(value);
                if (value === 'every_day') {
                  setMealAppliesToDates([]);
                }
              }}
            />
            {mealAppliesToType === 'selected_dates' ? (
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>{t('mealEditor.datesLabel', { defaultValue: fallbacks.datesLabel })}</Text>
                <View style={styles.dateGrid}>
                  {selectableDates.map((date) => {
                    const isSelected = mealAppliesToDates.includes(date);
                    return (
                      <Pressable
                        key={date}
                        onPress={() => toggleMealDate(date)}
                        style={[styles.dateChip, isSelected ? styles.dateChipSelected : null]}
                      >
                        <Text
                          style={[
                            styles.dateChipText,
                            isSelected ? styles.dateChipTextSelected : null,
                          ]}
                        >
                          {formatReadablePlanDate(date)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            {!mealNote.trim() ? (
              <Text style={styles.modalHint}>{t('mealEditor.contentHint', { defaultValue: fallbacks.contentHint })}</Text>
            ) : null}
            {mealModalError ? <Text style={styles.error}>{mealModalError}</Text> : null}
            <View style={styles.modalActions}>
              <PrimaryButton label={t('common.cancel', { defaultValue: fallbacks.cancel })} variant="secondary" onPress={closeMealModal} />
              <PrimaryButton label={t('common.save', { defaultValue: fallbacks.save })} onPress={saveMealFromModal} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function getDietPlanFallbacks(language: string) {
  const map = {
    tr: {
      validationTitle: 'Başlık en az 2 karakter olmalı.',
      validationStartDate: 'Başlangıç tarihini takvimden seç.',
      validationEndDate: 'Bitiş tarihini takvimden seç.',
      validationAtLeastOneMeal: 'En az bir öğün eklemelisin.',
      validationCreateFailed: 'Plan oluşturulamadı.',
      validationTime: 'Saat HH:mm formatında olmalı.',
      validationCustomMealName: 'Diğer seçeneği için öğün adı en az 2 karakter olmalı.',
      validationSelectedDates: 'Belirli günler seçildiyse en az bir tarih seçmelisin.',
      addTitle: 'Yeni Diyet Planı',
      addSubtitle: 'Haftalık planını oluştur ve hemen aktif et.',
      dietDayTitle: 'Diyet Görüş Günüm',
      dietDaySubtitle: 'Adım 2/2: Yeni planını ekleyip akışı tamamla.',
      heroCreate: 'PLAN OLUŞTURMA',
      heroCreateTitle: 'Haftalık düzenini net ve güçlü biçimde kur',
      heroDietDay: 'AKIŞI TAMAMLAMA',
      heroDietDayTitle: 'Yeni planını son dokunuşlarla tamamla',
      heroText: 'Başlık, tarih ve öğün akışı bir araya geldiğinde takip deneyimi daha net ve kullanışlı hâle gelir.',
      title: 'Plan Başlığı',
      startDate: 'Başlangıç Tarihi',
      endDate: 'Bitiş Tarihi',
      notes: 'Not (opsiyonel)',
      mealsTitle: 'Öğünlerini Ekle',
      emptyTitle: 'Henüz öğün eklenmedi',
      emptyDescription: 'Öğünlerini ekleyerek planını tamamlayabilirsin.',
      addMeal: '+ Öğün Ekle',
      finish: 'Kaydet ve Bitir',
      mealModalTitle: 'Öğün Ekle',
      mealSelection: 'Öğün Seçimi',
      mealName: 'Öğün Adı',
      mealContent: 'Bu öğünde ne yiyeceksin?',
      mealContentPlaceholder: 'Örn: 2 yumurta, 1 dilim peynir, domates, salatalık',
      mealContentHelper: 'Bu içerik hatırlatmalarda ve öğün detayında görünebilir.',
      contentHint: 'İçerik eklersen öğün hatırlatmaları daha anlamlı olur.',
      time: 'Saat',
      applicability: 'Geçerlilik',
      datesLabel: 'Geçerli olduğu günler',
      everyDay: 'Her gün',
      selectedDates: 'Belirli günler',
      cancel: 'Vazgeç',
      save: 'Kaydet',
      mealTypes: {
        kahvalti: 'Kahvaltı',
        ogle: 'Öğle Yemeği',
        ara: 'Ara Öğün',
        aksam: 'Akşam Yemeği',
        gece: 'Gece Öğünü',
        diger: 'Diğer',
      },
    },
    en: {
      validationTitle: 'Title must be at least 2 characters.',
      validationStartDate: 'Choose the start date from the calendar.',
      validationEndDate: 'Choose the end date from the calendar.',
      validationAtLeastOneMeal: 'You need to add at least one meal.',
      validationCreateFailed: "Couldn't create the plan.",
      validationTime: 'Time must be in HH:mm format.',
      validationCustomMealName: 'For Other, meal name must be at least 2 characters.',
      validationSelectedDates: 'Select at least one date when using specific dates.',
      addTitle: 'New Diet Plan',
      addSubtitle: 'Create your weekly plan and make it active.',
      dietDayTitle: 'My Diet Review Day',
      dietDaySubtitle: 'Step 2/2: Add your new plan and complete the flow.',
      heroCreate: 'PLAN CREATION',
      heroCreateTitle: 'Build your weekly structure with polish',
      heroDietDay: 'FLOW COMPLETION',
      heroDietDayTitle: 'Complete your new plan with the final touches',
      heroText: 'When title, dates and meal flow align, the tracking experience becomes clearer and more useful.',
      title: 'Plan Title',
      startDate: 'Start Date',
      endDate: 'End Date',
      notes: 'Notes (optional)',
      mealsTitle: 'Add Meals',
      emptyTitle: 'No meals added yet',
      emptyDescription: 'You can complete the plan by adding meals.',
      addMeal: '+ Add Meal',
      finish: 'Save and Finish',
      mealModalTitle: 'Add Meal',
      mealSelection: 'Meal Type',
      mealName: 'Meal Name',
      mealContent: 'What will you eat in this meal?',
      mealContentPlaceholder: 'e.g. 2 eggs, cheese, tomato, cucumber',
      mealContentHelper: 'This content may appear in reminders and meal details.',
      contentHint: 'Adding content makes meal reminders more meaningful.',
      time: 'Time',
      applicability: 'Applies to',
      datesLabel: 'Valid on these dates',
      everyDay: 'Every day',
      selectedDates: 'Selected dates',
      cancel: 'Cancel',
      save: 'Save',
      mealTypes: {
        kahvalti: 'Breakfast',
        ogle: 'Lunch',
        ara: 'Snack',
        aksam: 'Dinner',
        gece: 'Late Meal',
        diger: 'Other',
      },
    },
    de: {
      validationTitle: 'Titel muss mindestens 2 Zeichen lang sein.',
      validationStartDate: 'Bitte wählen Sie das Startdatum aus dem Kalender.',
      validationEndDate: 'Bitte wählen Sie das Enddatum aus dem Kalender.',
      validationAtLeastOneMeal: 'Es muss mindestens eine Mahlzeit hinzugefügt werden.',
      validationCreateFailed: 'Plan konnte nicht erstellt werden.',
      validationTime: 'Die Uhrzeit muss im Format HH:mm sein.',
      validationCustomMealName: 'Bei Andere muss der Name mindestens 2 Zeichen haben.',
      validationSelectedDates: 'Wähle mindestens ein Datum für bestimmte Tage.',
      addTitle: 'Neuer Ernährungsplan',
      addSubtitle: 'Erstelle deinen Wochenplan und aktiviere ihn.',
      dietDayTitle: 'Mein Ernährungstag',
      dietDaySubtitle: 'Schritt 2/2: Füge deinen neuen Plan hinzu und schließe den Ablauf ab.',
      heroCreate: 'PLANERSTELLUNG',
      heroCreateTitle: 'Baue deine Wochenstruktur mit Ruhe auf',
      heroDietDay: 'ABLAUF ABSCHLIESSEN',
      heroDietDayTitle: 'Gib deinem neuen Plan den letzten Feinschliff',
      heroText: 'Wenn Titel, Daten und Mahlzeitenfluss zusammenpassen, wird das Tracking klarer und wertvoller.',
      title: 'Plantitel',
      startDate: 'Startdatum',
      endDate: 'Enddatum',
      notes: 'Notiz (optional)',
      mealsTitle: 'Mahlzeiten hinzufügen',
      emptyTitle: 'Noch keine Mahlzeit hinzugefügt',
      emptyDescription: 'Ergänze den Plan, indem du Mahlzeiten hinzufügst.',
      addMeal: '+ Mahlzeit hinzufügen',
      finish: 'Speichern und abschliessen',
      mealModalTitle: 'Mahlzeit hinzufügen',
      mealSelection: 'Mahlzeittyp',
      mealName: 'Mahlzeitname',
      mealContent: 'Was wirst du in dieser Mahlzeit essen?',
      mealContentPlaceholder: 'z. B. 2 Eier, Käse, Tomate, Gurke',
      mealContentHelper: 'Dieser Inhalt kann in Erinnerungen und Details erscheinen.',
      contentHint: 'Mit Inhalt werden Erinnerungen hilfreicher.',
      time: 'Uhrzeit',
      applicability: 'Gültigkeit',
      datesLabel: 'Gültig an diesen Tagen',
      everyDay: 'Jeden Tag',
      selectedDates: 'Bestimmte Tage',
      cancel: 'Abbrechen',
      save: 'Speichern',
      mealTypes: {
        kahvalti: 'Frühstück',
        ogle: 'Mittagessen',
        ara: 'Snack',
        aksam: 'Abendessen',
        gece: 'Spätmahlzeit',
        diger: 'Andere',
      },
    },
    ar: {
      validationTitle: 'يجب أن يكون العنوان مكوّنًا من حرفين على الأقل.',
      validationStartDate: 'اختر تاريخ البداية من التقويم.',
      validationEndDate: 'اختر تاريخ النهاية من التقويم.',
      validationAtLeastOneMeal: 'يجب إضافة وجبة واحدة على الأقل.',
      validationCreateFailed: 'تعذر إنشاء الخطة.',
      validationTime: 'يجب أن يكون الوقت بصيغة HH:mm.',
      validationCustomMealName: 'عند اختيار أخرى يجب أن يكون اسم الوجبة حرفين على الأقل.',
      validationSelectedDates: 'اختر تاريخًا واحدًا على الأقل عند تحديد أيام معينة.',
      addTitle: 'خطة غذائية جديدة',
      addSubtitle: 'أنشئ خطتك الأسبوعية وفعّلها.',
      dietDayTitle: 'يوم مراجعتي الغذائية',
      dietDaySubtitle: 'الخطوة 2/2: أضف خطتك الجديدة وأكمل التدفق.',
      heroCreate: 'إنشاء الخطة',
      heroCreateTitle: 'ابنِ نظامك الأسبوعي بجودة وهدوء',
      heroDietDay: 'إكمال التدفق',
      heroDietDayTitle: 'أكمل خطتك الجديدة باللمسات الأخيرة',
      heroText: 'عندما ينسجم العنوان والتواريخ وتدفق الوجبات تصبح المتابعة أوضح وأكثر فائدة.',
      title: 'عنوان الخطة',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      notes: 'ملاحظات (اختياري)',
      mealsTitle: 'أضف الوجبات',
      emptyTitle: 'لم تتم إضافة وجبات بعد',
      emptyDescription: 'يمكنك إكمال الخطة عبر إضافة الوجبات.',
      addMeal: '+ إضافة وجبة',
      finish: 'حفظ وإنهاء',
      mealModalTitle: 'إضافة وجبة',
      mealSelection: 'نوع الوجبة',
      mealName: 'اسم الوجبة',
      mealContent: 'ماذا ستأكل في هذه الوجبة؟',
      mealContentPlaceholder: 'مثلًا: بيضتان، جبن، طماطم، خيار',
      mealContentHelper: 'قد يظهر هذا المحتوى في التذكيرات وتفاصيل الوجبة.',
      contentHint: 'إضافة المحتوى تجعل التذكيرات أكثر وضوحًا.',
      time: 'الوقت',
      applicability: 'ينطبق على',
      datesLabel: 'صالح في هذه الأيام',
      everyDay: 'كل يوم',
      selectedDates: 'أيام محددة',
      cancel: 'إلغاء',
      save: 'حفظ',
      mealTypes: {
        kahvalti: 'الفطور',
        ogle: 'الغداء',
        ara: 'وجبة خفيفة',
        aksam: 'العشاء',
        gece: 'وجبة ليلية',
        diger: 'أخرى',
      },
    },
  } as const;
  return map[language as keyof typeof map] ?? map.tr;
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 72,
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroKicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  mealsTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyStateCard: {
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  emptyStateDescription: {
    color: colors.textSecondary,
    fontSize: typography.helper,
  },
  error: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    color: '#DC2626',
    fontSize: typography.caption,
  },
  stickyFooter: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  modalHint: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    marginBottom: spacing.sm,
  },
  dateSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: '700',
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
