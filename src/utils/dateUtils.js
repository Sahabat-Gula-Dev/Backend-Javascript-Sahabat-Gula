export function nowPlusMinutes(m){
  return new Date(Date.now() + m * 60 * 1000);
}