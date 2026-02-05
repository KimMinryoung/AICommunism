/**
 * 턴당 자원 시뮬레이션 함수
 * 정책 효과 합산, 기본 경제, 안정도 피드백 루프
 */
const policies = require('./policies');

/**
 * 시뮬레이션 틱 실행 - 매 턴 자원 변화 계산
 * @param {object} resources - 현재 자원 상태
 * @param {string[]} activePolicies - 활성 정책 ID 배열
 * @returns {object} { newResources, report } - 새 자원 상태 + 변화량 보고서
 */
function simulateTurn(resources, activePolicies) {
  const report = {};
  const prev = { ...resources };

  // 1. 기본 경제 (매 턴 기본 수입/지출)
  applyDelta(resources, report, 'usd', 50); // 기본 세수
  applyDelta(resources, report, 'food', -10); // 기본 식량 소비
  applyDelta(resources, report, 'oil', 5); // 기본 석유 생산
  applyDelta(resources, report, 'ores', 3); // 기본 광물 채굴
  applyDelta(resources, report, 'powerConsumption', 1); // 전력 소비 자연 증가

  // 2. 활성 정책 효과 합산
  for (const policyId of activePolicies) {
    const policy = policies[policyId];
    if (!policy) continue;

    // 매 턴 유지비
    if (policy.upkeep) {
      for (const [resource, amount] of Object.entries(policy.upkeep)) {
        applyDelta(resources, report, resource, amount);
      }
    }

    // 매 턴 효과
    if (policy.effects) {
      for (const [resource, amount] of Object.entries(policy.effects)) {
        applyDelta(resources, report, resource, amount);
      }
    }
  }

  // 3. 안정도 피드백 루프
  // 전력 위기
  if (resources.powerSupply < resources.powerConsumption) {
    applyDelta(resources, report, 'socialStability', -5);
    applyDelta(resources, report, 'publicMorale', -3);
  }

  // 식량 부족
  if (resources.food < 30) {
    applyDelta(resources, report, 'socialStability', -3);
    applyDelta(resources, report, 'publicMorale', -5);
  }

  // 평등 지수 피드백
  if (resources.equalityIndex < 0.2) {
    applyDelta(resources, report, 'socialStability', -2);
  } else if (resources.equalityIndex > 0.7) {
    applyDelta(resources, report, 'socialStability', 1);
    applyDelta(resources, report, 'publicMorale', 1);
  }

  // 당 충성도 피드백
  if (resources.partyLoyalty < 20) {
    applyDelta(resources, report, 'socialStability', -2);
  }

  // 사기 피드백
  if (resources.publicMorale < 20) {
    applyDelta(resources, report, 'socialStability', -1);
    applyDelta(resources, report, 'gdpGrowth', -1);
  } else if (resources.publicMorale > 70) {
    applyDelta(resources, report, 'gdpGrowth', 1);
  }

  // GDP 성장 → 실질 수입 반영
  if (resources.gdpGrowth > 0) {
    const bonusIncome = Math.floor(resources.gdpGrowth * 2);
    applyDelta(resources, report, 'usd', bonusIncome);
  }

  // 4. 시간 진행
  resources.currentTurn += 1;
  resources.currentMonth += 1;
  if (resources.currentMonth > 12) {
    resources.currentMonth = 1;
    resources.currentYear += 1;
  }

  // 5. 자원 클램핑
  clampResources(resources);

  return { newResources: resources, report };
}

function applyDelta(resources, report, resource, amount) {
  if (!report[resource]) report[resource] = 0;
  resources[resource] = (resources[resource] || 0) + amount;
  report[resource] += amount;
}

function clampResources(resources) {
  // 0 이상 제한
  const nonNegative = ['usd', 'oil', 'ores', 'food', 'electronics', 'powerSupply'];
  for (const r of nonNegative) {
    resources[r] = Math.max(0, resources[r] || 0);
  }

  // 0~100 범위
  const percent = ['diplomacy', 'socialStability', 'publicMorale', 'education', 'healthcare', 'militaryStrength', 'partyLoyalty', 'aiAutonomy', 'gdpGrowth'];
  for (const r of percent) {
    resources[r] = Math.max(0, Math.min(100, resources[r] || 0));
  }

  // 0~1 범위
  resources.equalityIndex = Math.max(0, Math.min(1, resources.equalityIndex || 0));

  // powerConsumption은 음수 불가
  resources.powerConsumption = Math.max(0, resources.powerConsumption || 0);
}

module.exports = { simulateTurn, clampResources };
