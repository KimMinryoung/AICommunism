import React from 'react';

function DashboardView({ resources, activePolicies }) {
  const cards = [
    { label: '국가 자산', value: `$${(resources.usd || 0).toLocaleString()}`, key: 'usd' },
    { label: 'GDP 성장률', value: `${resources.gdpGrowth || 0}%`, key: 'gdpGrowth' },
    { label: '석유 매장량', value: `${(resources.oil || 0).toLocaleString()} 배럴`, key: 'oil' },
    { label: '식량 비축', value: `${(resources.food || 0).toLocaleString()} 톤`, key: 'food' },
    { label: '전자 부품', value: `${(resources.electronics || 0).toLocaleString()} 단위`, key: 'electronics' },
    { label: '전략 광물', value: `${(resources.ores || 0).toLocaleString()} 톤`, key: 'ores' },
    { label: '군사력', value: `${resources.militaryStrength || 0}`, key: 'militaryStrength' },
    { label: '활성 정책', value: `${activePolicies?.length || 0}개`, key: 'policies' },
  ];

  return (
    <div className="dashboard-view">
      <h2 className="view-title">국가 운영 현황</h2>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.key} className="dashboard-card">
            <div className="card-label">{card.label}</div>
            <div className="card-value">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardView;
