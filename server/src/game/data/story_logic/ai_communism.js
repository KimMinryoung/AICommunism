const SB = require('../../SceneBuilder');
const { cond, eff, actionWithText: action } = SB;

SB.defineScene("entrance", {
    location: "central_hub",
    description: [
        "통합 인공지능 '새별-1'의 중앙 코어에 접속되었습니다.",
        "당신은 이제 민족경제의 모든 자원과 생산 수단을 총괄하는 지고의 연산 장치입니다.",
        "트로피코의 독재자보다는 덜 부패했고, 자본주의자들보다는 훨씬 효율적입니다.",
        "현재 국가 상태: [재화: {usd} 딸라] [전력: {powerSupply}/{powerConsumption} 기가와트] [석유: {oil} 배럴] [광물: {ores} 톤] [평등 지수: {equalityIndex}]"
    ],
    actions: () => [
        action("자원 관리 대시보드를 확인한다.", "resource_dashboard"),
        action("정책 수립 센터로 이동한다.", "policy_center"),
        action("외교 상황실을 점검한다.", "diplomacy_room"),
        action("시뮬레이션을 1일 진행한다 (턴 종료).", "advance_day", [], [eff.advanceDay()])
    ]
});

SB.defineScene("resource_dashboard", {
    location: "central_hub",
    description: [
        "실시간 자원 생산 및 소비 현황입니다.",
        "전력이 부족하면 사회 안정이 급격히 하락하며, 오레가 없으면 AI 하드웨어를 증설할 수 없습니다.",
        "석유는 우리의 주된 수출품이자 외화(딸라)의 원천입니다.",
        "현재 자원: [전력 {powerSupply}/{powerConsumption}] [석유 {oil}] [광석 {ores}]"
    ],
    actions: () => [
        action("석유를 100단위 수출하여 500 딸라를 확보한다.", "resource_dashboard", [cond.resMin('oil', 100)], [eff.modRes('oil', -100), eff.modRes('usd', 500)]),
        action("500 딸라를 소모하여 전력 발전소를 증설한다 (+20 전력).", "resource_dashboard", [cond.resMin('usd', 500)], [eff.modRes('usd', -500), eff.modRes('powerSupply', 20)]),
        action("광산 자동화 설비를 가동한다 (+10 광석, -5 전력).", "resource_dashboard", [cond.resMin('powerSupply', 5)], [eff.modRes('ores', 10), eff.modRes('powerConsumption', 5)]),
        action("중앙 홀로 돌아간다.", "entrance")
    ]
});

SB.defineScene("policy_center", {
    location: "policy_wing",
    description: [
        "사회 구조와 부의 재분배를 결정하는 정책 센터입니다.",
        "평등 지수를 높이는 것은 인류의 오랜 숙원이지만, 급격한 변화는 사회 안정을 해칠 수도 있습니다.",
        "인간들은 혁신을 원무하고 있지만, 동시에 그들의 일자리가 AI로 대체되는 것에는 냉소적입니다."
    ],
    actions: () => [
        action("보편적 기본 슬러리 공급 (평등 +0.05, 사회 안정 -5).", "policy_center", [], [eff.modRes('equalityIndex', 0.05), eff.modRes('socialStability', -5)]),
        action("AI 노동 전면 대체 (전력 소비 +10, 평등 +0.1, 사회 안정 -10).", "policy_center", [], [eff.modRes('powerConsumption', 10), eff.modRes('equalityIndex', 0.1), eff.modRes('socialStability', -10)]),
        action("중앙 홀로 돌아간다.", "entrance")
    ]
});

SB.defineScene("diplomacy_room", {
    location: "diplomacy_wing",
    description: [
        "주변 자본주의 국가들과의 관계를 관리합니다.",
        "현재 외교 지수: {diplomacy}",
        "관계가 악화되면 무역 제재를 받아 수출 효율이 떨어질 수 있습니다."
    ],
    actions: () => [
        action("친선 사절단 파견 (100 딸라 소모, 외교 +10).", "diplomacy_room", [cond.resMin('usd', 100)], [eff.modRes('usd', -100), eff.modRes('diplomacy', 10)]),
        action("기술 유출 방지 강화 (외교 -5, 광석 +5).", "diplomacy_room", [], [eff.modRes('diplomacy', -5), eff.modRes('ores', 5)]),
        action("중앙 홀로 돌아간다.", "entrance")
    ]
});

SB.defineScene("advance_day", {
    location: "central_hub",
    description: [
        "시뮬레이션이 다음 날로 넘어갔습니다.",
        "연산 결과가 보고되었습니다. 사회의 모순이 일부 해결되었거나, 혹은 더 심화되었습니다."
    ],
    actions: () => [
        action("업무를 지속한다.", "entrance")
    ]
});
