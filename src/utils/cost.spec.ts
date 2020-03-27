import { displayTierCost } from './cost';

describe('displayTierCost', () => {
  it('very cheap', () => {
    expect(displayTierCost(8000, 'email')).toBe('$0.08 / 10k emails');
  });

  it('somewhat cheap', () => {
    expect(displayTierCost(800000, 'email')).toBe('$0.08 / 100 emails');
  });

  it('expensive', () => {
    expect(displayTierCost(800000000, 'email')).toBe('$0.80 / email');
  });

  it('precise', () => {
    expect(displayTierCost(1303000, 'email')).toBe('$13.03 / 10k emails');
  });

  it('seconds', () => {
    expect(displayTierCost(360000, 'second')).toBe('$1.30 / hour');
  });
});
