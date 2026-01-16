function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function formatDateRange(start, end) {
  const formatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric"
  };
  return `${start.toLocaleDateString("en-US", formatOptions)} - ${end.toLocaleDateString("en-US", formatOptions)}`;
}
function getDateRange(days) {
  const end = /* @__PURE__ */ new Date();
  const start = /* @__PURE__ */ new Date();
  {
    start.setDate(start.getDate() - days);
  }
  return { start, end };
}
export {
  formatCurrency as a,
  formatDate as b,
  formatDateRange as f,
  getDateRange as g
};
