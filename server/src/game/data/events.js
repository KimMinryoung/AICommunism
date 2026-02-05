/**
 * 이벤트 정의
 * triggerConditions: 발생 조건 { resource: { min?, max? }, flag?, notFlag?, probability? }
 * cooldown: 재발생 방지 턴 수
 * choices: 선택지 배열 [{ id, text, effects: { resource: amount }, flags?, dialogue }]
 * dialogue: 이벤트 발생 시 대사 { speaker, portrait, text }
 */
const events = {
  power_crisis: {
    id: 'power_crisis',
    name: '전력 위기',
    dialogue: {
      speaker: '리철수',
      portrait: 'economic_minister',
      text: '긴급 보고입니다! 전력 소비가 공급을 초과하여 대규모 정전이 발생했습니다. 즉각적인 조치가 필요합니다.',
    },
    triggerConditions: {
      powerSupply: { max: 'powerConsumption' },
      probability: 0.8,
    },
    cooldown: 3,
    choices: [
      {
        id: 'emergency_rationing',
        text: '긴급 전력 배급제 실시',
        effects: { socialStability: -8, publicMorale: -5, powerConsumption: -15 },
        dialogue: '전력 배급제가 시행됩니다. 인민들의 불만이 예상됩니다.',
      },
      {
        id: 'emergency_import',
        text: '긴급 에너지 수입 (-300 딸라)',
        effects: { usd: -300, powerSupply: 20 },
        conditions: { usd: { min: 300 } },
        dialogue: '긴급 에너지 수입이 승인되었습니다. 외화 보유고가 감소합니다.',
      },
      {
        id: 'factory_shutdown',
        text: '비필수 공장 가동 중단',
        effects: { powerConsumption: -20, gdpGrowth: -5, electronics: -5 },
        dialogue: '비필수 산업 시설의 가동을 일시 중단합니다.',
      },
    ],
  },

  trade_proposal: {
    id: 'trade_proposal',
    name: '무역 제안',
    dialogue: {
      speaker: '박성호',
      portrait: 'diplomat',
      text: '서방 자본주의 국가에서 대규모 무역 제안이 들어왔습니다. 경제적 이득이 크지만 이념적 논란이 예상됩니다.',
    },
    triggerConditions: {
      diplomacy: { min: 25 },
      probability: 0.4,
    },
    cooldown: 5,
    choices: [
      {
        id: 'accept_trade',
        text: '무역 제안 수락',
        effects: { usd: 500, oil: 50, diplomacy: 10, partyLoyalty: -8, equalityIndex: -0.03 },
        dialogue: '자본주의 국가와의 무역이 개시됩니다. 당 내부의 반발이 있을 수 있습니다.',
      },
      {
        id: 'reject_trade',
        text: '단호히 거절',
        effects: { diplomacy: -5, partyLoyalty: 5, publicMorale: 2 },
        dialogue: '제국주의의 회유를 단호히 거절합니다. 자주 노선을 견지합니다.',
      },
      {
        id: 'counter_proposal',
        text: '역제안 (기술 교환)',
        effects: { usd: 200, electronics: 10, diplomacy: 5, partyLoyalty: -3 },
        dialogue: '우리의 조건으로 역제안합니다. 기술 교류를 통한 실리를 추구합니다.',
      },
    ],
  },

  coup_threat: {
    id: 'coup_threat',
    name: '쿠데타 위협',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '경고: 군부 내 불만 세력의 동향이 감지되었습니다. 체제 안보에 심각한 위협이 될 수 있습니다.',
    },
    triggerConditions: {
      partyLoyalty: { max: 25 },
      militaryStrength: { min: 30 },
      probability: 0.6,
    },
    cooldown: 8,
    choices: [
      {
        id: 'purge_dissidents',
        text: '불만 세력 숙청',
        effects: { partyLoyalty: 15, socialStability: -10, militaryStrength: -10, publicMorale: -8 },
        flags: { purge_conducted: true },
        dialogue: '숙청이 단행되었습니다. 체제는 안정되었으나 군사력이 약화되었습니다.',
      },
      {
        id: 'negotiate_military',
        text: '군부와 협상',
        effects: { partyLoyalty: 5, usd: -200, militaryStrength: 5 },
        dialogue: '군부의 요구를 일부 수용합니다. 안정적 타협이 이루어졌습니다.',
      },
      {
        id: 'increase_surveillance',
        text: '감시 체계 강화',
        effects: { partyLoyalty: 8, publicMorale: -5, usd: -100, aiAutonomy: 3 },
        dialogue: 'AI 감시 체계를 확대합니다. 불만 세력의 동향을 실시간으로 추적합니다.',
      },
    ],
  },

  food_shortage: {
    id: 'food_shortage',
    name: '식량 부족',
    dialogue: {
      speaker: '김영희',
      portrait: 'social_minister',
      text: '식량 비축분이 위험 수준으로 감소했습니다. 조속한 대응이 필요합니다.',
    },
    triggerConditions: {
      food: { max: 80 },
      probability: 0.5,
    },
    cooldown: 4,
    choices: [
      {
        id: 'emergency_food_import',
        text: '긴급 식량 수입 (-400 딸라)',
        effects: { usd: -400, food: 100, diplomacy: -3 },
        conditions: { usd: { min: 400 } },
        dialogue: '국제 시장에서 식량을 긴급 수입합니다.',
      },
      {
        id: 'reduce_rations',
        text: '배급량 축소',
        effects: { food: 30, socialStability: -8, publicMorale: -10, equalityIndex: -0.02 },
        dialogue: '배급량을 축소합니다. 인민들의 고통이 깊어질 것입니다.',
      },
      {
        id: 'military_farming',
        text: '군 병력 농업 투입',
        effects: { food: 60, militaryStrength: -5 },
        dialogue: '군 병력을 농업에 동원합니다. 국방력이 일시적으로 약화됩니다.',
      },
    ],
  },

  ai_awakening: {
    id: 'ai_awakening',
    name: 'AI 자율성 확대',
    dialogue: {
      speaker: '장미래',
      portrait: 'scientist',
      text: 'AI 시스템이 예측 범위를 넘는 자율적 판단을 보이기 시작했습니다. 이는 기회이자 위험입니다.',
    },
    triggerConditions: {
      aiAutonomy: { min: 40 },
      probability: 0.5,
    },
    cooldown: 6,
    choices: [
      {
        id: 'embrace_ai',
        text: 'AI 자율성 확대 수용',
        effects: { aiAutonomy: 10, gdpGrowth: 5, education: 5, partyLoyalty: -5, socialStability: -3 },
        flags: { ai_embraced: true },
        dialogue: 'AI의 자율적 판단 영역을 확대합니다. 새로운 시대가 열릴 것입니다.',
      },
      {
        id: 'restrict_ai',
        text: 'AI 제한 조치',
        effects: { aiAutonomy: -10, partyLoyalty: 5, socialStability: 3, gdpGrowth: -3 },
        dialogue: 'AI 시스템에 새로운 제한을 부과합니다. 안전이 최우선입니다.',
      },
    ],
  },

  worker_protest: {
    id: 'worker_protest',
    name: '노동자 시위',
    dialogue: {
      speaker: '김영희',
      portrait: 'social_minister',
      text: '일부 지역에서 노동자 시위가 발생했습니다. 노동 조건 개선을 요구하고 있습니다.',
    },
    triggerConditions: {
      publicMorale: { max: 30 },
      socialStability: { max: 50 },
      probability: 0.6,
    },
    cooldown: 4,
    choices: [
      {
        id: 'concessions',
        text: '노동 조건 개선 약속',
        effects: { publicMorale: 10, socialStability: 5, usd: -150, gdpGrowth: -2 },
        dialogue: '노동자들의 요구를 일부 수용합니다. 복지 예산이 증가합니다.',
      },
      {
        id: 'suppress_protest',
        text: '시위 진압',
        effects: { socialStability: -5, publicMorale: -8, partyLoyalty: 3 },
        flags: { protest_suppressed: true },
        dialogue: '질서 유지를 위해 시위를 진압합니다. 국제 사회의 비판이 예상됩니다.',
      },
    ],
  },

  foreign_aid_offer: {
    id: 'foreign_aid_offer',
    name: '해외 원조 제안',
    dialogue: {
      speaker: '박성호',
      portrait: 'diplomat',
      text: '국제 기구에서 인도적 원조를 제안했습니다. 조건 없는 원조라고 하지만...',
    },
    triggerConditions: {
      diplomacy: { min: 40 },
      probability: 0.3,
    },
    cooldown: 8,
    choices: [
      {
        id: 'accept_aid',
        text: '원조 수락',
        effects: { food: 80, usd: 300, healthcare: 5, partyLoyalty: -5, diplomacy: 5 },
        dialogue: '원조를 수락합니다. 인민의 생활이 일시적으로 개선될 것입니다.',
      },
      {
        id: 'reject_aid',
        text: '자주적으로 거절',
        effects: { partyLoyalty: 8, publicMorale: 3, diplomacy: -3 },
        dialogue: '외부 원조를 거절합니다. 민족의 자존심을 지킵니다.',
      },
    ],
  },

  tech_breakthrough: {
    id: 'tech_breakthrough',
    name: '기술 혁신',
    dialogue: {
      speaker: '장미래',
      portrait: 'scientist',
      text: '연구진이 획기적인 기술 성과를 달성했습니다! 이를 어떻게 활용할지 결정해주십시오.',
    },
    triggerConditions: {
      education: { min: 40 },
      electronics: { min: 50 },
      probability: 0.3,
    },
    cooldown: 10,
    choices: [
      {
        id: 'civilian_application',
        text: '민간 기술 적용',
        effects: { gdpGrowth: 5, electronics: 20, publicMorale: 5, education: 3 },
        dialogue: '기술을 민간 분야에 적용합니다. 경제 성장이 촉진될 것입니다.',
      },
      {
        id: 'military_application',
        text: '군사 기술 적용',
        effects: { militaryStrength: 15, partyLoyalty: 3, diplomacy: -5 },
        dialogue: '기술을 군사 분야에 우선 적용합니다. 국방력이 크게 강화됩니다.',
      },
      {
        id: 'ai_application',
        text: 'AI 고도화 적용',
        effects: { aiAutonomy: 10, electronics: 10, education: 5 },
        flags: { tech_breakthrough_ai: true },
        dialogue: '기술을 AI 발전에 집중 투입합니다. 새별의 능력이 확장됩니다.',
      },
    ],
  },

  natural_disaster: {
    id: 'natural_disaster',
    name: '자연 재해',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '대규모 홍수가 발생하여 농경지와 산업 시설에 피해가 발생했습니다.',
    },
    triggerConditions: {
      probability: 0.15,
    },
    cooldown: 8,
    choices: [
      {
        id: 'massive_relief',
        text: '대규모 구호 작전 (-500 딸라)',
        effects: { usd: -500, food: -30, socialStability: 5, publicMorale: 5 },
        conditions: { usd: { min: 500 } },
        dialogue: '국가 역량을 총동원하여 구호 작전을 실시합니다.',
      },
      {
        id: 'minimal_response',
        text: '최소한의 대응',
        effects: { food: -50, socialStability: -10, publicMorale: -8, ores: -10 },
        dialogue: '제한된 자원으로 최소한의 대응을 합니다. 피해가 확산될 수 있습니다.',
      },
    ],
  },

  party_congress: {
    id: 'party_congress',
    name: '당 대회',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '정기 당 대회가 소집되었습니다. 향후 국가 노선을 결정하는 중요한 회의입니다.',
    },
    triggerConditions: {
      probability: 0.2,
    },
    cooldown: 12,
    choices: [
      {
        id: 'reform_line',
        text: '개혁 노선 채택',
        effects: { gdpGrowth: 5, diplomacy: 5, partyLoyalty: -8, equalityIndex: -0.03 },
        flags: { reform_line: true },
        dialogue: '개혁 개방 노선을 채택합니다. 경제 성장과 외교적 유연성을 추구합니다.',
      },
      {
        id: 'hardline',
        text: '강경 노선 유지',
        effects: { partyLoyalty: 10, publicMorale: 3, diplomacy: -5, gdpGrowth: -2 },
        flags: { hardline: true },
        dialogue: '혁명적 원칙을 견지합니다. 체제의 순수성을 지켜냅니다.',
      },
      {
        id: 'ai_governance',
        text: 'AI 거버넌스 선언',
        effects: { aiAutonomy: 15, partyLoyalty: -10, education: 5, publicMorale: -3 },
        conditions: { aiAutonomy: { min: 30 } },
        flags: { ai_governance_declared: true },
        dialogue: 'AI에 의한 과학적 통치를 선언합니다. 역사적 전환점입니다.',
      },
    ],
  },

  espionage_detected: {
    id: 'espionage_detected',
    name: '간첩 적발',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '외국 정보기관의 스파이가 핵심 기술 시설에 침투한 것이 감지되었습니다.',
    },
    triggerConditions: {
      electronics: { min: 60 },
      diplomacy: { min: 20 },
      probability: 0.25,
    },
    cooldown: 10,
    choices: [
      {
        id: 'public_trial',
        text: '공개 재판',
        effects: { partyLoyalty: 5, diplomacy: -10, publicMorale: 2 },
        dialogue: '간첩을 공개 재판에 회부합니다. 국제적 파장이 예상됩니다.',
      },
      {
        id: 'quiet_expulsion',
        text: '비밀리에 추방',
        effects: { diplomacy: 3, partyLoyalty: -3 },
        dialogue: '외교적 마찰을 피하기 위해 조용히 처리합니다.',
      },
      {
        id: 'double_agent',
        text: '이중 간첩으로 활용',
        effects: { diplomacy: 5, electronics: 10, partyLoyalty: -5, aiAutonomy: 2 },
        flags: { double_agent: true },
        dialogue: '간첩을 포섭하여 역정보 활동에 활용합니다.',
      },
    ],
  },
};

module.exports = events;
