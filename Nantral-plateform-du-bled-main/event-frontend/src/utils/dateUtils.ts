export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  });
};

export const isEventPast = (eventDate: string): boolean => {
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  return eventDateTime < now;
};

export const formatDateToInput = (dateString: string): { date: string; time: string } => {
  const dateTimeStr = dateString.replace("Z", "");
  const [dateStr, timeStr] = dateTimeStr.split("T");
  const timeOnly = timeStr ? timeStr.substring(0, 5) : "00:00";
  return { date: dateStr, time: timeOnly };
};
