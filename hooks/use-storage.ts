import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  HealthRecord,
  DEFAULT_SETTINGS,
  ConditionLevel,
} from '@/lib/types';

const SETTINGS_KEY = '@health_tracker_settings';
const RECORDS_KEY = '@health_tracker_records';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setSettings(updated);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }, [settings]);

  return { settings, saveSettings, loading };
}

export function useHealthRecords() {
  const [records, setRecords] = useState<Record<string, ConditionLevel>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECORDS_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = useCallback(async (date: string, condition: ConditionLevel) => {
    try {
      const updated = { ...records, [date]: condition };
      await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
      setRecords(updated);
      return true;
    } catch (error) {
      console.error('Failed to save record:', error);
      return false;
    }
  }, [records]);

  const deleteRecord = useCallback(async (date: string) => {
    try {
      const updated = { ...records };
      delete updated[date];
      await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
      setRecords(updated);
      return true;
    } catch (error) {
      console.error('Failed to delete record:', error);
      return false;
    }
  }, [records]);

  const getCondition = useCallback((date: string): ConditionLevel | undefined => {
    return records[date];
  }, [records]);

  const setRecordsFromNotion = useCallback((notionRecords: Record<string, ConditionLevel>) => {
    setRecords(notionRecords);
  }, []);

  return { records, saveRecord, deleteRecord, getCondition, setRecordsFromNotion, loading };
}
