import { MONTH_NAMES } from "../../services/consts/calendarConsts";

export const pad = (value) => String(value).padStart(2, "0");
export const parseDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};
export const getDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};
export const addMonths = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
};
export const getMonday = (date) => {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  nextDate.setDate(nextDate.getDate() + (day === 0 ? -6 : 1 - day));
  return nextDate;
};
export const getSunday = (date) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() - nextDate.getDay());
  return nextDate;
};
export const formatMonthTitle = (date) => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
export const isSameDate = (firstDate, secondDate) => getDateKey(firstDate) === getDateKey(secondDate);
export const normalizeText = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
