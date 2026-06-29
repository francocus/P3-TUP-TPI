const normalizeText = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status).replace(/\s+/g, "-");
  if (normalizedStatus === "confirmado") return "is-confirmed";
  if (normalizedStatus === "pendiente") return "is-pending";
  if (normalizedStatus === "cancelado") return "is-cancelled";
  if (["finalizado", "completado"].includes(normalizedStatus)) return "is-finished";
  return "";
};
