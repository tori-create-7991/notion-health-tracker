// 体調レベル（1-5）
export type ConditionLevel = 1 | 2 | 3 | 4 | 5;

// 体調記録
export interface HealthRecord {
  date: string; // YYYY-MM-DD
  condition: ConditionLevel;
}

// 体調カラー設定
export interface ConditionColors {
  level1: string; // とても悪い
  level2: string; // 悪い
  level3: string; // 普通
  level4: string; // 良い
  level5: string; // とても良い
}

// アプリ設定
export interface AppSettings {
  notionApiKey: string;
  notionDatabaseId: string;
  conditionColors: ConditionColors;
}

// デフォルトの体調カラー
export const DEFAULT_CONDITION_COLORS: ConditionColors = {
  level1: '#F87171', // 赤 - とても悪い
  level2: '#FB923C', // オレンジ - 悪い
  level3: '#FACC15', // 黄 - 普通
  level4: '#A3E635', // 黄緑 - 良い
  level5: '#4ADE80', // 緑 - とても良い
};

// 体調レベルのラベル
export const CONDITION_LABELS: Record<ConditionLevel, string> = {
  1: 'とても悪い',
  2: '悪い',
  3: '普通',
  4: '良い',
  5: 'とても良い',
};

// 体調レベルの絵文字
export const CONDITION_EMOJIS: Record<ConditionLevel, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
};

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  notionApiKey: '',
  notionDatabaseId: '',
  conditionColors: DEFAULT_CONDITION_COLORS,
};

// 未記録の色
export const UNRECORDED_COLOR = '#E2E8F0';
