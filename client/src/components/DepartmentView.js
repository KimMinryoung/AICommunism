import React from 'react';

function DepartmentView({ department, policies, onTogglePolicy, onEnactPolicy, isLoading }) {
  if (!department) return null;

  const togglePolicies = policies?.filter(p => p.type === 'toggle') || [];
  const enactPolicies = policies?.filter(p => p.type === 'enact') || [];

  return (
    <div className="department-view">
      <h2 className="view-title">{department.name}</h2>
      <p className="view-description">{department.description}</p>

      {togglePolicies.length > 0 && (
        <div className="policy-section">
          <h3 className="policy-section-title">운영 정책</h3>
          {togglePolicies.map((policy) => (
            <div key={policy.id} className={`policy-item ${policy.isActive ? 'active' : ''}`}>
              <div className="policy-header">
                <div className="policy-info">
                  <span className="policy-name">{policy.name}</span>
                  <span className="policy-desc">{policy.description}</span>
                </div>
                <button
                  className={`policy-toggle ${policy.isActive ? 'on' : 'off'}`}
                  onClick={() => onTogglePolicy(policy.id)}
                  disabled={isLoading || (!policy.isActive && !policy.canActivate)}
                >
                  {policy.isActive ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="policy-details">
                {Object.keys(policy.effects).length > 0 && (
                  <span className="policy-effects">
                    매 턴: {formatEffects(policy.effects)}
                  </span>
                )}
                {Object.keys(policy.upkeep).length > 0 && (
                  <span className="policy-upkeep">
                    유지비: {formatEffects(policy.upkeep)}
                  </span>
                )}
                {policy.incompatible.length > 0 && (
                  <span className="policy-incompatible">
                    비호환: {policy.incompatible.join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {enactPolicies.length > 0 && (
        <div className="policy-section">
          <h3 className="policy-section-title">특별 지시</h3>
          {enactPolicies.map((policy) => (
            <div key={policy.id} className={`policy-item enact ${policy.isEnacted ? 'enacted' : ''}`}>
              <div className="policy-header">
                <div className="policy-info">
                  <span className="policy-name">{policy.name}</span>
                  <span className="policy-desc">{policy.description}</span>
                </div>
                <button
                  className="policy-enact-btn"
                  onClick={() => onEnactPolicy(policy.id)}
                  disabled={isLoading || policy.isEnacted || !policy.canActivate}
                >
                  {policy.isEnacted ? '실행됨' : '실행'}
                </button>
              </div>
              <div className="policy-details">
                {policy.enactEffects && Object.keys(policy.enactEffects).length > 0 && (
                  <span className="policy-effects">
                    효과: {formatEffects(policy.enactEffects)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const RESOURCE_NAMES = {
  usd: '딸라', oil: '석유', ores: '광물', food: '식량', electronics: '전자',
  powerSupply: '전력공급', powerConsumption: '전력소비',
  diplomacy: '교섭', socialStability: '안정도', equalityIndex: '평등',
  publicMorale: '사기', education: '교육', healthcare: '의료',
  militaryStrength: '군사력', partyLoyalty: '충성도', aiAutonomy: 'AI자율',
  gdpGrowth: 'GDP성장',
};

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([key, val]) => {
      const name = RESOURCE_NAMES[key] || key;
      const sign = val > 0 ? '+' : '';
      return `${name} ${sign}${val}`;
    })
    .join(', ');
}

export default DepartmentView;
