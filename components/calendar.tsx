import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CalendarDay,
  getCalendarDays,
  getMonthName,
  getWeekdayNames,
} from '@/lib/calendar-utils';
import { ConditionLevel, ConditionColors, UNRECORDED_COLOR } from '@/lib/types';

interface CalendarProps {
  year: number;
  month: number;
  records: Record<string, ConditionLevel>;
  conditionColors: ConditionColors;
  onDayPress: (dateString: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSettingsPress: () => void;
}

export function Calendar({
  year,
  month,
  records,
  conditionColors,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onSettingsPress,
}: CalendarProps) {
  const colors = useColors();
  const days = getCalendarDays(year, month);
  const weekdays = getWeekdayNames();

  const getColorForCondition = (condition?: ConditionLevel): string => {
    if (!condition) return UNRECORDED_COLOR;
    const colorKey = `level${condition}` as keyof ConditionColors;
    return conditionColors[colorKey];
  };

  const handleDayPress = (day: CalendarDay) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDayPress(day.dateString);
  };

  const handleNavPress = (callback: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => handleNavPress(onPrevMonth)}
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.monthTitle, { color: colors.foreground }]}>
          {year}年 {getMonthName(month)}
        </Text>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => handleNavPress(onNextMonth)}
            style={({ pressed }) => [
              styles.navButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={onSettingsPress}
            style={({ pressed }) => [
              styles.navButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="gearshape.fill" size={24} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Header */}
      <View style={styles.weekdayRow}>
        {weekdays.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                { color: index === 0 ? '#EF4444' : index === 6 ? '#3B82F6' : colors.muted },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {days.map((day, index) => {
          const condition = records[day.dateString];
          const bgColor = getColorForCondition(condition);
          const dayOfWeek = index % 7;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <Pressable
              key={`${day.dateString}-${index}`}
              onPress={() => handleDayPress(day)}
              style={({ pressed }) => [
                styles.dayCell,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.dayInner,
                  { backgroundColor: bgColor },
                  day.isToday && styles.todayBorder,
                  !day.isCurrentMonth && styles.otherMonth,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                    day.isToday && styles.todayText,
                    isSunday && day.isCurrentMonth && styles.sundayText,
                    isSaturday && day.isCurrentMonth && styles.saturdayText,
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: conditionColors.level5 }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>良い</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: conditionColors.level3 }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>普通</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: conditionColors.level1 }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>悪い</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: UNRECORDED_COLOR }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>未記録</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayInner: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  otherMonth: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  otherMonthText: {
    color: '#94A3B8',
  },
  todayText: {
    fontWeight: '800',
  },
  sundayText: {
    color: '#DC2626',
  },
  saturdayText: {
    color: '#2563EB',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
