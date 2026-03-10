import { describe, it, expect } from 'vitest';
import {
  mean,
  median,
  groupByGender,
  determineReferenceGroup,
  calculateGroupStats,
  calculateReport,
  salaryToHourlyRate,
  type Employee,
  type GenderCode,
} from '../pay-gap-engine';

// ── Helper to create test employees ──────────────────────────────

function makeEmployee(overrides: Partial<Employee> & { genderCode: GenderCode }): Employee {
  return {
    hoursWorked: 1950,
    hourlyRate: 30,
    overtimeHours: 0,
    overtimePay: 0,
    bonusPay: 0,
    specialSalary: 0,
    ...overrides,
  };
}

describe('mean', () => {
  it('returns 0 for empty array', () => expect(mean([])).toBe(0));
  it('returns single value', () => expect(mean([5])).toBe(5));
  it('averages correctly', () => expect(mean([10, 20, 30])).toBe(20));
});

describe('median', () => {
  it('returns 0 for empty array', () => expect(median([])).toBe(0));
  it('returns single value', () => expect(median([5])).toBe(5));
  it('handles odd length', () => expect(median([1, 5, 9])).toBe(5));
  it('handles even length', () => expect(median([1, 5, 9, 11])).toBe(7));
  it('sorts before finding median', () => expect(median([9, 1, 5])).toBe(5));
});

describe('groupByGender', () => {
  it('groups employees correctly', () => {
    const employees = [
      makeEmployee({ genderCode: 'M' }),
      makeEmployee({ genderCode: 'F' }),
      makeEmployee({ genderCode: 'M' }),
      makeEmployee({ genderCode: 'X' }),
    ];
    const groups = groupByGender(employees);
    expect(groups.M).toHaveLength(2);
    expect(groups.F).toHaveLength(1);
    expect(groups.X).toHaveLength(1);
    expect(groups.U).toHaveLength(0);
  });
});

describe('determineReferenceGroup', () => {
  it('picks largest group as reference', () => {
    const employees = [
      makeEmployee({ genderCode: 'F' }),
      makeEmployee({ genderCode: 'F' }),
      makeEmployee({ genderCode: 'F' }),
      makeEmployee({ genderCode: 'M' }),
    ];
    expect(determineReferenceGroup(employees)).toBe('F');
  });

  it('picks M when tied (first encountered with max)', () => {
    const employees = [
      makeEmployee({ genderCode: 'M' }),
      makeEmployee({ genderCode: 'F' }),
    ];
    // M is checked first, both have count 1, M wins
    expect(determineReferenceGroup(employees)).toBe('M');
  });
});

describe('calculateGroupStats', () => {
  it('returns zeros for empty group', () => {
    const stats = calculateGroupStats('X', [], 10);
    expect(stats.count).toBe(0);
    expect(stats.meanHourlyRate).toBe(0);
    expect(stats.pctReceivingBonus).toBe(0);
  });

  it('calculates stats correctly', () => {
    const members = [
      makeEmployee({ genderCode: 'F', hourlyRate: 25, bonusPay: 1000 }),
      makeEmployee({ genderCode: 'F', hourlyRate: 35, bonusPay: 0 }),
      makeEmployee({ genderCode: 'F', hourlyRate: 30, bonusPay: 2000 }),
    ];
    const stats = calculateGroupStats('F', members, 10);

    expect(stats.count).toBe(3);
    expect(stats.pctOfTotal).toBeCloseTo(0.3);
    expect(stats.meanHourlyRate).toBe(30);
    expect(stats.medianHourlyRate).toBe(30);
    expect(stats.meanBonusPay).toBeCloseTo(1000);
    expect(stats.pctReceivingBonus).toBeCloseTo(2 / 3);
  });

  it('calculates overtime participation', () => {
    const members = [
      makeEmployee({ genderCode: 'M', overtimePay: 500 }),
      makeEmployee({ genderCode: 'M', overtimePay: 0 }),
      makeEmployee({ genderCode: 'M', overtimePay: 300 }),
      makeEmployee({ genderCode: 'M', overtimePay: 0 }),
    ];
    const stats = calculateGroupStats('M', members, 4);
    expect(stats.pctReceivingOvertime).toBe(0.5);
  });
});

describe('calculateReport', () => {
  it('throws on empty employees', () => {
    expect(() => calculateReport({
      employerName: 'Test Corp',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      employees: [],
    })).toThrow('At least one employee record is required');
  });

  it('generates correct report for typical company', () => {
    const employees: Employee[] = [
      // 3 men: $35, $40, $45/hr
      makeEmployee({ genderCode: 'M', hourlyRate: 35, bonusPay: 5000, overtimePay: 1000 }),
      makeEmployee({ genderCode: 'M', hourlyRate: 40, bonusPay: 3000, overtimePay: 0 }),
      makeEmployee({ genderCode: 'M', hourlyRate: 45, bonusPay: 4000, overtimePay: 500 }),
      // 2 women: $30, $35/hr
      makeEmployee({ genderCode: 'F', hourlyRate: 30, bonusPay: 2000, overtimePay: 0 }),
      makeEmployee({ genderCode: 'F', hourlyRate: 35, bonusPay: 1000, overtimePay: 200 }),
    ];

    const report = calculateReport({
      employerName: 'Test Corp',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      employees,
    });

    expect(report.headcount).toBe(5);
    expect(report.referenceGroup).toBe('M');
    expect(report.employerName).toBe('Test Corp');

    // Gender distribution
    const mStats = report.genderDistribution.find(g => g.code === 'M')!;
    const fStats = report.genderDistribution.find(g => g.code === 'F')!;

    expect(mStats.count).toBe(3);
    expect(mStats.pctOfTotal).toBeCloseTo(0.6);
    expect(mStats.meanHourlyRate).toBe(40); // (35+40+45)/3
    expect(mStats.medianHourlyRate).toBe(40);

    expect(fStats.count).toBe(2);
    expect(fStats.meanHourlyRate).toBe(32.5); // (30+35)/2

    // Gaps (F vs M reference)
    expect(report.gaps).toHaveLength(1);
    const fGap = report.gaps[0];
    expect(fGap.comparedTo).toBe('M');

    // Mean hourly rate gap: (40 - 32.5) / 40 = 0.1875
    expect(fGap.meanHourlyRateGap).toBeCloseTo(0.1875);

    // Median hourly rate gap: (40 - 32.5) / 40 = 0.1875
    expect(fGap.medianHourlyRateGap).toBeCloseTo(0.1875);

    // Mean bonus gap: (4000 - 1500) / 4000 = 0.625
    expect(fGap.meanBonusPayGap).toBeCloseTo(0.625);
  });

  it('handles multiple gender categories', () => {
    const employees = [
      makeEmployee({ genderCode: 'M', hourlyRate: 40 }),
      makeEmployee({ genderCode: 'M', hourlyRate: 40 }),
      makeEmployee({ genderCode: 'F', hourlyRate: 35 }),
      makeEmployee({ genderCode: 'X', hourlyRate: 38 }),
    ];

    const report = calculateReport({
      employerName: 'Diverse Inc',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      employees,
    });

    expect(report.genderDistribution).toHaveLength(3); // M, F, X (no U)
    expect(report.gaps).toHaveLength(2); // F vs M, X vs M
  });

  it('handles all same gender', () => {
    const employees = [
      makeEmployee({ genderCode: 'F', hourlyRate: 30 }),
      makeEmployee({ genderCode: 'F', hourlyRate: 35 }),
    ];

    const report = calculateReport({
      employerName: 'All Women Corp',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      employees,
    });

    expect(report.referenceGroup).toBe('F');
    expect(report.gaps).toHaveLength(0); // no comparison groups
  });

  it('uses unknown (U) employees in calculations', () => {
    const employees = [
      makeEmployee({ genderCode: 'M', hourlyRate: 40 }),
      makeEmployee({ genderCode: 'M', hourlyRate: 40 }),
      makeEmployee({ genderCode: 'U', hourlyRate: 35 }),
    ];

    const report = calculateReport({
      employerName: 'Test',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      employees,
    });

    const uStats = report.genderDistribution.find(g => g.code === 'U');
    expect(uStats).toBeDefined();
    expect(uStats!.count).toBe(1);
    expect(report.headcount).toBe(3);
  });
});

describe('salaryToHourlyRate', () => {
  it('converts $78,000/yr to ~$40/hr', () => {
    expect(salaryToHourlyRate(78_000)).toBeCloseTo(40, 0);
  });

  it('uses 1,950 standard hours', () => {
    expect(salaryToHourlyRate(1_950)).toBe(1);
  });
});
