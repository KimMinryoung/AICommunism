/**
 * 부서 정의 - 5개 부서 + 각 부서 고문관(advisor)
 */
const departments = {
  central_command: {
    id: 'central_command',
    name: '중앙지휘소',
    description: '국가 전체 운영 상황을 총괄하는 최고 사령부입니다.',
    advisor: {
      name: '새별',
      portrait: 'saebyeol',
      greeting: '동지, 국가 운영 현황을 보고드립니다. 모든 지표가 대시보드에 표시되어 있습니다.',
    },
    category: 'overview',
  },
  economic_bureau: {
    id: 'economic_bureau',
    name: '경제계획국',
    description: '국가 경제 계획과 자원 배분을 담당하는 핵심 기관입니다.',
    advisor: {
      name: '리철수',
      portrait: 'economic_minister',
      greeting: '경제 지표를 분석 중입니다. 자원 배분 정책을 검토하십시오.',
    },
    category: 'economy',
  },
  social_engineering: {
    id: 'social_engineering',
    name: '사회공학처',
    description: '인민의 복지, 교육, 의료를 관장하는 사회 관리 기관입니다.',
    advisor: {
      name: '김영희',
      portrait: 'social_minister',
      greeting: '인민 복지 현황을 보고합니다. 사회 안정이 체제 유지의 근본입니다.',
    },
    category: 'social',
  },
  foreign_relations: {
    id: 'foreign_relations',
    name: '대외관계국',
    description: '외교, 무역, 군사 관계를 총괄하는 대외 전략 기관입니다.',
    advisor: {
      name: '박성호',
      portrait: 'diplomat',
      greeting: '국제 정세 보고입니다. 제국주의 열강의 동향을 주시하고 있습니다.',
    },
    category: 'diplomacy',
  },
  science_tech: {
    id: 'science_tech',
    name: '과학기술국',
    description: 'AI, 전자, 에너지 기술의 연구개발을 주도하는 혁신 기관입니다.',
    advisor: {
      name: '장미래',
      portrait: 'scientist',
      greeting: '기술 연구 진행 상황입니다. AI 자율성 확장이 핵심 과제입니다.',
    },
    category: 'technology',
  },
};

module.exports = departments;
