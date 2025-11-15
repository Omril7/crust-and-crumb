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

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatNumber = (num, fixed = 2) => {
  return num
    ? Number(num).toLocaleString('he-IL', { minimumFractionDigits: fixed, maximumFractionDigits: fixed })
    : Number('0').toLocaleString('he-IL', { minimumFractionDigits: fixed, maximumFractionDigits: fixed });
};

export const getWeightText = (weight) => {
  const doughWeight = weight >= 1000 ? weight / 1000 : weight;
  const isGrams = weight < 1000;

  return `${formatNumber(doughWeight, isGrams ? 1 : 3)} ${isGrams ? "גרם" : 'ק"ג'}`
};

export const retry = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn(); // success → return
    } catch (err) {
      console.warn(`Attempt ${attempt} failed:`, err);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay)); // wait before retry
      } else {
        console.error(`All ${retries} retries failed for ${fn.name}`);
        throw err;
      }
    }
  }
};
