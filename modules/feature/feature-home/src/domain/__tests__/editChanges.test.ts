import {
  NO_CHANGES,
  countChanges,
  currentCount,
  isCountChanged,
  isRemoved,
  setCount,
  toRequests,
  toggleRemoval,
  withUpdatedCounts,
  withoutCounts,
  withoutProducts,
} from '../editChanges';
import { buildProduct } from './fixtures';

const milk = buildProduct({ id: 'milk', quantity: { count: 2 } });
const rice = buildProduct({ id: 'rice', quantity: { count: 1 } });

describe('setCount', () => {
  it('records a count different from the saved one', () => {
    const changes = setCount(NO_CHANGES, milk, 5);

    expect(currentCount(changes, milk)).toBe(5);
    expect(isCountChanged(changes, 'milk')).toBe(true);
  });

  it('forgets the change when the count goes back to the saved one', () => {
    const changed = setCount(NO_CHANGES, milk, 5);

    const changes = setCount(changed, milk, 2);

    expect(isCountChanged(changes, 'milk')).toBe(false);
    expect(countChanges(changes)).toBe(0);
  });

  it('allows zero but never goes below it', () => {
    expect(currentCount(setCount(NO_CHANGES, milk, 0), milk)).toBe(0);
    expect(currentCount(setCount(NO_CHANGES, milk, -3), milk)).toBe(0);
  });

  it('keeps whole packages only', () => {
    expect(currentCount(setCount(NO_CHANGES, milk, 3.7), milk)).toBe(3);
  });

  it('does not touch the other products', () => {
    const changes = setCount(setCount(NO_CHANGES, milk, 5), rice, 4);

    expect(currentCount(changes, milk)).toBe(5);
    expect(currentCount(changes, rice)).toBe(4);
  });
});

describe('currentCount', () => {
  it('is the saved count when nothing changed', () => {
    expect(currentCount(NO_CHANGES, milk)).toBe(2);
  });
});

describe('toggleRemoval', () => {
  it('marks a product and unmarks it on the second call', () => {
    const marked = toggleRemoval(NO_CHANGES, 'milk');
    expect(isRemoved(marked, 'milk')).toBe(true);

    expect(isRemoved(toggleRemoval(marked, 'milk'), 'milk')).toBe(false);
  });
});

describe('countChanges', () => {
  it('counts changed counts and removals together', () => {
    const changes = toggleRemoval(setCount(NO_CHANGES, milk, 1), 'rice');

    expect(countChanges(changes)).toBe(2);
  });

  it('counts a removed product with a changed count once', () => {
    const changes = toggleRemoval(setCount(NO_CHANGES, milk, 1), 'milk');

    expect(countChanges(changes)).toBe(1);
  });
});

describe('toRequests', () => {
  it('asks to update the changed counts and remove the marked products', () => {
    const changes = toggleRemoval(setCount(NO_CHANGES, milk, 1), 'rice');

    expect(toRequests(changes)).toEqual({
      updates: [{ productId: 'milk', count: 1 }],
      removedIds: ['rice'],
    });
  });

  it('does not update a product that is going to be removed', () => {
    const changes = toggleRemoval(setCount(NO_CHANGES, milk, 1), 'milk');

    expect(toRequests(changes)).toEqual({
      updates: [],
      removedIds: ['milk'],
    });
  });
});

describe('withoutCounts', () => {
  it('drops only the counts that were saved', () => {
    const changes = setCount(setCount(NO_CHANGES, milk, 1), rice, 4);

    const remaining = withoutCounts(changes, [{ productId: 'milk', count: 1 }]);

    expect(isCountChanged(remaining, 'milk')).toBe(false);
    expect(isCountChanged(remaining, 'rice')).toBe(true);
  });
});

describe('withUpdatedCounts', () => {
  it('changes the count and keeps the packaging and content', () => {
    const content = { size: 1, unit: 'l' } as const;
    const bottled = buildProduct({
      id: 'milk',
      quantity: { count: 2, packaging: 'bottle', content },
    });

    expect(
      withUpdatedCounts([bottled, rice], [{ productId: 'milk', count: 7 }])
    ).toEqual([
      { ...bottled, quantity: { count: 7, packaging: 'bottle', content } },
      rice,
    ]);
  });
});

describe('withoutProducts', () => {
  it('removes the listed products', () => {
    expect(withoutProducts([milk, rice], ['milk'])).toEqual([rice]);
  });
});
