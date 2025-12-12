export const formatTimestamp = (timestamp: number) => {
  const d = new Date(timestamp);

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  const formatted = `${month}-${day}-${year} ${hour}:${minute}`;

  return formatted;
};

export function avg(arr: number[]) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
