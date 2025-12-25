import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/hooks/use-storage';
import { useColors } from '@/hooks/use-colors';
import {
  ConditionColors,
  CONDITION_LABELS,
  ConditionLevel,
  DEFAULT_CONDITION_COLORS,
} from '@/lib/types';
import { createNotionService } from '@/lib/notion-service';

const COLOR_PRESETS = [
  '#F87171', '#FB923C', '#FACC15', '#A3E635', '#4ADE80',
  '#34D399', '#22D3EE', '#60A5FA', '#818CF8', '#A78BFA',
  '#F472B6', '#FB7185',
];

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { settings, saveSettings, loading } = useSettings();

  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [conditionColors, setConditionColors] = useState<ConditionColors>(DEFAULT_CONDITION_COLORS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingColor, setEditingColor] = useState<ConditionLevel | null>(null);

  useEffect(() => {
    if (!loading) {
      setApiKey(settings.notionApiKey);
      setDatabaseId(settings.notionDatabaseId);
      setConditionColors(settings.conditionColors);
    }
  }, [loading, settings]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleTestConnection = useCallback(async () => {
    if (!apiKey || !databaseId) {
      Alert.alert('エラー', 'API KeyとDatabase IDを入力してください');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setTesting(true);
    const service = createNotionService(apiKey, databaseId);
    
    if (!service) {
      setTesting(false);
      Alert.alert('エラー', '接続サービスの作成に失敗しました');
      return;
    }

    const result = await service.testConnection();
    setTesting(false);

    if (result.success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('接続成功', 'Notionデータベースに正常に接続できました');
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('接続失敗', result.error || '接続に失敗しました');
    }
  }, [apiKey, databaseId]);

  const handleSave = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSaving(true);
    const success = await saveSettings({
      notionApiKey: apiKey,
      notionDatabaseId: databaseId,
      conditionColors,
    });
    setSaving(false);

    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('保存完了', '設定を保存しました');
    } else {
      Alert.alert('エラー', '設定の保存に失敗しました');
    }
  }, [apiKey, databaseId, conditionColors, saveSettings]);

  const handleColorSelect = useCallback((level: ConditionLevel, color: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setConditionColors((prev) => ({
      ...prev,
      [`level${level}`]: color,
    }));
    setEditingColor(null);
  }, []);

  const handleResetColors = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setConditionColors(DEFAULT_CONDITION_COLORS);
  }, []);

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom', 'left', 'right']} className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>戻る</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>設定</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Notion Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Notion連携
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            Notionのインテグレーションを作成し、API KeyとDatabase IDを入力してください。{'\n'}
            データベースには「Date」（日付型）と「Condition」（数値型）のプロパティが必要です。
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="secret_xxxxx..."
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              Database ID
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              value={databaseId}
              onChangeText={setDatabaseId}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleTestConnection}
            disabled={testing || !apiKey || !databaseId}
            style={({ pressed }) => [
              styles.testButton,
              { borderColor: colors.primary },
              pressed && { opacity: 0.7 },
              (!apiKey || !databaseId) && { opacity: 0.5 },
            ]}
          >
            {testing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.testButtonText, { color: colors.primary }]}>
                接続テスト
              </Text>
            )}
          </Pressable>
        </View>

        {/* Color Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              カラー設定
            </Text>
            <Pressable
              onPress={handleResetColors}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Text style={[styles.resetText, { color: colors.primary }]}>
                リセット
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            各体調レベルの表示色をカスタマイズできます
          </Text>

          {([5, 4, 3, 2, 1] as ConditionLevel[]).map((level) => {
            const colorKey = `level${level}` as keyof ConditionColors;
            const currentColor = conditionColors[colorKey];
            const isEditing = editingColor === level;

            return (
              <View key={level} style={styles.colorRow}>
                <View style={styles.colorInfo}>
                  <View
                    style={[styles.colorPreview, { backgroundColor: currentColor }]}
                  />
                  <Text style={[styles.colorLabel, { color: colors.foreground }]}>
                    {CONDITION_LABELS[level]}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setEditingColor(isEditing ? null : level)}
                  style={({ pressed }) => [
                    styles.colorButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.colorButtonText, { color: colors.muted }]}>
                    {isEditing ? '閉じる' : '変更'}
                  </Text>
                </Pressable>
              </View>
            );
          })}

          {editingColor && (
            <View style={[styles.colorPicker, { backgroundColor: colors.surface }]}>
              <Text style={[styles.colorPickerTitle, { color: colors.foreground }]}>
                色を選択
              </Text>
              <View style={styles.colorGrid}>
                {COLOR_PRESETS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => handleColorSelect(editingColor, color)}
                    style={({ pressed }) => [
                      styles.colorOption,
                      { backgroundColor: color },
                      pressed && { transform: [{ scale: 0.9 }] },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            saving && { opacity: 0.6 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>設定を保存</Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  testButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  colorLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  colorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorPicker: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  colorPickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
