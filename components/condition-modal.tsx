import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import {
  ConditionLevel,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  ConditionColors,
} from '@/lib/types';
import { formatDateJapanese } from '@/lib/calendar-utils';
import { useColors } from '@/hooks/use-colors';

interface ConditionModalProps {
  visible: boolean;
  dateString: string;
  currentCondition?: ConditionLevel;
  conditionColors: ConditionColors;
  onSelect: (condition: ConditionLevel) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const CONDITION_LEVELS: ConditionLevel[] = [5, 4, 3, 2, 1];

export function ConditionModal({
  visible,
  dateString,
  currentCondition,
  conditionColors,
  onSelect,
  onClose,
  onDelete,
}: ConditionModalProps) {
  const colors = useColors();

  const getColorForLevel = (level: ConditionLevel): string => {
    const colorKey = `level${level}` as keyof ConditionColors;
    return conditionColors[colorKey];
  };

  const handleSelect = (level: ConditionLevel) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(level);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onDelete?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modal, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>
            体調を記録
          </Text>
          <Text style={[styles.date, { color: colors.muted }]}>
            {formatDateJapanese(dateString)}
          </Text>

          <View style={styles.options}>
            {CONDITION_LEVELS.map((level) => {
              const isSelected = currentCondition === level;
              const bgColor = getColorForLevel(level);
              
              return (
                <Pressable
                  key={level}
                  onPress={() => handleSelect(level)}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: bgColor },
                    isSelected && styles.optionSelected,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <Text style={styles.emoji}>{CONDITION_EMOJIS[level]}</Text>
                  <Text style={styles.label}>{CONDITION_LABELS[level]}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttons}>
            {currentCondition && onDelete && (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.deleteButton,
                  { borderColor: colors.error },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.deleteText, { color: colors.error }]}>
                  記録を削除
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                { backgroundColor: colors.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.muted }]}>
                キャンセル
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  optionSelected: {
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttons: {
    marginTop: 20,
    gap: 10,
  },
  deleteButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
