const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const formatDisplayDate = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const parseDisplayDateToIso = (value: string) => {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;

  const monthIndex = MONTHS.findIndex(month => month.toLowerCase() === match[1].toLowerCase());
  if (monthIndex < 0) return null;

  const year = Number(match[3]);
  const day = Number(match[2]);
  const date = new Date(Date.UTC(year, monthIndex, day));
  return date.toISOString().slice(0, 10);
};

export const normalizeTimeForDb = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;

  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}:00`;
};

export const formatDbTimeToDisplay = (value: string) => {
  const match = value.trim().match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return `${`${hour12}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')} ${period}`;
};

export const buildTimeSlot = (displayTime: string, minutesToAdd = 60) => {
  const normalized = normalizeTimeForDb(displayTime);
  if (!normalized) return `${displayTime} - ${displayTime}`;

  const [hours, minutes] = normalized.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const endHour24 = Math.floor((totalMinutes % (24 * 60)) / 60);
  const endMinute = totalMinutes % 60;
  const endDisplay = formatDbTimeToDisplay(`${`${endHour24}`.padStart(2, '0')}:${`${endMinute}`.padStart(2, '0')}:00`);

  return `${displayTime} - ${endDisplay}`;
};
