import React from 'react';

const RESOURCE_NAMES = {
  usd: '국가 자산 (딸라)',
  oil: '석유 (배럴)',
  ores: '전략 광물 (톤)',
  food: '식량 (톤)',
  electronics: '전자 부품',
  powerSupply: '전력 공급',
  powerConsumption: '전력 소비',
  diplomacy: '교섭 지수',
  socialStability: '사회 안정도',
  equalityIndex: '평등 지수',
  publicMorale: '인민 사기',
  education: '교육 수준',
  healthcare: '의료 수준',
  militaryStrength: '군사력',
  partyLoyalty: '당 충성도',
  aiAutonomy: 'AI 자율성',
  gdpGrowth: 'GDP 성장률',
};

function TurnReportView({ turnReport, resources, onDismiss, isLoading }) {
  if (!turnReport) return null;

  const changes = Object.entries(turnReport)
    .filter(([_, val]) => val !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  const positives = changes.filter(([_, val]) => val > 0);
  const negatives = changes.filter(([_, val]) => val < 0);

  return (
    <div className="turn-report-view">
      <h2 className="view-title">
        {resources.currentYear}년 {resources.currentMonth}월 보고서
      </h2>

      <div className="report-columns">
        <div className="report-column positive">
          <h3>증가</h3>
          {positives.length === 0 ? (
            <p className="report-empty">변화 없음</p>
          ) : (
            positives.map(([key, val]) => (
              <div key={key} className="report-item positive">
                <span className="report-resource">{RESOURCE_NAMES[key] || key}</span>
                <span className="report-delta">+{formatValue(key, val)}</span>
              </div>
            ))
          )}
        </div>

        <div className="report-column negative">
          <h3>감소</h3>
          {negatives.length === 0 ? (
            <p className="report-empty">변화 없음</p>
          ) : (
            negatives.map(([key, val]) => (
              <div key={key} className="report-item negative">
                <span className="report-resource">{RESOURCE_NAMES[key] || key}</span>
                <span className="report-delta">{formatValue(key, val)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        className="report-dismiss-btn"
        onClick={onDismiss}
        disabled={isLoading}
      >
        업무 계속
      </button>
    </div>
  );
}

function formatValue(key, val) {
  if (key === 'equalityIndex') return val.toFixed(2);
  return Math.round(val);
}

export default TurnReportView;
