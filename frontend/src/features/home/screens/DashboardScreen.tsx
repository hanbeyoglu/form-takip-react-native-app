import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Archive,
  BarChart3,
  Bell,
  Droplets,
  type LucideIcon,
  Scale,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react-native';

import { AppStackParamList } from '../../../app/navigation/types';
import { useAppLocale } from '../../../localization/useAppLocale';
import { Card } from '../../../shared/components/Card';
import { LoadingState } from '../../../shared/components/LoadingState';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { TextField } from '../../../shared/components/TextField';
import { WaterProgress } from '../../../shared/components/WaterProgress';
import { profileService } from '../../profile/services/profile.service';
import { useAuthStore } from '../../../store/auth.store';
import { useDietPlanStore } from '../../../store/dietPlan.store';
import { useStatsStore } from '../../../store/stats.store';
import { useWaterStore } from '../../../store/water.store';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { WeightJourneyProgress } from '../components/WeightJourneyProgress';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

type QuickAction = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const HAS_SVG_NATIVE = Boolean(
  typeof UIManager.getViewManagerConfig === 'function' &&
  UIManager.getViewManagerConfig('RNSVGPath')
);

type QuickActionIconProps = {
  icon: LucideIcon;
};

function QuickActionIcon({ icon: Icon }: QuickActionIconProps): React.JSX.Element {
  if (HAS_SVG_NATIVE) {
    return <Icon color={colors.primary} size={22} strokeWidth={2.1} />;
  }

  return (
    <View style={styles.iconFallback} aria-hidden>
      <View style={styles.iconFallbackDotLarge} />
      <View style={styles.iconFallbackDotSmall} />
    </View>
  );
}

export function DashboardScreen({ navigation }: Props): React.JSX.Element {
  const { t, language } = useAppLocale();
  const { width } = useWindowDimensions();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const updateUserInState = useAuthStore((state) => state.updateUserInState);
  const fetchActivePlan = useDietPlanStore((state) => state.fetchActivePlan);
  const dashboardStats = useStatsStore((state) => state.dashboard);
  const fetchDashboard = useStatsStore((state) => state.fetchDashboard);
  const statsLoading = useStatsStore((state) => state.isDashboardLoading);
  const statsError = useStatsStore((state) => state.dashboardError);
  const quickAddWater = useWaterStore((state) => state.quickAdd);
  const [waterFeedback, setWaterFeedback] = React.useState<string | null>(null);
  const [isWaterTargetModalVisible, setIsWaterTargetModalVisible] = React.useState(false);
  const [waterTargetInput, setWaterTargetInput] = React.useState('');
  const [waterTargetError, setWaterTargetError] = React.useState<string | null>(null);
  const [isSavingWaterTarget, setIsSavingWaterTarget] = React.useState(false);
  const waterTarget = dashboardStats?.dailyWaterTargetMl ?? user?.dailyWaterTargetMl ?? 2500;
  const waterConsumed = dashboardStats?.todayWaterConsumedMl ?? 0;
  const waterProgress = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));
  const startingWeight = user?.startingWeightKg ?? null;
  const targetWeight = user?.targetWeightKg ?? null;
  const currentWeight = dashboardStats?.latestWeight?.weightKg ?? null;
  const hasWeightProgressData =
    startingWeight !== null &&
    targetWeight !== null &&
    currentWeight !== null &&
    startingWeight !== targetWeight;
  const rawWeightProgress = hasWeightProgressData
    ? (startingWeight - currentWeight) / (startingWeight - targetWeight)
    : 0;
  const clampedWeightProgress = Math.max(0, Math.min(1, rawWeightProgress));
  const isWide = width >= 420;
  const quickActionColumns = width >= 768 ? 3 : 2;
  const dashboardFallbacks = getDashboardFallbacks(language);
  const waterMotivation = getWaterMotivationMessage(t, waterProgress, dashboardFallbacks);

  React.useEffect(() => {
    if (user && !user.isProfileCompleted) {
      navigation.replace('ProfileSetup');
    }
  }, [navigation, user]);

  React.useEffect(() => {
    void Promise.all([fetchActivePlan(), fetchDashboard()]);
  }, [fetchActivePlan, fetchDashboard]);

  const handleQuickWater = async (amountMl: number, label: string): Promise<void> => {
    try {
      await quickAddWater(amountMl);
      setWaterFeedback(
        t('dashboard.waterAdded', {
          label,
          defaultValue: dashboardFallbacks.waterAdded(label),
        })
      );
      setTimeout(() => {
        setWaterFeedback(null);
      }, 1600);
    } catch {
      setWaterFeedback(
        t('dashboard.waterAddFailed', {
          defaultValue: dashboardFallbacks.waterAddFailed,
        })
      );
      setTimeout(() => {
        setWaterFeedback(null);
      }, 1800);
    }
  };

  const openWaterTargetModal = (): void => {
    setWaterTargetError(null);
    setWaterTargetInput(String(waterTarget));
    setIsWaterTargetModalVisible(true);
  };

  const closeWaterTargetModal = (): void => {
    if (isSavingWaterTarget) {
      return;
    }
    setIsWaterTargetModalVisible(false);
  };

  const saveWaterTarget = async (): Promise<void> => {
    const nextTarget = Number(waterTargetInput.trim());
    if (!Number.isFinite(nextTarget) || Number.isNaN(nextTarget)) {
      setWaterTargetError(
        t('dashboard.targetInvalid', { defaultValue: dashboardFallbacks.targetInvalid })
      );
      return;
    }
    if (nextTarget < 1000 || nextTarget > 6000) {
      setWaterTargetError(
        t('dashboard.targetRange', {
          defaultValue: dashboardFallbacks.targetRange,
        })
      );
      return;
    }

    setWaterTargetError(null);
    setIsSavingWaterTarget(true);

    try {
      const updatedProfile = await profileService.updateProfile({
        dailyWaterTargetMl: nextTarget,
      });
      updateUserInState(updatedProfile);
      await fetchDashboard();
      setIsWaterTargetModalVisible(false);
    } catch (error) {
      setWaterTargetError(
        error instanceof Error
          ? error.message
          : t('dashboard.targetUpdateFailed', {
              defaultValue: dashboardFallbacks.targetUpdateFailed,
            })
      );
    } finally {
      setIsSavingWaterTarget(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'active-plan',
      icon: UtensilsCrossed,
      title: t('dashboard.actions.activePlanTitle'),
      subtitle: t('dashboard.actions.activePlanSubtitle'),
      onPress: () => navigation.navigate('ActiveDietPlan'),
    },
    {
      id: 'history',
      icon: Archive,
      title: t('dashboard.actions.historyTitle'),
      subtitle: t('dashboard.actions.historySubtitle'),
      onPress: () => navigation.navigate('PlanHistory'),
    },
    {
      id: 'water',
      icon: Droplets,
      title: t('dashboard.actions.waterTitle'),
      subtitle: t('dashboard.actions.waterSubtitle'),
      onPress: () => navigation.navigate('WaterTracker'),
    },
    {
      id: 'weight',
      icon: Scale,
      title: t('dashboard.actions.weightTitle'),
      subtitle: t('dashboard.actions.weightSubtitle'),
      onPress: () => navigation.navigate('WeightTracker'),
    },
    {
      id: 'stats',
      icon: BarChart3,
      title: t('dashboard.actions.statsTitle'),
      subtitle: t('dashboard.actions.statsSubtitle'),
      onPress: () => navigation.navigate('BasicStats'),
    },
    {
      id: 'profile',
      icon: UserRound,
      title: t('dashboard.actions.profileTitle'),
      subtitle: t('dashboard.actions.profileSubtitle'),
      onPress: () => navigation.navigate('ProfileEdit'),
    },
    {
      id: 'notifications',
      icon: Bell,
      title: t('dashboard.actions.notificationsTitle'),
      subtitle: t('dashboard.actions.notificationsSubtitle'),
      onPress: () => navigation.navigate('NotificationPreferences'),
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>{t('dashboard.dailyRitual')}</Text>
          </View>
          <Text style={styles.pageTitle}>
            {user ? t('dashboard.welcome', { name: user.name }) : t('dashboard.welcomeNoName')}
          </Text>
          <Text style={styles.pageSubtitle}>{t('dashboard.subtitle')}</Text>
        </View>

        {statsLoading ? <LoadingState /> : null}
        {statsError ? <Text style={styles.error}>{statsError}</Text> : null}

        <Card style={styles.heroCard} variant="elevated">
          <View style={styles.heroGradientBase} />
          <View style={styles.heroGradientBand} />
          <View style={styles.heroGradientOrb} />
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.heroEyebrow}>{t('dashboard.heroEyebrow')}</Text>
              <Text style={styles.heroTitle}>{t('dashboard.heroTitle')}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.heroMiniButton, pressed ? styles.pressed : null]}
              onPress={() => navigation.navigate('WaterTracker')}
            >
              <Text style={styles.heroMiniButtonText}>{t('dashboard.water.detail')}</Text>
            </Pressable>
          </View>
          <Text style={styles.heroMetric}>
            {waterConsumed} <Text style={styles.heroMetricSub}>/ {waterTarget} ml</Text>
          </Text>
          <Text style={styles.heroHelper}>
            {t('waterTracker.heroText', { progress: waterProgress })}
          </Text>
          <WaterProgress progress={waterProgress} variant="hero" />
          <Text style={styles.heroMotivation}>{waterMotivation}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaCard}>
              <Text style={styles.heroMetaLabel}>{t('waterTracker.remaining')}</Text>
              <Text style={styles.heroMetaValue}>
                {Math.max(waterTarget - waterConsumed, 0)} ml
              </Text>
            </View>
            <View style={styles.heroMetaCard}>
              <View style={styles.heroMetaHeader}>
                <Text style={styles.heroMetaLabel}>{t('dashboard.water.target')}</Text>
                <Pressable
                  style={({ pressed }) => [styles.metaEditButton, pressed ? styles.pressed : null]}
                  onPress={openWaterTargetModal}
                >
                  <Text style={styles.metaEditButtonText}>{t('common.edit')}</Text>
                </Pressable>
              </View>
              <Text style={styles.heroMetaValue}>{waterTarget} ml</Text>
            </View>
          </View>
          <View style={styles.waterQuickRow}>
            <Pressable
              style={({ pressed }) => [styles.waterChip, pressed ? styles.pressed : null]}
              onPress={() =>
                void handleQuickWater(
                  200,
                  t('dashboard.water.quickGlass', { defaultValue: dashboardFallbacks.quickGlass })
                )
              }
            >
              <Text style={styles.waterChipText}>
                {t('dashboard.water.quickGlass', { defaultValue: dashboardFallbacks.quickGlass })}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.waterChip, pressed ? styles.pressed : null]}
              onPress={() =>
                void handleQuickWater(
                  300,
                  t('dashboard.water.quickLargeGlass', {
                    defaultValue: dashboardFallbacks.quickLargeGlass,
                  })
                )
              }
            >
              <Text style={styles.waterChipText}>
                {t('dashboard.water.quickLargeGlass', {
                  defaultValue: dashboardFallbacks.quickLargeGlass,
                })}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.waterChip, pressed ? styles.pressed : null]}
              onPress={() =>
                void handleQuickWater(
                  500,
                  t('dashboard.water.quickBottle', { defaultValue: dashboardFallbacks.quickBottle })
                )
              }
            >
              <Text style={styles.waterChipText}>
                {t('dashboard.water.quickBottle', { defaultValue: dashboardFallbacks.quickBottle })}
              </Text>
            </Pressable>
          </View>
          {waterFeedback ? <Text style={styles.waterFeedback}>{waterFeedback}</Text> : null}
        </Card>

        <Pressable
          style={({ pressed }) => [styles.dietDayCard, pressed ? styles.pressed : null]}
          onPress={() => navigation.navigate('DietDayWeight')}
        >
          <View style={styles.dietDayTopRow}>
            <Text style={styles.dietDayBadge}>
              {t('dashboard.dietDay.badge', { defaultValue: dashboardFallbacks.dietDayBadge })}
            </Text>
            <Text style={styles.dietDayArrow}>›</Text>
          </View>
          <Text style={styles.dietDayTitle}>
            {t('dashboard.dietDay.title', {
              defaultValue: dashboardFallbacks.dietDayTitle,
            })}
          </Text>
          <Text style={styles.dietDaySubtitle}>
            {t('dashboard.dietDay.subtitle', {
              defaultValue: dashboardFallbacks.dietDaySubtitle,
            })}
          </Text>
        </Pressable>

        <View style={styles.summaryRow}>
          <Card
            style={[
              styles.summaryCard,
              quickActionColumns === 2 ? styles.summaryCardTwoColumn : styles.summaryCardThreeColumn,
              styles.summaryCardSpacing,
            ]}
            variant="muted"
          >
            <Text style={styles.summaryLabel}>
              {t('dashboard.summary.activePlan', { defaultValue: dashboardFallbacks.activePlan })}
            </Text>
            <Text style={styles.summaryMetric}>
              {dashboardStats?.activePlan ? `${dashboardStats.todayMealCount}` : '-'}
            </Text>
            <Text style={styles.summaryUnit}>
              {t('dashboard.summary.mealUnit', { defaultValue: dashboardFallbacks.mealUnit })}
            </Text>
            <Text style={styles.summaryText}>
              {dashboardStats?.activePlan
                ? dashboardStats.activePlan.title
                : t('plans.emptyStateTitle', { defaultValue: dashboardFallbacks.noActivePlan })}
            </Text>
          </Card>
          <Card
            style={[
              styles.summaryCard,
              quickActionColumns === 2 ? styles.summaryCardTwoColumn : styles.summaryCardThreeColumn,
            ]}
            variant="muted"
          >
            <Text style={styles.summaryLabel}>
              {t('dashboard.summary.latestWeight', {
                defaultValue: dashboardFallbacks.latestWeight,
              })}
            </Text>
            <Text style={styles.summaryMetric}>
              {dashboardStats?.latestWeight ? dashboardStats.latestWeight.weightKg : '-'}
            </Text>
            <Text style={styles.summaryUnit}>kg</Text>
            <Text style={styles.summaryText}>
              {dashboardStats?.latestWeight
                ? t('dashboard.summary.latestWeightHint', {
                    defaultValue: dashboardFallbacks.latestWeightHint,
                  })
                : t('dashboard.summary.noWeight', {
                    defaultValue: dashboardFallbacks.noWeight,
                  })}
            </Text>
          </Card>
        </View>

        {hasWeightProgressData ? (
          <WeightJourneyProgress
            progress={clampedWeightProgress}
            startWeight={startingWeight}
            currentWeight={currentWeight}
            targetWeight={targetWeight}
            gender={user?.gender}
          />
        ) : (
          <Card style={styles.progressCard}>
            <Text style={styles.progressEmpty}>{t('plans.emptyStateDescription')}</Text>
          </Card>
        )}

        <SectionTitle title={t('dashboard.quickActions')} />
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => {
            const isLastInRow = (index + 1) % quickActionColumns === 0;
            const isTwoColumnLayout = quickActionColumns === 2;
            return (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.actionCard,
                  isTwoColumnLayout ? styles.actionCardTwoColumn : styles.actionCardThreeColumn,
                  !isLastInRow ? styles.actionCardSpacing : null,
                  pressed ? styles.pressed : null,
                ]}
                onPress={action.onPress}
              >
                <View style={styles.actionBadge}>
                  <QuickActionIcon icon={action.icon} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionHint}>{action.subtitle}</Text>
                <Text style={styles.actionArrow}>{t('dashboard.quickActionOpen')}</Text>
              </Pressable>
            );
          })}
        </View>

        <Card style={styles.logoutCard} variant="muted">
          <Text style={styles.logoutTitle}>{t('dashboard.logout')}</Text>
          <Text style={styles.logoutSubtitle}>{t('dashboard.logoutSubtitle')}</Text>
          <PrimaryButton
            label={t('dashboard.logout')}
            variant="danger"
            onPress={() => {
              void logout();
            }}
          />
        </Card>
      </ScrollView>
      <Modal
        transparent
        visible={isWaterTargetModalVisible}
        animationType="fade"
        onRequestClose={closeWaterTargetModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeWaterTargetModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{t('dashboard.water.editTargetTitle')}</Text>
            <Text style={styles.modalDescription}>{t('dashboard.water.editTargetSubtitle')}</Text>
            <TextField
              label={t('dashboard.water.inputLabel')}
              value={waterTargetInput}
              onChangeText={setWaterTargetInput}
              keyboardType="numeric"
              placeholder={t('dashboard.water.inputPlaceholder', {
                defaultValue: dashboardFallbacks.inputPlaceholder,
              })}
              helperText={t('dashboard.water.inputHelper', {
                defaultValue: dashboardFallbacks.inputHelper,
              })}
              errorMessage={waterTargetError ?? undefined}
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                label={t('common.cancel')}
                variant="secondary"
                onPress={closeWaterTargetModal}
              />
              <PrimaryButton
                label={t('dashboard.water.save')}
                isLoading={isSavingWaterTarget}
                onPress={() => {
                  void saveWaterTarget();
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function getDashboardFallbacks(language: string) {
  const fallbackMap = {
    tr: {
      waterAdded: (label: string) => `${label} eklendi`,
      waterAddFailed: 'Su eklenemedi. Lütfen tekrar dene.',
      targetInvalid: 'Lütfen geçerli bir ml değeri gir.',
      targetRange: 'Günlük su hedefi 1000 ile 6000 ml arasında olmalı.',
      targetUpdateFailed: 'Su hedefi güncellenemedi.',
      quickGlass: '+1 Bardak',
      quickLargeGlass: '+300 ml',
      quickBottle: '+500 ml',
      dietDayBadge: 'DİYET GÖRÜŞ GÜNÜ',
      dietDayTitle: 'Yeni planını oluştur, akışı tamamla',
      dietDaySubtitle: 'Kilo bilgisini güncelleyip yeni diyet planını tek akışta ekle.',
      activePlan: 'Aktif Plan',
      mealUnit: 'öğün',
      noActivePlan: 'Henüz aktif plan yok',
      latestWeight: 'Son Kilo',
      latestWeightHint: 'En güncel ölçüm',
      noWeight: 'Henüz kilo kaydı yok',
      inputPlaceholder: 'Örn. 2500',
      inputHelper: 'Önerilen aralık: 1000 - 6000 ml',
      motivation0: 'Başlamak en zor adımdı. Devam et.',
      motivation25: 'İyi gidiyorsun. Ritmin oturmaya başladı.',
      motivation50: 'Yolun yarısından fazlasını tamamladın.',
      motivation75: 'Hedefe çok yaklaştın. Biraz daha.',
      motivation100: 'Hedef tamamlandı. Bugün harika gidiyorsun.',
    },
    en: {
      waterAdded: (label: string) => `${label} added`,
      waterAddFailed: "Couldn't add water. Try again.",
      targetInvalid: 'Please enter a valid ml amount.',
      targetRange: 'Daily water goal must be between 1000 and 6000 ml.',
      targetUpdateFailed: "Couldn't update the water goal.",
      quickGlass: '+1 Glass',
      quickLargeGlass: '+300 ml',
      quickBottle: '+500 ml',
      dietDayBadge: 'DIET REVIEW DAY',
      dietDayTitle: 'Create your new plan and complete the flow',
      dietDaySubtitle: 'Update your weight and add your new diet plan in one smooth flow.',
      activePlan: 'Active Plan',
      mealUnit: 'meals',
      noActivePlan: 'No active plan yet',
      latestWeight: 'Latest Weight',
      latestWeightHint: 'Most recent log',
      noWeight: 'No weight log yet',
      inputPlaceholder: 'E.g. 2500',
      inputHelper: 'Recommended range: 1000 - 6000 ml',
      motivation0: 'Starting was the hardest part. Keep going.',
      motivation25: "You're doing well. Your rhythm is settling in.",
      motivation50: "You're past the halfway point.",
      motivation75: "You're very close. Just a little more.",
      motivation100: 'Goal complete. Today looks excellent.',
    },
    de: {
      waterAdded: (label: string) => `${label} hinzugefügt`,
      waterAddFailed: 'Wasser konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
      targetInvalid: 'Bitte gib einen gültigen ml-Wert ein.',
      targetRange: 'Das Wasserziel muss zwischen 1000 und 6000 ml liegen.',
      targetUpdateFailed: 'Das Wasserziel konnte nicht aktualisiert werden.',
      quickGlass: '+1 Glas',
      quickLargeGlass: '+300 ml',
      quickBottle: '+500 ml',
      dietDayBadge: 'TAG DER ERNÄHRUNGSBERATUNG',
      dietDayTitle: 'Erstelle deinen neuen Plan und schließe den Ablauf ab',
      dietDaySubtitle:
        'Aktualisiere dein Gewicht und füge deinen neuen Ernährungsplan in einem klaren Ablauf hinzu.',
      activePlan: 'Aktiver Plan',
      mealUnit: 'Mahlzeiten',
      noActivePlan: 'Noch kein aktiver Plan',
      latestWeight: 'Letztes Gewicht',
      latestWeightHint: 'Neuester Eintrag',
      noWeight: 'Noch kein Gewichtseintrag',
      inputPlaceholder: 'Z. B. 2500',
      inputHelper: 'Empfohlener Bereich: 1000 - 6000 ml',
      motivation0: 'Der Anfang war der schwerste Teil. Bleib dran.',
      motivation25: 'Es läuft gut. Dein Rhythmus findet sich.',
      motivation50: 'Mehr als die Hälfte ist geschafft.',
      motivation75: 'Du bist ganz nah dran. Nur noch ein wenig.',
      motivation100: 'Ziel erreicht. Heute läuft es perfekt.',
    },
    ar: {
      waterAdded: (label: string) => `تمت إضافة ${label}`,
      waterAddFailed: 'تعذرت إضافة الماء. حاول مرة أخرى.',
      targetInvalid: 'يرجى إدخال قيمة مل صحيحة.',
      targetRange: 'يجب أن يكون هدف الماء بين 1000 و6000 مل.',
      targetUpdateFailed: 'تعذر تحديث هدف الماء.',
      quickGlass: '+1 كوب',
      quickLargeGlass: '+300 مل',
      quickBottle: '+500 مل',
      dietDayBadge: 'يوم مراجعة النظام الغذائي',
      dietDayTitle: 'أنشئ خطتك الجديدة وأكمل التدفق',
      dietDaySubtitle: 'حدّث وزنك وأضف خطتك الغذائية الجديدة ضمن تدفق واحد واضح.',
      activePlan: 'الخطة النشطة',
      mealUnit: 'وجبة',
      noActivePlan: 'لا توجد خطة نشطة بعد',
      latestWeight: 'آخر وزن',
      latestWeightHint: 'أحدث تسجيل',
      noWeight: 'لا يوجد تسجيل وزن بعد',
      inputPlaceholder: 'مثال: 2500',
      inputHelper: 'النطاق المقترح: 1000 - 6000 مل',
      motivation0: 'البداية كانت أصعب خطوة. استمر.',
      motivation25: 'أنت تسير بشكل جيد. الإيقاع بدأ يتكوّن.',
      motivation50: 'لقد تجاوزت نصف الطريق.',
      motivation75: 'أنت قريب جدًا. خطوة أخيرة فقط.',
      motivation100: 'اكتمل الهدف. يومك ممتاز.',
    },
  } as const;

  return fallbackMap[language as keyof typeof fallbackMap] ?? fallbackMap.tr;
}

function getWaterMotivationMessage(
  t: (key: string, options?: { defaultValue?: string }) => string,
  progress: number,
  fallbacks: ReturnType<typeof getDashboardFallbacks>
): string {
  if (progress >= 100) {
    return t('dashboard.water.motivation.100', {
      defaultValue: fallbacks.motivation100,
    });
  }
  if (progress >= 75) {
    return t('dashboard.water.motivation.75', {
      defaultValue: fallbacks.motivation75,
    });
  }
  if (progress >= 50) {
    return t('dashboard.water.motivation.50', {
      defaultValue: fallbacks.motivation50,
    });
  }
  if (progress >= 25) {
    return t('dashboard.water.motivation.25', {
      defaultValue: fallbacks.motivation25,
    });
  }
  return t('dashboard.water.motivation.0', {
    defaultValue: fallbacks.motivation0,
  });
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  headerPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  headerPillText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: typography.pageTitle,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pageSubtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.helper,
    lineHeight: 18,
  },
  error: {
    marginBottom: spacing.md,
    color: colors.danger,
    fontSize: typography.caption,
  },
  heroCard: {
    overflow: 'hidden',
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderColor: 'rgba(124, 131, 255, 0.14)',
  },
  heroGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceElevated,
  },
  heroGradientBand: {
    position: 'absolute',
    top: -8,
    left: -18,
    right: -18,
    height: '54%',
    backgroundColor: 'rgba(124, 131, 255, 0.18)',
    borderRadius: radius.xl,
  },
  heroGradientOrb: {
    position: 'absolute',
    right: -36,
    top: -28,
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: 'rgba(91, 87, 232, 0.17)',
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -56,
    right: -18,
    width: 188,
    height: 188,
    borderRadius: 80,
    backgroundColor: colors.primarySoft,
    opacity: 0.95,
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.9,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl2,
  },
  heroEyebrow: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroMiniButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroMiniButtonText: {
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: '700',
  },
  heroMetric: {
    color: colors.textPrimary,
    fontSize: typography.heroMetric,
    lineHeight: 52,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  heroMetricSub: {
    color: colors.textMuted,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  heroHelper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl2,
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  heroMotivation: {
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: typography.helper,
    lineHeight: 18,
    fontWeight: '700',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  heroMetaCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.82)',
    padding: spacing.md,
  },
  heroMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroMetaLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  heroMetaValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: '800',
  },
  metaEditButton: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(91, 87, 232, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  metaEditButtonText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  waterQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  waterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  waterChipText: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: '800',
  },
  waterFeedback: {
    marginTop: spacing.md,
    color: colors.success,
    fontSize: typography.helper,
    fontWeight: '700',
  },
  dietDayCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    padding: spacing.xl2,
    marginBottom: spacing.lg,
  },
  dietDayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dietDayBadge: {
    color: colors.onPrimary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    opacity: 0.92,
  },
  dietDayArrow: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  dietDayTitle: {
    color: colors.onPrimary,
    fontSize: typography.title,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  dietDaySubtitle: {
    marginTop: spacing.sm,
    color: colors.onPrimary,
    opacity: 0.9,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryCardTwoColumn: {
    width: '48%',
  },
  summaryCardThreeColumn: {
    width: '31%',
  },
  summaryCardSpacing: {
    marginRight: spacing.sm,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryMetric: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.cardMetric,
    fontWeight: '800',
    letterSpacing: -1,
  },
  summaryUnit: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  summaryText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 19,
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
  },
  progressBadge: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: '800',
  },
  progressMetric: {
    color: colors.textPrimary,
    fontSize: typography.cardMetric,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  progressSubtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  progressMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressMetaItem: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
  },
  progressMetaLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  progressMetaValue: {
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: '800',
  },
  progressEmpty: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  actionCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.xl2,
    marginBottom: spacing.sm,
  },
  actionCardTwoColumn: {
    width: '48%',
  },
  actionCardThreeColumn: {
    width: '31%',
  },
  actionCardSpacing: {
    marginRight: spacing.sm,
  },
  actionBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(91, 87, 232, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconFallback: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallbackDotLarge: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.primary,
  },
  iconFallbackDotSmall: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryGlow,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  actionHint: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.helper,
    lineHeight: 18,
    minHeight: 36,
  },
  actionArrow: {
    marginTop: spacing.xl,
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: '800',
  },
  logoutCard: {
    marginBottom: spacing.md,
  },
  logoutTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  logoutSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.97,
    transform: [{ scale: 0.978 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
