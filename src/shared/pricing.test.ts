import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlanPrice,
  calculateCartTotals,
  calculatePromoDiscount,
  validateCheckoutForm,
  computeExpiryDate,
  formatINR,
  type PromoCode,
} from './pricing';

test('calculatePlanPrice applies duration discounts and access multipliers', () => {
  const plan = { sharedMonthlyInr: 200, privateMonthlyInr: 500 };
  assert.equal(calculatePlanPrice(plan, '1m', 'shared'), 200);
  assert.equal(calculatePlanPrice(plan, '3m', 'shared'), 550);
  assert.equal(calculatePlanPrice(plan, '6m', 'shared'), 1020);
  assert.equal(calculatePlanPrice(plan, '12m', 'shared'), 1800);
  assert.equal(calculatePlanPrice(plan, '1m', 'private'), 500);
  assert.equal(calculatePlanPrice(plan, '12m', 'private'), 4500);
});

test('calculatePromoDiscount respects minOrderInr and active flag', () => {
  const percentPromo: PromoCode = {
    code: 'INSANE10',
    description: '10% off',
    discountType: 'percent',
    value: 10,
    minOrderInr: 0,
    active: true,
  };
  const flatPromo: PromoCode = {
    code: 'WELCOME50',
    description: '50 off 299+',
    discountType: 'flat',
    value: 50,
    minOrderInr: 299,
    active: true,
  };
  const inactivePromo: PromoCode = {
    ...percentPromo,
    active: false,
  };

  assert.equal(calculatePromoDiscount(1000, percentPromo), 100);
  assert.equal(calculatePromoDiscount(250, flatPromo), 0);
  assert.equal(calculatePromoDiscount(300, flatPromo), 50);
  assert.equal(calculatePromoDiscount(1000, inactivePromo), 0);
});

test('calculateCartTotals computes itemCount, subtotal, discount, and total', () => {
  const promo: PromoCode = {
    code: 'INSANE10',
    description: '10% off',
    discountType: 'percent',
    value: 10,
    minOrderInr: 0,
    active: true,
  };
  const totals = calculateCartTotals(
    [
      { unitPriceInr: 179, quantity: 2 },
      { unitPriceInr: 499, quantity: 1 },
    ],
    promo
  );
  assert.equal(totals.itemCount, 3);
  assert.equal(totals.subtotalInr, 857);
  assert.equal(totals.discountInr, 86);
  assert.equal(totals.totalInr, 771);
});

test('validateCheckoutForm catches invalid name, email, and phone', () => {
  const invalid = validateCheckoutForm({
    customerName: 'A',
    customerEmail: 'bad-email',
    customerPhone: '12345',
    paymentMethod: 'UPI',
  });
  assert.ok(invalid.customerName);
  assert.ok(invalid.customerEmail);
  assert.ok(invalid.customerPhone);

  const valid = validateCheckoutForm({
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun@mrinsane.in',
    customerPhone: '+91 98765 43210',
    paymentMethod: 'UPI',
  });
  assert.deepEqual(valid, {});
});

test('computeExpiryDate adds exact duration months', () => {
  const expiry = computeExpiryDate('2026-01-15T10:00:00.000Z', '3m');
  assert.equal(expiry.slice(0, 10), '2026-04-15');
});

test('formatINR renders Indian rupee formatting cleanly', () => {
  assert.equal(formatINR(1499), '₹1,499');
  assert.equal(formatINR(179), '₹179');
});
