import DateRange from '../DateRange';

describe('DateRange value object', () => {
  test('constructs valid range and computes durations', () => {
    const start = new Date('2025-01-01T00:00:00Z');
    const end = new Date('2025-01-05T00:00:00Z');
    const dr = new DateRange(start, end);
    expect(dr.getDurationInDays()).toBe(4);
    expect(dr.getDurationInHours()).toBe(96);
    expect(dr.contains(new Date('2025-01-03T00:00:00Z'))).toBe(true);
  });

  test('throws when start is not before end or invalid types', () => {
    expect(() => new DateRange('a', new Date())).toThrow();
    const s = new Date('2025-01-05');
    const e = new Date('2025-01-01');
    expect(() => new DateRange(s, e)).toThrow('La date de début doit être antérieure à la date de fin');
  });

  test('overlaps, isAdjacent, extend and equals behavior', () => {
    const a1 = new DateRange(new Date('2025-01-01'), new Date('2025-01-05'));
    const a2 = new DateRange(new Date('2025-01-04'), new Date('2025-01-08'));
    expect(a1.overlaps(a2)).toBe(true);
    const extended = a1.extend(a2);
    expect(extended.startDate.getTime()).toBe(a1.startDate.getTime());
    expect(extended.endDate.getTime()).toBe(a2.endDate.getTime());

    const b1 = new DateRange(new Date('2025-02-01'), new Date('2025-02-03'));
    const b2 = new DateRange(new Date('2025-02-04'), new Date('2025-02-06'));
    // adjacent by one day
    expect(b1.isAdjacent(b2)).toBe(true);

    const c1 = new DateRange(new Date('2025-03-01'), new Date('2025-03-10'));
    const c2 = new DateRange(new Date('2025-03-01'), new Date('2025-03-10'));
    expect(c1.equals(c2)).toBe(true);
  });

  test('toJSON returns ISO dates and durations', () => {
    const s = new Date('2025-04-01T00:00:00Z');
    const e = new Date('2025-04-03T00:00:00Z');
    const dr = new DateRange(s, e);
    const json = dr.toJSON();
    expect(json.startDate).toBe(s.toISOString());
    expect(json.endDate).toBe(e.toISOString());
    expect(json.durationInDays).toBe(2);
  });

  test('rejects ranges longer than maximum allowed (90 days)', () => {
    const start = new Date();
    const end = new Date(start.getTime() + (91 * 24 * 60 * 60 * 1000));
    expect(() => new DateRange(start, end)).toThrow(/90/);
  });
});
