import { validate, calc } from './warikan.js';

const totalInput = document.getElementById('total');
const peopleInput = document.getElementById('people');
const unitInputs = document.querySelectorAll('input[name="unit"]');
const directionInputs = document.querySelectorAll('input[name="direction"]');
const result = document.getElementById('result');

const ERROR_MESSAGES = {
  total: '合計金額は1〜9,999,999の整数で入力してください',
  people: '人数は2〜99の整数で入力してください',
};

function getChecked(inputs) {
  for (const input of inputs) {
    if (input.checked) return input.value;
  }
  return null;
}

function render() {
  const state = validate(totalInput.value, peopleInput.value);

  if (state.state === 'empty') {
    result.className = 'result empty';
    result.innerHTML = '<p>金額と人数を入れると結果が出ます</p>';
    return;
  }

  if (state.state === 'invalid') {
    result.className = 'result error';
    result.innerHTML = state.errors.map((key) => `<p>${ERROR_MESSAGES[key]}</p>`).join('');
    return;
  }

  const unit = Number(getChecked(unitInputs));
  const direction = getChecked(directionInputs);
  const { perPerson, collected, diff } = calc(state.total, state.people, unit, direction);

  let diffText;
  let diffClass;
  if (diff > 0) {
    diffText = `${diff.toLocaleString('ja-JP')}円余る`;
    diffClass = 'diff-plus';
  } else if (diff < 0) {
    diffText = `${Math.abs(diff).toLocaleString('ja-JP')}円足りない(幹事負担)`;
    diffClass = 'diff-minus';
  } else {
    diffText = 'ぴったり';
    diffClass = 'diff-zero';
  }

  result.className = 'result';
  result.innerHTML = `
    <div class="per-label">1人あたり</div>
    <div class="per-amount">${perPerson.toLocaleString('ja-JP')}円</div>
    <div class="sub"><span>集金合計</span><span>${collected.toLocaleString('ja-JP')}円</span></div>
    <div class="sub"><span>差額</span><span class="${diffClass}">${diffText}</span></div>
  `;
}

[totalInput, peopleInput, ...unitInputs, ...directionInputs].forEach((el) => {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
});

render();
