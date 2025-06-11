import { format, isAfter, parse } from "date-fns";

// 문자열을 날짜로 파싱
export const parseDate = (dateStr: string) => {
  // "Jun 11, 2025" 형식의 날짜 파싱
  const parsed = parse(dateStr, "MMM d, yyyy", new Date());

  // 파싱이 실패한 경우 다른 형식들도 시도
  if (Number.isNaN(parsed.getTime())) {
    // "yyyy.MM.dd" 형식도 시도
    const altParsed = parse(dateStr, "yyyy.MM.dd", new Date());
    if (!Number.isNaN(altParsed.getTime())) {
      return altParsed;
    }
  }

  return parsed;
};

// 6월 이후인지 확인
export const isAfterJune = (date: Date) => {
  const juneStart = new Date(date.getFullYear(), 5, 1); // 6월은 0-index 기준 5
  return isAfter(date, juneStart) || date.getMonth() === 5;
};

// 날짜 포맷
export const formatToISO = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};
