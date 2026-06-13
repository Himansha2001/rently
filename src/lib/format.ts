export function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

export function formatLKRMonthly(amount: number): string {
  return `${formatLKR(amount)}/mo`
}
