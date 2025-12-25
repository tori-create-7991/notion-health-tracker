import { ConditionLevel } from './types';

const NOTION_API_BASE = 'https://api.notion.com/v1';

interface NotionPage {
  id: string;
  properties: {
    Date?: {
      date?: {
        start?: string;
      };
    };
    Condition?: {
      number?: number;
    };
  };
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

/**
 * Notion APIとの通信を行うサービス
 */
export class NotionService {
  private apiKey: string;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.apiKey = apiKey;
    this.databaseId = databaseId;
  }

  /**
   * API接続をテスト
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${NOTION_API_BASE}/databases/${this.databaseId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return { success: true };
      }

      const error = await response.json();
      return {
        success: false,
        error: error.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '接続に失敗しました',
      };
    }
  }

  /**
   * 指定された月の体調記録を取得
   */
  async getRecordsForMonth(
    year: number,
    month: number
  ): Promise<Record<string, ConditionLevel>> {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    try {
      const response = await fetch(`${NOTION_API_BASE}/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          filter: {
            and: [
              {
                property: 'Date',
                date: {
                  on_or_after: startDate,
                },
              },
              {
                property: 'Date',
                date: {
                  on_or_before: endDateStr,
                },
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to fetch records:', await response.text());
        return {};
      }

      const data: NotionQueryResponse = await response.json();
      const records: Record<string, ConditionLevel> = {};

      for (const page of data.results) {
        const date = page.properties.Date?.date?.start;
        const condition = page.properties.Condition?.number;

        if (date && condition && condition >= 1 && condition <= 5) {
          records[date] = condition as ConditionLevel;
        }
      }

      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
      return {};
    }
  }

  /**
   * 全ての体調記録を取得
   */
  async getAllRecords(): Promise<Record<string, ConditionLevel>> {
    try {
      let allRecords: Record<string, ConditionLevel> = {};
      let hasMore = true;
      let nextCursor: string | null = null;

      while (hasMore) {
        const body: any = {};
        if (nextCursor) {
          body.start_cursor = nextCursor;
        }

        const response = await fetch(`${NOTION_API_BASE}/databases/${this.databaseId}/query`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error('Failed to fetch all records:', await response.text());
          break;
        }

        const data: NotionQueryResponse = await response.json();

        for (const page of data.results) {
          const date = page.properties.Date?.date?.start;
          const condition = page.properties.Condition?.number;

          if (date && condition && condition >= 1 && condition <= 5) {
            allRecords[date] = condition as ConditionLevel;
          }
        }

        hasMore = data.has_more;
        nextCursor = data.next_cursor;
      }

      return allRecords;
    } catch (error) {
      console.error('Error fetching all records:', error);
      return {};
    }
  }

  /**
   * 体調記録を保存（既存の場合は更新）
   */
  async saveRecord(date: string, condition: ConditionLevel): Promise<boolean> {
    try {
      // まず既存のレコードを検索
      const existingPageId = await this.findPageByDate(date);

      if (existingPageId) {
        // 既存のレコードを更新
        return await this.updateRecord(existingPageId, condition);
      } else {
        // 新規レコードを作成
        return await this.createRecord(date, condition);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      return false;
    }
  }

  /**
   * 体調記録を削除
   */
  async deleteRecord(date: string): Promise<boolean> {
    try {
      const pageId = await this.findPageByDate(date);
      if (!pageId) {
        return true; // 既に存在しない
      }

      const response = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          archived: true,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }

  /**
   * 日付でページを検索
   */
  private async findPageByDate(date: string): Promise<string | null> {
    try {
      const response = await fetch(`${NOTION_API_BASE}/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          filter: {
            property: 'Date',
            date: {
              equals: date,
            },
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data: NotionQueryResponse = await response.json();
      return data.results.length > 0 ? data.results[0].id : null;
    } catch (error) {
      console.error('Error finding page:', error);
      return null;
    }
  }

  /**
   * 新規レコードを作成
   */
  private async createRecord(date: string, condition: ConditionLevel): Promise<boolean> {
    try {
      const response = await fetch(`${NOTION_API_BASE}/pages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          parent: { database_id: this.databaseId },
          properties: {
            Date: {
              date: { start: date },
            },
            Condition: {
              number: condition,
            },
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating record:', error);
      return false;
    }
  }

  /**
   * 既存レコードを更新
   */
  private async updateRecord(pageId: string, condition: ConditionLevel): Promise<boolean> {
    try {
      const response = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          properties: {
            Condition: {
              number: condition,
            },
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating record:', error);
      return false;
    }
  }

  /**
   * APIリクエストヘッダーを取得
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };
  }
}

/**
 * NotionServiceのインスタンスを作成
 */
export function createNotionService(apiKey: string, databaseId: string): NotionService | null {
  if (!apiKey || !databaseId) {
    return null;
  }
  return new NotionService(apiKey, databaseId);
}
