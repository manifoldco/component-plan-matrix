import { displayTierCost, displayLimit } from './cost';

describe('displayTierCost', () => {
  it('very cheap', () => {
    expect(displayTierCost(8000, 'email')).toBe('$0.08 / 10k emails');
  });

  it('somewhat cheap', () => {
    expect(displayTierCost(800000, 'email')).toBe('$0.80 / 1k emails');
  });

  it('expensive', () => {
    expect(displayTierCost(800000000, 'email')).toBe('$0.80 / email');
  });

  it('seconds', () => {
    expect(displayTierCost(360000, 'second')).toBe('$1.30 / hour');
  });
});

describe('displayLimit', () => {
  it('-1', () => {
    expect(displayLimit(-1, 'email')).toBe('∞');
  });

  it('200', () => {
    expect(displayLimit(200, 'email')).toBe('200');
  });

  it('seconds', () => {
    expect(displayLimit(3600, 'second')).toBe('1');
  });
});
