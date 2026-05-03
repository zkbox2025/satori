//lib/formatters/date.ts
//日付表示を整えるファイル


export function formatRelativeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  
  // 各単位での経過時間を計算
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 1分未満の場合
  if (diffMinutes < 1) {
    return "たった今";
  }

  // 1時間（60分）未満の場合
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }

  // 24時間未満の場合
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }

  // 30日未満の場合
  if (diffDays < 30) {
    return `${diffDays}日前`;
  }

  // 30日以上の場合は年月日（例: 2026/5/3）を表示
  return date.toLocaleDateString("ja-JP");
}
