const TOTAL_MIN = 1;
const TOTAL_MAX = 9_999_999;
const PEOPLE_MIN = 2;
const PEOPLE_MAX = 99;

function isValidInt(raw, min, max) {
  if (!/^\d+$/.test(raw)) return false;
  const value = Number(raw);
  return value >= min && value <= max;
}

export function validate(totalRaw, peopleRaw) {
  const total = totalRaw.trim();
  const people = peopleRaw.trim();

  if (total === '' || people === '') {
    return { state: 'empty' };
  }

  const errors = [];
  if (!isValidInt(total, TOTAL_MIN, TOTAL_MAX)) errors.push('total');
  if (!isValidInt(people, PEOPLE_MIN, PEOPLE_MAX)) errors.push('people');

  if (errors.length > 0) {
    return { state: 'invalid', errors };
  }

  return { state: 'valid', total: Number(total), people: Number(people) };
}

export function calc(total, people, unit, direction) {
  const perPerson = (direction === 'ceil' ? Math.ceil : Math.floor)(total / (people * unit)) * unit;
  const collected = perPerson * people;
  const diff = collected - total;
  return { perPerson, collected, diff };
}
