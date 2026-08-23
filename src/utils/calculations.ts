export function compoundProjection(initial: number, monthly: number, annualRate: number, years: number) {
  const rate = annualRate / 100 / 12
  let value = initial
  const data = [{ year: 0, value: Math.round(initial), invested: Math.round(initial) }]
  for (let month = 1; month <= years * 12; month++) {
    value = value * (1 + rate) + monthly
    if (month % 12 === 0) data.push({ year: month / 12, value: Math.round(value), invested: Math.round(initial + monthly * month) })
  }
  return data
}

export function loanCalculation(principal: number, annualRate: number, years: number) {
  const months = Math.max(1, years * 12)
  const rate = annualRate / 100 / 12
  const payment = rate === 0 ? principal / months : principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
  let balance = principal
  const schedule: { year: number; principal: number; interest: number; balance: number }[] = []
  for (let year = 1; year <= years; year++) {
    let yearInterest = 0; let yearPrincipal = 0
    for (let m = 0; m < 12 && balance > 0; m++) {
      const interest = balance * rate
      const principalPart = Math.min(balance, payment - interest)
      balance -= principalPart; yearInterest += interest; yearPrincipal += principalPart
    }
    schedule.push({ year, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.max(0, Math.round(balance)) })
  }
  return { payment, total: payment * months, interest: payment * months - principal, schedule }
}
