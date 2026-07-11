/*--A soft gradient changes with the time of day to create a subtle glow behind the weather icon. It acts as a 
dynamic sky accent while keeping the main background clean and mostly white/slate, without overpowering the design.--*/

export function skyGradient(unixSeconds, tzOffsetSeconds) {
  const localHour = new Date(
    (unixSeconds + tzOffsetSeconds) * 1000,
  ).getUTCHours();

  if (localHour >= 5 && localHour < 7) {
    return "linear-gradient(135deg, #fcd34d, #f472b6, #60a5fa)"; // dawn
  }
  if (localHour >= 7 && localHour < 17) {
    return "linear-gradient(135deg, #60a5fa, #38bdf8)"; // day
  }
  if (localHour >= 17 && localHour < 19) {
    return "linear-gradient(135deg, #f97316, #f472b6, #818cf8)"; // dusk
  }
  return "linear-gradient(135deg, #1e293b, #0f172a)"; // night
}
