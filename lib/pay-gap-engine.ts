/**
 * BC Pay Transparency Report — Calculation Engine
 * Per BC Pay Transparency Act (SBC 2023, c.18)
 *
 * Reference: paytransparency.fin.gov.bc.ca
 * All monetary values in CAD.
 */

export type GenderCode = 'M' | 'F' | 'X' | 'U';

export interface Employee {
  genderCode: GenderCode;
  hoursWorked: number;       // total hours in reporting period
  hourlyRate: number;        // regular hourly rate (or annualSalary / 1950)
  overtimeHours: number;     // overtime hours in period
  overtimePay: number;       // total OT pay ($)
  bonusPay: number;          // total bonus pay ($)
  specialSalary: number;     // stock, commission, other comp ($)
}

export interface GenderGroupStats {
  code: GenderCode;
  count: number;
  pctOfTotal: number;
  meanHourlyRate: number;
  medianHourlyRate: number;
  meanOvertimePay: number;
  medianOvertimePay: number;
  meanBonusPay: number;
  medianBonusPay: number;
  pctReceivingOvertime: number;
  pctReceivingBonus: number;
}

export interface GapMetrics {
  comparedTo: GenderCode;       // reference group
  meanHourlyRateGap: number;    // (ref - group) / ref
  medianHourlyRateGap: number;
  meanOvertimePayGap: number;
  medianOvertimePayGap: number;
  meanBonusPayGap: number;
  medianBonusPayGap: number;
}

export interface PayTransparencyReport {
  employerName: string;
  reportingPeriod: string;       // e.g. "January 1, 2025 – December 31, 2025"
  headcount: number;
  referenceGroup: GenderCode;
  genderDistribution: GenderGroupStats[];
  gaps: GapMetrics[];
  generatedAt: string;
}

export interface ReportInput {
  employerName: string;
  reportingPeriodStart: string;  // ISO date
  reportingPeriodEnd: string;
  employees: Employee[];
}

// ── Helpers ──────────────────────────────────────────────────────

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function gap(refValue: number, groupValue: number): number {
  if (refValue === 0) return 0;
  return (refValue - groupValue) / refValue;
}

// ── Core calculations ────────────────────────────────────────────

export function groupByGender(employees: Employee[]): Record<GenderCode, Employee[]> {
  const groups: Record<GenderCode, Employee[]> = { M: [], F: [], X: [], U: [] };
  for (const emp of employees) {
    groups[emp.genderCode].push(emp);
  }
  return groups;
}

/**
 * Reference group: the gender category with the most employees.
 * BC guidance: typically men (M), but use the largest group.
 */
export function determineReferenceGroup(employees: Employee[]): GenderCode {
  const groups = groupByGender(employees);
  let maxCode: GenderCode = 'M';
  let maxCount = 0;
  for (const [code, members] of Object.entries(groups) as [GenderCode, Employee[]][]) {
    if (members.length > maxCount) {
      maxCount = members.length;
      maxCode = code;
    }
  }
  return maxCode;
}

export function calculateGroupStats(code: GenderCode, members: Employee[], totalCount: number): GenderGroupStats {
  if (members.length === 0) {
    return {
      code,
      count: 0,
      pctOfTotal: 0,
      meanHourlyRate: 0,
      medianHourlyRate: 0,
      meanOvertimePay: 0,
      medianOvertimePay: 0,
      meanBonusPay: 0,
      medianBonusPay: 0,
      pctReceivingOvertime: 0,
      pctReceivingBonus: 0,
    };
  }

  const hourlyRates = members.map(e => e.hourlyRate);
  const overtimePays = members.map(e => e.overtimePay);
  const bonusPays = members.map(e => e.bonusPay);

  return {
    code,
    count: members.length,
    pctOfTotal: pct(members.length, totalCount),
    meanHourlyRate: mean(hourlyRates),
    medianHourlyRate: median(hourlyRates),
    meanOvertimePay: mean(overtimePays),
    medianOvertimePay: median(overtimePays),
    meanBonusPay: mean(bonusPays),
    medianBonusPay: median(bonusPays),
    pctReceivingOvertime: pct(members.filter(e => e.overtimePay > 0).length, members.length),
    pctReceivingBonus: pct(members.filter(e => e.bonusPay > 0).length, members.length),
  };
}

// ── Main report calculation ──────────────────────────────────────

export function calculateReport(input: ReportInput): PayTransparencyReport {
  const { employees, employerName, reportingPeriodStart, reportingPeriodEnd } = input;

  if (employees.length === 0) {
    throw new Error('At least one employee record is required');
  }

  const referenceGroup = determineReferenceGroup(employees);
  const groups = groupByGender(employees);
  const totalCount = employees.length;

  // Calculate stats for each gender group
  const genderDistribution: GenderGroupStats[] = (['M', 'F', 'X', 'U'] as GenderCode[])
    .map(code => calculateGroupStats(code, groups[code], totalCount))
    .filter(stats => stats.count > 0);

  // Calculate gaps vs reference group
  const refStats = genderDistribution.find(s => s.code === referenceGroup)!;
  const gaps: GapMetrics[] = genderDistribution
    .filter(s => s.code !== referenceGroup)
    .map(groupStats => ({
      comparedTo: referenceGroup,
      meanHourlyRateGap: gap(refStats.meanHourlyRate, groupStats.meanHourlyRate),
      medianHourlyRateGap: gap(refStats.medianHourlyRate, groupStats.medianHourlyRate),
      meanOvertimePayGap: gap(refStats.meanOvertimePay, groupStats.meanOvertimePay),
      medianOvertimePayGap: gap(refStats.medianOvertimePay, groupStats.medianOvertimePay),
      meanBonusPayGap: gap(refStats.meanBonusPay, groupStats.meanBonusPay),
      medianBonusPayGap: gap(refStats.medianBonusPay, groupStats.medianBonusPay),
    }));

  const startDate = new Date(reportingPeriodStart);
  const endDate = new Date(reportingPeriodEnd);

  return {
    employerName,
    reportingPeriod: `${startDate.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    headcount: totalCount,
    referenceGroup,
    genderDistribution,
    gaps,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Convert annual salary to hourly rate using 1,950 standard hours.
 * Per BC guidance for salaried employees.
 */
export function salaryToHourlyRate(annualSalary: number): number {
  return annualSalary / 1950;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(amount);
}
