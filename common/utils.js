export function getDisplayDay(day) {
  const strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return strDays[day];
}

export function getDisplayMonth(month) {
  const strMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return strMonths[month];
}

// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}
