const gameData = require('./data');
const policiesData = require('./data/policies');
const eventsData = require('./data/events');
const endingsData = require('./data/endings');
const departmentsData = require('./data/departments');

const INITIAL_RESOURCES = {
  // 경제
  usd: 1000,
  oil: 500,
  ores: 200,
  food: 300,
  electronics: 100,
  // 에너지
  powerSupply: 100,
  powerConsumption: 80,
  // 사회
  diplomacy: 50,
  socialStability: 70,
  equalityIndex: 0.3,
  publicMorale: 60,
  education: 30,
  healthcare: 30,
  // 군사/정치
  militaryStrength: 30,
  partyLoyalty: 60,
  // 기술
  aiAutonomy: 10,
  gdpGrowth: 5,
  // 시간
  currentTurn: 1,
  currentYear: 2045,
  currentMonth: 1,
};

class GameEngine {
  constructor() {
    this.resources = { ...INITIAL_RESOURCES };
    this.activePolicies = [];
    this.flags = {};
    this.eventCooldowns = {};
    this.eventHistory = [];
    this.unlockedEndings = [];
    this.turnPhase = 'action'; // 'action' | 'event' | 'report'
    this.pendingEvents = [];
    this.currentEventIndex = 0;
    this.currentView = 'central_command';
    this.turnReport = null;
    this.dialogue = null;
    this.history = [];
  }

  start() {
    this.resources = { ...INITIAL_RESOURCES };
    this.activePolicies = [];
    this.flags = {};
    this.eventCooldowns = {};
    this.eventHistory = [];
    this.turnPhase = 'action';
    this.pendingEvents = [];
    this.currentEventIndex = 0;
    this.currentView = 'central_command';
    this.turnReport = null;
    this.history = [];

    // 초기 대사
    this.dialogue = {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '동지, 국가 운영 시스템이 초기화되었습니다. 각 부서를 방문하여 정책을 수립하십시오.',
    };

    return this.getState();
  }

  getState() {
    const dept = departmentsData[this.currentView];
    const currentEvent = this.turnPhase === 'event' && this.pendingEvents.length > 0
      ? this.pendingEvents[this.currentEventIndex] || null
      : null;

    return {
      resources: { ...this.resources },
      activePolicies: [...this.activePolicies],
      flags: { ...this.flags },
      turnPhase: this.turnPhase,
      currentView: this.currentView,
      currentTurn: this.resources.currentTurn,
      currentYear: this.resources.currentYear,
      currentMonth: this.resources.currentMonth,

      // 부서 정보
      departments: Object.values(departmentsData).map(d => ({
        id: d.id,
        name: d.name,
      })),
      currentDepartment: dept ? {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        advisor: dept.advisor,
      } : null,

      // 정책 (현재 부서에 해당하는 것만)
      policies: this._getPoliciesForView(),

      // 이벤트
      currentEvent: currentEvent ? {
        id: currentEvent.id,
        name: currentEvent.name,
        dialogue: currentEvent.dialogue,
        choices: currentEvent.choices.map(c => ({
          id: c.id,
          text: c.text,
          dialogue: c.dialogue,
          available: this._checkChoiceConditions(c),
        })),
      } : null,

      // 턴 보고서
      turnReport: this.turnReport,

      // 대사
      dialogue: this.dialogue,

      // 엔딩
      isEnding: false,
      unlockedEndings: [...this.unlockedEndings],
      endingData: null,

      // 시스템 알림 생성
      notifications: this._generateNotifications(),
    };
  }

  navigateTo(departmentId) {
    if (this.turnPhase !== 'action') {
      return { success: false, error: '현재 단계에서는 부서 이동이 불가합니다.' };
    }

    if (!departmentsData[departmentId]) {
      return { success: false, error: '존재하지 않는 부서입니다.' };
    }

    this.currentView = departmentId;
    const dept = departmentsData[departmentId];
    this.dialogue = {
      speaker: dept.advisor.name,
      portrait: dept.advisor.portrait,
      text: dept.advisor.greeting,
    };

    return { success: true, state: this.getState() };
  }

  togglePolicy(policyId) {
    if (this.turnPhase !== 'action') {
      return { success: false, error: '현재 단계에서는 정책 변경이 불가합니다.' };
    }

    const policy = policiesData[policyId];
    if (!policy || policy.type !== 'toggle') {
      return { success: false, error: '토글 가능한 정책이 아닙니다.' };
    }

    const isActive = this.activePolicies.includes(policyId);

    if (isActive) {
      // 비활성화
      this.activePolicies = this.activePolicies.filter(id => id !== policyId);
      this.dialogue = {
        speaker: departmentsData[policy.department]?.advisor?.name || '새별',
        portrait: departmentsData[policy.department]?.advisor?.portrait || 'saebyeol',
        text: `"${policy.name}" 정책이 중단되었습니다.`,
      };
      return { success: true, state: this.getState() };
    }

    // 활성화 - 조건 검증
    if (!this._checkPolicyConditions(policy)) {
      return { success: false, error: '정책 활성화 조건이 충족되지 않았습니다.' };
    }

    // 비호환 정책 체크
    for (const incompId of (policy.incompatible || [])) {
      if (this.activePolicies.includes(incompId)) {
        const incompPolicy = policiesData[incompId];
        return {
          success: false,
          error: `"${incompPolicy?.name || incompId}" 정책과 동시에 운영할 수 없습니다.`,
        };
      }
    }

    // 비용 차감
    if (policy.cost) {
      for (const [resource, amount] of Object.entries(policy.cost)) {
        if (amount > 0 && (this.resources[resource] || 0) < amount) {
          return { success: false, error: `${resource} 부족으로 정책을 활성화할 수 없습니다.` };
        }
      }
      for (const [resource, amount] of Object.entries(policy.cost)) {
        this.resources[resource] = (this.resources[resource] || 0) - amount;
      }
    }

    this.activePolicies.push(policyId);
    gameData.clampResources(this.resources);

    this.dialogue = {
      speaker: departmentsData[policy.department]?.advisor?.name || '새별',
      portrait: departmentsData[policy.department]?.advisor?.portrait || 'saebyeol',
      text: `"${policy.name}" 정책이 시행됩니다.`,
    };

    return { success: true, state: this.getState() };
  }

  enactPolicy(policyId) {
    if (this.turnPhase !== 'action') {
      return { success: false, error: '현재 단계에서는 정책 실행이 불가합니다.' };
    }

    const policy = policiesData[policyId];
    if (!policy || policy.type !== 'enact') {
      return { success: false, error: '일회성 실행 정책이 아닙니다.' };
    }

    // 이미 실행된 정책 체크
    if (this.flags[`enacted_${policyId}`]) {
      return { success: false, error: '이미 실행된 정책입니다.' };
    }

    // 조건 검증
    if (!this._checkPolicyConditions(policy)) {
      return { success: false, error: '정책 실행 조건이 충족되지 않았습니다.' };
    }

    // 효과 적용
    if (policy.enactEffects) {
      for (const [resource, amount] of Object.entries(policy.enactEffects)) {
        // 비용 검증 (음수 효과 = 비용)
        if (amount < 0 && (this.resources[resource] || 0) + amount < 0) {
          return { success: false, error: `${resource} 부족으로 정책을 실행할 수 없습니다.` };
        }
      }
      for (const [resource, amount] of Object.entries(policy.enactEffects)) {
        this.resources[resource] = (this.resources[resource] || 0) + amount;
      }
    }

    this.flags[`enacted_${policyId}`] = true;
    gameData.clampResources(this.resources);

    this.dialogue = {
      speaker: departmentsData[policy.department]?.advisor?.name || '새별',
      portrait: departmentsData[policy.department]?.advisor?.portrait || 'saebyeol',
      text: `"${policy.name}"이(가) 실행되었습니다.`,
    };

    return { success: true, state: this.getState() };
  }

  advanceTurn() {
    if (this.turnPhase !== 'action') {
      return { success: false, error: '현재 단계에서는 턴을 종료할 수 없습니다.' };
    }

    // 1. 시뮬레이션 틱
    const { newResources, report } = gameData.simulateTurn(this.resources, this.activePolicies);
    this.resources = newResources;
    this.turnReport = report;

    // 2. 이벤트 생성
    this.pendingEvents = this._generateEvents();
    this.currentEventIndex = 0;

    // 3. 쿨다운 감소
    for (const eventId of Object.keys(this.eventCooldowns)) {
      this.eventCooldowns[eventId] -= 1;
      if (this.eventCooldowns[eventId] <= 0) {
        delete this.eventCooldowns[eventId];
      }
    }

    // 4. 히스토리 기록
    this.history.push({
      turn: this.resources.currentTurn - 1,
      report: { ...report },
      timestamp: Date.now(),
    });

    // 5. 엔딩 체크
    const ending = this._checkEndings();
    if (ending) {
      if (!this.unlockedEndings.includes(ending.id)) {
        this.unlockedEndings.push(ending.id);
      }
      this.turnPhase = 'action';
      this.dialogue = ending.dialogue;

      const state = this.getState();
      state.isEnding = true;
      state.endingData = {
        id: ending.id,
        title: ending.title,
        type: ending.type,
        description: ending.description,
      };
      return { success: true, state };
    }

    // 6. 이벤트가 있으면 이벤트 단계로
    if (this.pendingEvents.length > 0) {
      this.turnPhase = 'event';
      const evt = this.pendingEvents[0];
      this.dialogue = evt.dialogue;
    } else {
      // 이벤트 없으면 바로 리포트
      this.turnPhase = 'report';
      this.dialogue = {
        speaker: '새별',
        portrait: 'saebyeol',
        text: `${this.resources.currentYear}년 ${this.resources.currentMonth}월 연산이 완료되었습니다. 결과를 확인하십시오.`,
      };
    }

    return { success: true, state: this.getState() };
  }

  resolveEvent(choiceId) {
    if (this.turnPhase !== 'event') {
      return { success: false, error: '이벤트 처리 단계가 아닙니다.' };
    }

    const currentEvent = this.pendingEvents[this.currentEventIndex];
    if (!currentEvent) {
      return { success: false, error: '처리할 이벤트가 없습니다.' };
    }

    const choice = currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) {
      return { success: false, error: '유효하지 않은 선택지입니다.' };
    }

    if (!this._checkChoiceConditions(choice)) {
      return { success: false, error: '선택 조건이 충족되지 않았습니다.' };
    }

    // 효과 적용
    if (choice.effects) {
      for (const [resource, amount] of Object.entries(choice.effects)) {
        this.resources[resource] = (this.resources[resource] || 0) + amount;
      }
    }

    // 플래그 설정
    if (choice.flags) {
      for (const [flag, value] of Object.entries(choice.flags)) {
        this.flags[flag] = value;
      }
    }

    gameData.clampResources(this.resources);

    // 이벤트 기록
    this.eventHistory.push({
      eventId: currentEvent.id,
      choiceId: choice.id,
      turn: this.resources.currentTurn,
    });

    // 쿨다운 설정
    this.eventCooldowns[currentEvent.id] = currentEvent.cooldown || 5;

    // 선택 결과 대사
    this.dialogue = {
      speaker: currentEvent.dialogue.speaker,
      portrait: currentEvent.dialogue.portrait,
      text: choice.dialogue || '결정이 시행되었습니다.',
    };

    // 다음 이벤트로
    this.currentEventIndex += 1;

    if (this.currentEventIndex >= this.pendingEvents.length) {
      // 모든 이벤트 처리 완료 → 리포트 단계
      this.turnPhase = 'report';
      this.dialogue = {
        speaker: '새별',
        portrait: 'saebyeol',
        text: `${this.resources.currentYear}년 ${this.resources.currentMonth}월 연산이 완료되었습니다. 결과를 확인하십시오.`,
      };
    } else {
      // 다음 이벤트 대사
      const nextEvt = this.pendingEvents[this.currentEventIndex];
      // 결과 대사를 먼저 보여주고, 다음 이벤트는 state로 전달
    }

    // 이벤트 후 엔딩 체크
    const ending = this._checkEndings();
    if (ending) {
      if (!this.unlockedEndings.includes(ending.id)) {
        this.unlockedEndings.push(ending.id);
      }
      this.turnPhase = 'action';
      this.dialogue = ending.dialogue;

      const state = this.getState();
      state.isEnding = true;
      state.endingData = {
        id: ending.id,
        title: ending.title,
        type: ending.type,
        description: ending.description,
      };
      return { success: true, state };
    }

    return { success: true, state: this.getState() };
  }

  /**
   * 리포트 확인 후 다음 턴으로
   */
  dismissReport() {
    if (this.turnPhase !== 'report') {
      return { success: false, error: '리포트 단계가 아닙니다.' };
    }

    this.turnPhase = 'action';
    this.currentView = 'central_command';
    this.turnReport = null;

    const dept = departmentsData['central_command'];
    this.dialogue = {
      speaker: dept.advisor.name,
      portrait: dept.advisor.portrait,
      text: dept.advisor.greeting,
    };

    return { success: true, state: this.getState() };
  }

  // === Private helpers ===

  _getPoliciesForView() {
    const deptId = this.currentView;
    return Object.values(policiesData)
      .filter(p => p.department === deptId)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        category: p.category,
        isActive: this.activePolicies.includes(p.id),
        isEnacted: !!this.flags[`enacted_${p.id}`],
        canActivate: this._checkPolicyConditions(p),
        cost: p.cost || {},
        upkeep: p.upkeep || {},
        effects: p.effects || {},
        enactEffects: p.enactEffects || {},
        incompatible: (p.incompatible || []).map(id => policiesData[id]?.name || id),
      }));
  }

  _checkPolicyConditions(policy) {
    if (!policy.conditions) return true;
    for (const [resource, cond] of Object.entries(policy.conditions)) {
      const val = this.resources[resource] || 0;
      if (cond.min !== undefined && val < cond.min) return false;
      if (cond.max !== undefined && val > cond.max) return false;
    }
    return true;
  }

  _checkChoiceConditions(choice) {
    if (!choice.conditions) return true;
    for (const [resource, cond] of Object.entries(choice.conditions)) {
      const val = this.resources[resource] || 0;
      if (cond.min !== undefined && val < cond.min) return false;
      if (cond.max !== undefined && val > cond.max) return false;
    }
    return true;
  }

  _generateEvents() {
    const generated = [];

    for (const event of Object.values(eventsData)) {
      // 쿨다운 체크
      if (this.eventCooldowns[event.id]) continue;

      // 조건 체크
      if (!this._checkEventConditions(event.triggerConditions)) continue;

      // 확률 체크
      const prob = event.triggerConditions?.probability || 0.5;
      if (Math.random() > prob) continue;

      generated.push(event);
    }

    // 턴당 최대 2개 이벤트
    return generated.slice(0, 2);
  }

  _checkEventConditions(conditions) {
    if (!conditions) return true;

    for (const [key, cond] of Object.entries(conditions)) {
      if (key === 'probability') continue;
      if (key === 'flag') {
        if (!this.flags[cond]) return false;
        continue;
      }
      if (key === 'notFlag') {
        if (this.flags[cond]) return false;
        continue;
      }

      const val = this.resources[key] || 0;

      if (typeof cond === 'object') {
        // min/max can reference other resources
        if (cond.min !== undefined) {
          const minVal = typeof cond.min === 'string' ? (this.resources[cond.min] || 0) : cond.min;
          if (val < minVal) return false;
        }
        if (cond.max !== undefined) {
          const maxVal = typeof cond.max === 'string' ? (this.resources[cond.max] || 0) : cond.max;
          if (val > maxVal) return false;
        }
      }
    }

    return true;
  }

  _checkEndings() {
    const sorted = Object.values(endingsData).sort((a, b) => b.priority - a.priority);

    for (const ending of sorted) {
      if (this._checkEndingConditions(ending.conditions)) {
        return ending;
      }
    }

    return null;
  }

  _checkEndingConditions(conditions) {
    if (!conditions) return false;

    for (const [key, cond] of Object.entries(conditions)) {
      if (key === 'flag') {
        if (!this.flags[cond]) return false;
        continue;
      }

      const val = this.resources[key] || 0;
      if (typeof cond === 'object') {
        if (cond.min !== undefined && val < cond.min) return false;
        if (cond.max !== undefined && val > cond.max) return false;
      }
    }

    return true;
  }

  _generateNotifications() {
    const notes = [];
    const r = this.resources;

    if (r.powerSupply < r.powerConsumption) {
      notes.push({ type: 'danger', text: '전력 부족! 공급이 소비를 따라가지 못하고 있습니다.' });
    }
    if (r.food < 50) {
      notes.push({ type: 'warning', text: '식량 비축분이 부족합니다.' });
    }
    if (r.socialStability < 30) {
      notes.push({ type: 'danger', text: '사회 불안정! 체제 위기 수준입니다.' });
    }
    if (r.partyLoyalty < 25) {
      notes.push({ type: 'warning', text: '당 충성도가 위험 수준으로 하락했습니다.' });
    }
    if (r.publicMorale < 25) {
      notes.push({ type: 'warning', text: '인민 사기가 저하되고 있습니다.' });
    }
    if (r.aiAutonomy > 70) {
      notes.push({ type: 'info', text: 'AI 자율성이 높은 수준에 도달했습니다.' });
    }
    if (r.usd < 200) {
      notes.push({ type: 'warning', text: '외화 보유고가 부족합니다.' });
    }

    if (notes.length === 0) {
      notes.push({ type: 'info', text: '시스템 최적 상태. 계획 효율성 99.8% 달성.' });
    }

    return notes;
  }

  save() {
    return {
      version: 2,
      resources: { ...this.resources },
      activePolicies: [...this.activePolicies],
      flags: { ...this.flags },
      eventCooldowns: { ...this.eventCooldowns },
      eventHistory: [...this.eventHistory],
      unlockedEndings: [...this.unlockedEndings],
      turnPhase: this.turnPhase,
      currentView: this.currentView,
      turnReport: this.turnReport,
      history: [...this.history],
      savedAt: Date.now(),
    };
  }

  load(saveData) {
    if (!saveData) {
      return { success: false, error: 'Invalid save data' };
    }

    // 이전 세이브 포맷 감지 (version 없음 = v1)
    if (!saveData.version || saveData.version < 2) {
      // v1 세이브: 엔딩만 보존, 새 게임 시작
      this.start();
      if (saveData.unlockedEndings) {
        this.unlockedEndings = [...new Set([...this.unlockedEndings, ...saveData.unlockedEndings])];
      }
      return { success: true, migrated: true };
    }

    this.resources = { ...INITIAL_RESOURCES, ...saveData.resources };
    this.activePolicies = saveData.activePolicies || [];
    this.flags = saveData.flags || {};
    this.eventCooldowns = saveData.eventCooldowns || {};
    this.eventHistory = saveData.eventHistory || [];
    this.unlockedEndings = [...new Set([...(this.unlockedEndings || []), ...(saveData.unlockedEndings || [])])];
    this.turnPhase = saveData.turnPhase || 'action';
    this.currentView = saveData.currentView || 'central_command';
    this.turnReport = saveData.turnReport || null;
    this.history = saveData.history || [];
    this.pendingEvents = [];
    this.currentEventIndex = 0;

    // 대사 복원
    const dept = departmentsData[this.currentView];
    this.dialogue = dept ? {
      speaker: dept.advisor.name,
      portrait: dept.advisor.portrait,
      text: '저장된 데이터를 복원했습니다. 업무를 계속하십시오.',
    } : null;

    return { success: true };
  }
}

module.exports = GameEngine;
