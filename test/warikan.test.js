import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, calc } from '../src/warikan.js';

// --- calc: 要件の数値例 ---

test('calc: 10000円・3人・100円・切り上げ → 3400', () => {
  const result = calc(10000, 3, 100, 'ceil');
  assert.equal(result.perPerson, 3400);
  assert.equal(result.collected, 10200);
  assert.equal(result.diff, 200);
});

test('calc: 10000円・3人・1円・切り捨て → 3333', () => {
  const result = calc(10000, 3, 1, 'floor');
  assert.equal(result.perPerson, 3333);
  assert.equal(result.collected, 9999);
  assert.equal(result.diff, -1);
});

test('calc: 10000円・4人 → 2500(割り切れる/ぴったり)', () => {
  const result = calc(10000, 4, 100, 'ceil');
  assert.equal(result.perPerson, 2500);
  assert.equal(result.collected, 10000);
  assert.equal(result.diff, 0);
});

// --- validate: 優先順位(empty > invalid > valid) ---

test('validate: 両方空 → empty', () => {
  assert.deepEqual(validate('', ''), { state: 'empty' });
});

test('validate: 金額のみ空 → empty', () => {
  assert.deepEqual(validate('', '4'), { state: 'empty' });
});

test('validate: 人数のみ空 → empty', () => {
  assert.deepEqual(validate('10000', ''), { state: 'empty' });
});

test('validate: 空白のみ → empty', () => {
  assert.deepEqual(validate('  ', '4'), { state: 'empty' });
});

test('validate: 金額が不正でも人数が空なら empty(優先順位)', () => {
  assert.deepEqual(validate('abc', ''), { state: 'empty' });
});

test('validate: 両方有効 → valid', () => {
  assert.deepEqual(validate('10000', '4'), { state: 'valid', total: 10000, people: 4 });
});

// --- validate: invalid(値ありだが不正) ---

test('validate: 金額0 → invalid(total)', () => {
  assert.deepEqual(validate('0', '4'), { state: 'invalid', errors: ['total'] });
});

test('validate: 金額が負数 → invalid(total)', () => {
  assert.deepEqual(validate('-100', '4'), { state: 'invalid', errors: ['total'] });
});

test('validate: 金額が非整数 → invalid(total)', () => {
  assert.deepEqual(validate('3.5', '4'), { state: 'invalid', errors: ['total'] });
});

test('validate: 金額が数値でない文字列 → invalid(total)', () => {
  assert.deepEqual(validate('abc', '4'), { state: 'invalid', errors: ['total'] });
});

test('validate: 人数1(下限未満) → invalid(people)', () => {
  assert.deepEqual(validate('10000', '1'), { state: 'invalid', errors: ['people'] });
});

test('validate: 人数0 → invalid(people)', () => {
  assert.deepEqual(validate('10000', '0'), { state: 'invalid', errors: ['people'] });
});

test('validate: 人数が非整数 → invalid(people)', () => {
  assert.deepEqual(validate('10000', '2.5'), { state: 'invalid', errors: ['people'] });
});

test('validate: 金額・人数とも不正 → invalid(両方, total優先順)', () => {
  assert.deepEqual(validate('abc', '1'), { state: 'invalid', errors: ['total', 'people'] });
});

// --- validate: 境界値 ---

test('validate: 金額下限1・人数下限2 → valid', () => {
  assert.deepEqual(validate('1', '2'), { state: 'valid', total: 1, people: 2 });
});

test('validate: 金額上限9999999・人数上限99 → valid', () => {
  assert.deepEqual(validate('9999999', '99'), { state: 'valid', total: 9999999, people: 99 });
});

test('validate: 金額が上限+1(10000000) → invalid(total)', () => {
  assert.deepEqual(validate('10000000', '99'), { state: 'invalid', errors: ['total'] });
});

test('validate: 人数が上限+1(100) → invalid(people)', () => {
  assert.deepEqual(validate('9999999', '100'), { state: 'invalid', errors: ['people'] });
});
