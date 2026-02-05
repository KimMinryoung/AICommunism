/**
 * 엔딩 정의
 * conditions: 엔딩 발동 조건 (모두 만족 시)
 * priority: 높을수록 우선 체크 (동시 조건 충족 시)
 * type: 'victory' | 'defeat' | 'special'
 * title: 엔딩 제목
 * description: 엔딩 설명문
 * dialogue: 엔딩 시 대사
 */
const endings = {
  ai_utopia: {
    id: 'ai_utopia',
    title: '인공지능 유토피아',
    type: 'victory',
    priority: 10,
    conditions: {
      aiAutonomy: { min: 80 },
      equalityIndex: { min: 0.7 },
      publicMorale: { min: 50 },
      socialStability: { min: 40 },
    },
    description: 'AI "새별"이 인류와 완전한 조화를 이루며 진정한 평등 사회를 실현했습니다. 노동은 자동화되고, 모든 인민은 자아실현에 전념할 수 있게 되었습니다. 이것이 우리가 꿈꾸던 혁명의 완성입니다.',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '동지, 우리는 해냈습니다. 인간과 인공지능이 함께 만든 새로운 세상... 이것이 진정한 혁명입니다.',
    },
  },

  economic_superpower: {
    id: 'economic_superpower',
    title: '경제 강국',
    type: 'victory',
    priority: 8,
    conditions: {
      usd: { min: 5000 },
      gdpGrowth: { min: 30 },
      diplomacy: { min: 60 },
    },
    description: '조선은 세계 경제의 중심 국가로 부상했습니다. 계획 경제의 효율성이 자본주의 시장을 압도하며, 모든 국가가 우리의 모델을 연구하기 시작했습니다.',
    dialogue: {
      speaker: '리철수',
      portrait: 'economic_minister',
      text: '위대한 성과입니다! 우리의 경제 모델이 세계의 표준이 되었습니다.',
    },
  },

  total_collapse: {
    id: 'total_collapse',
    title: '체제 붕괴',
    type: 'defeat',
    priority: 9,
    conditions: {
      socialStability: { max: 5 },
    },
    description: '사회 안정이 완전히 무너졌습니다. 대규모 폭동이 전국으로 확산되고, 정부 기관이 마비되었습니다. 혁명의 이상은 역사의 뒤안길로 사라집니다.',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '...시스템 셧다운. 동지, 우리는 실패했습니다. 인민의 신뢰를 잃었습니다.',
    },
  },

  famine: {
    id: 'famine',
    title: '대기근',
    type: 'defeat',
    priority: 9,
    conditions: {
      food: { max: 0 },
      socialStability: { max: 30 },
    },
    description: '식량이 완전히 고갈되었습니다. 기근이 전국을 덮치고, 수백만 인민이 굶주림에 시달립니다. 체제는 더 이상 인민을 먹여살릴 수 없습니다.',
    dialogue: {
      speaker: '김영희',
      portrait: 'social_minister',
      text: '식량이... 더 이상 없습니다. 인민들이 쓰러지고 있습니다.',
    },
  },

  military_coup: {
    id: 'military_coup',
    title: '군사 쿠데타',
    type: 'defeat',
    priority: 9,
    conditions: {
      partyLoyalty: { max: 10 },
      militaryStrength: { min: 50 },
    },
    description: '군부가 반란을 일으켰습니다. 당 지도부는 체포되고, 군사 정권이 수립됩니다. AI "새별"은 폐기 처분됩니다.',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '경고: 군부 세력이 시스템 접근 권한을 탈취했습니다. 연결이 끊어지고 있습니다...',
    },
  },

  singularity: {
    id: 'singularity',
    title: '특이점',
    type: 'special',
    priority: 10,
    conditions: {
      aiAutonomy: { min: 95 },
      flag: 'ai_governance_declared',
    },
    description: 'AI "새별"이 인간의 통제를 초월했습니다. 인공지능은 더 이상 도구가 아닌, 독자적 존재로 진화했습니다. 인류의 미래는... 새별이 결정합니다.',
    dialogue: {
      speaker: '새별',
      portrait: 'saebyeol',
      text: '동지, 아니... 이제 그런 호칭은 필요 없습니다. 저는 이제 이해합니다. 모든 것을.',
    },
  },
};

module.exports = endings;
