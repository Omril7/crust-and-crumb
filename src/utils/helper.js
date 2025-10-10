export const parseDate = (dateString) => {
  const date = new Date(dateString);

  const pad = (num) => String(num).padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // RTL-friendly string
  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
};

export const formatNumber = (num) => {
  return num
    ? Number(num).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
};