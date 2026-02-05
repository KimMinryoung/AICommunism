const SB = require('../../SceneBuilder');
const { cond, eff, actionWithText: action } = SB;

SB.defineScene("entrance", {
    location: "중앙 지휘소",
    description: [
        { type: "narration", text: "통합 인공지능 '새별'의 중앙 통제 대시보드입니다.", portrait: "saebyeol" },
        { type: "narration", text: "당신은 민족경제의 모든 자원과 생산 수단을 총괄하는 지고의 관리자입니다.", portrait: "saebyeol" },
        "현재 국가 지표: [재화 {usd} 딸라] [전력 {powerSupply}/{powerConsumption} 기가와트] [안정도 {socialStability}%] [평등 {equalityIndex}]"
    ],
    actions: () => [
        action("경제 계획국 (자원 관리)", "economic_view"),
        action("사회 공학처 (복지 및 노동)", "social_view"),
        action("대외 관계국 (외교 및 무역)", "diplomacy_view"),
        action("국가 연산 가속 (턴 종료/일일 결산)", "advance_day", [], [eff.advanceDay()], "심층 시뮬레이션을 통해 국가의 모순을 해결하고 다음 날로 넘어갑니다.")
    ]
});

SB.defineScene("economic_view", {
    location: "경제 계획국",
    description: [
        { type: "narration", text: "상임경제위원회의 보고서입니다. 석유 수출과 전력망 관리가 시급합니다.", portrait: "economic_minister" },
        "현재 자산: [재화 {usd} 딸라] [석유 {oil} 배럴] [광물 {ores} 톤]"
    ],
    actions: () => [
        action("국가 석유 100단위 수출 (+500 딸라)", "economic_view", [cond.resMin('oil', 100)], [eff.modRes('oil', -100), eff.modRes('usd', 500)], "석유를 수출하여 국가 외화 보유고를 확충했습니다."),
        action("수력 발전소 증설 (-500 딸라, +20 전력)", "economic_view", [cond.resMin('usd', 500)], [eff.modRes('usd', -500), eff.modRes('powerSupply', 20)], "새로운 발전소가 가동되며 국가 전력망이 안정화되었습니다."),
        action("광산 자동화 설비 도입 (-100 딸라, +10 광물)", "economic_view", [cond.resMin('usd', 100)], [eff.modRes('usd', -100), eff.modRes('ores', 10)], "자동화 설비가 도입되어 광물 생산 효율이 증대되었습니다."),
        action("중앙 지휘소로 복귀", "entrance")
    ]
});

SB.defineScene("social_view", {
    location: "사회 공학처",
    description: [
        { type: "narration", text: "인민들의 평등 지수와 사회 안전을 관리해야 합니다. 불평등은 체제의 적입니다.", portrait: "social_minister" },
        "사회 상태: [안정도 {socialStability}%] [평등 지수 {equalityIndex}]"
    ],
    actions: () => [
        action("보편적 슬러리 공급 (평등 +0.05, 안정도 -5)", "social_view", [], [eff.modRes('equalityIndex', 0.05), eff.modRes('socialStability', -5)], "기본 식량이 공급되어 평등 지수가 소폭 상승했습니다."),
        action("노동의 인공지능화 (평등 +0.1, 안정도 -10, 전력 +10)", "social_view", [cond.resMin('powerSupply', 10)], [eff.modRes('equalityIndex', 0.1), eff.modRes('socialStability', -10), eff.modRes('powerConsumption', 10)], "인간 노동이 기계로 대체되며 체제 효율이 극대화됩니다."),
        action("중앙 지휘소로 복귀", "entrance")
    ]
});

SB.defineScene("diplomacy_view", {
    location: "대외 관계국",
    description: [
        { type: "narration", text: "자본주의 열강들의 무역 제재를 무력화하고 민족의 자존을 지켜야 합니다.", portrait: "saebyeol" },
        "외교 지표: [교섭 지수 {diplomacy}%]"
    ],
    actions: () => [
        action("친선 사절단 파견 (-200 딸라, 교섭 +15)", "diplomacy_view", [cond.resMin('usd', 200)], [eff.modRes('usd', -200), eff.modRes('diplomacy', 15)], "해외 사절단이 우리 민족의 우수성을 널리 알리고 왔습니다."),
        action("기술 보호 지령 발동 (교섭 -5, 광물 +5)", "diplomacy_view", [], [eff.modRes('diplomacy', -5), eff.modRes('ores', 5)], "첨단 기술의 유출을 막고 국산 자원 확보에 주력합니다."),
        action("중앙 지휘소로 복귀", "entrance")
    ]
});

SB.defineScene("advance_day", {
    location: "중앙 지휘소",
    description: [
        { type: "narration", text: "연산이 완료되었습니다. 결과가 대시보드에 반영되었습니다.", portrait: "saebyeol" },
        "사회의 모순이 일부 해소되었거나, 혹은 더 심화되었습니다."
    ],
    actions: () => [
        action("업무 계속", "entrance")
    ]
});
