// カレンダー関連のユーティリティ関数

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
}

/**
 * 指定された月のカレンダーデータを生成
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();
  const todayString = formatDate(today);

  // 月の最初の日
  const firstDay = new Date(year, month, 1);
  // 月の最後の日
  const lastDay = new Date(year, month + 1, 0);

  // 最初の日の曜日（0 = 日曜日）
  const startDayOfWeek = firstDay.getDay();

  // 前月の日を追加
  const prevMonthLastDay = new Date(year, month, 0);
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: formatDate(date) === todayString,
      dateString: formatDate(date),
    });
  }

  // 当月の日を追加
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: formatDate(date) === todayString,
      dateString: formatDate(date),
    });
  }

  // 次月の日を追加（6週間分になるように）
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: formatDate(date) === todayString,
      dateString: formatDate(date),
    });
  }

  return days;
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 月名を取得（日本語）
 */
export function getMonthName(month: number): string {
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  return monthNames[month];
}

/**
 * 曜日名を取得（日本語・短縮形）
 */
export function getWeekdayNames(): string[] {
  return ['日', '月', '火', '水', '木', '金', '土'];
}

/**
 * 日付文字列をパース
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 日付を日本語でフォーマット
 */
export function formatDateJapanese(dateString: string): string {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}
