import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { Calendar } from '@/components/calendar';
import { ConditionModal } from '@/components/condition-modal';
import { useSettings, useHealthRecords } from '@/hooks/use-storage';
import { ConditionLevel } from '@/lib/types';
import { useColors } from '@/hooks/use-colors';
import { createNotionService, NotionService } from '@/lib/notion-service';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { settings, loading: settingsLoading } = useSettings();
  const { records, saveRecord, deleteRecord, setRecordsFromNotion, loading: recordsLoading } = useHealthRecords();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const notionServiceRef = useRef<NotionService | null>(null);

  // Notion Serviceの初期化
  useEffect(() => {
    if (settings.notionApiKey && settings.notionDatabaseId) {
      notionServiceRef.current = createNotionService(
        settings.notionApiKey,
        settings.notionDatabaseId
      );
    } else {
      notionServiceRef.current = null;
    }
  }, [settings.notionApiKey, settings.notionDatabaseId]);

  // 画面フォーカス時にNotionからデータを同期
  useFocusEffect(
    useCallback(() => {
      if (notionServiceRef.current) {
        syncFromNotion();
      }
    }, [settings.notionApiKey, settings.notionDatabaseId])
  );

  const syncFromNotion = async () => {
    if (!notionServiceRef.current) return;

    setSyncing(true);
    try {
      const notionRecords = await notionServiceRef.current.getAllRecords();
      setRecordsFromNotion(notionRecords);
    } catch (error) {
      console.error('Failed to sync from Notion:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentYear, currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentYear, currentMonth]);

  const handleDayPress = useCallback((dateString: string) => {
    setSelectedDate(dateString);
    setModalVisible(true);
  }, []);

  const handleConditionSelect = useCallback(async (condition: ConditionLevel) => {
    if (!selectedDate) return;

    // ローカルに保存
    await saveRecord(selectedDate, condition);
    setModalVisible(false);

    // Notionにも保存
    if (notionServiceRef.current) {
      const success = await notionServiceRef.current.saveRecord(selectedDate, condition);
      if (!success) {
        Alert.alert(
          '同期エラー',
          'Notionへの保存に失敗しました。ローカルには保存されています。',
          [{ text: 'OK' }]
        );
      }
    }
  }, [selectedDate, saveRecord]);

  const handleDeleteRecord = useCallback(async () => {
    if (!selectedDate) return;

    // ローカルから削除
    await deleteRecord(selectedDate);
    setModalVisible(false);

    // Notionからも削除
    if (notionServiceRef.current) {
      const success = await notionServiceRef.current.deleteRecord(selectedDate);
      if (!success) {
        Alert.alert(
          '同期エラー',
          'Notionからの削除に失敗しました。',
          [{ text: 'OK' }]
        );
      }
    }
  }, [selectedDate, deleteRecord]);

  const handleSettingsPress = useCallback(() => {
    router.push('/settings' as any);
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  if (settingsLoading || recordsLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 12 }}>読み込み中...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-2">
      <View className="flex-1">
        {syncing && (
          <View className="absolute top-0 left-0 right-0 z-10 items-center py-2">
            <View className="flex-row items-center bg-primary/10 px-4 py-2 rounded-full">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.primary, marginLeft: 8, fontSize: 12 }}>
                Notionと同期中...
              </Text>
            </View>
          </View>
        )}
        <Calendar
          year={currentYear}
          month={currentMonth}
          records={records}
          conditionColors={settings.conditionColors}
          onDayPress={handleDayPress}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSettingsPress={handleSettingsPress}
        />
      </View>

      <ConditionModal
        visible={modalVisible}
        dateString={selectedDate || ''}
        currentCondition={selectedDate ? records[selectedDate] : undefined}
        conditionColors={settings.conditionColors}
        onSelect={handleConditionSelect}
        onClose={handleCloseModal}
        onDelete={selectedDate && records[selectedDate] ? handleDeleteRecord : undefined}
      />
    </ScreenContainer>
  );
}
