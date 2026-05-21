# notion-health-tracker

React Native / Expo の体調記録アプリ。AsyncStorage（ローカル） + Notion API 直叩き（クラウド）の純クライアント構成。バックエンドなし。

## 同期仕様（重要）

- **片方向同期**: Notion → Local は読み取りのみ。Local → Notion の自動 push はない
- 体調レベルは「日付タップ → 体調選択」した瞬間にだけ Notion に POST される
- **設定保存「前」に記録したローカルデータは Notion に上がらない**。バルク push の仕組みは未実装

## Notion DB スキーマ

| プロパティ | タイプ | 用途 |
|----------|--------|------|
| `Date` | date | 日付（YYYY-MM-DD） |
| `Condition` | number | 体調レベル 1-5 |

プロパティ名は大文字小文字含めて完全一致が必要（`lib/notion-service.ts` でハードコード）。

## 主なディレクトリ

- `app/` — expo-router screens（`(tabs)/index.tsx` がカレンダー、`settings.tsx` が Notion 設定）
- `components/calendar.tsx`, `condition-modal.tsx` — コア UI
- `lib/notion-service.ts` — Notion REST API クライアント（SDK 不使用、fetch ベース）
- `hooks/use-storage.ts` — AsyncStorage hooks
