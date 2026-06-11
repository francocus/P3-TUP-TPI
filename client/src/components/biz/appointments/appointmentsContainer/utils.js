export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
export const WEEK_DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const pad = (value) => String(value).padStart(2, "0");

export const parseDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

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
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
};

export const getSunday = (date) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() - nextDate.getDay());
  return nextDate;
};

export const formatMonthTitle = (date) =>
  `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

export const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getAppointmentDate = (appointment) => parseDate(appointment.date);

export const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status).replace(/\s+/g, "-");
  switch (normalizedStatus) {
    case "confirmado": return "is-confirmed";
    case "pendiente": return "is-pending";
    case "cancelado":
    case "canceled": return "is-cancelled";
    case "finalizado":
    case "completado": return "is-finished";
    default: return "";
  }
};

export const getAppointmentAccent = (appointment) => {
  const normalizedStatus = normalizeText(appointment.status);
  if (normalizedStatus === "pendiente") return "is-warning";
  if (normalizedStatus === "cancelado") return "is-danger";
  if (normalizedStatus === "finalizado" || normalizedStatus === "completado") return "is-muted";
  return "is-primary";
};

export const getAppointmentMinutes = (appointment) => {
  const [hours, minutes] = appointment.time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isSameDate = (firstDate, secondDate) =>
  getDateKey(firstDate) === getDateKey(secondDate);