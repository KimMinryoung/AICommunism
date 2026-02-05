import React from 'react';

// Minimap layout (7 rows x 3 columns) - includes dungeon
const mapLayout = [
  [null, 'roof', null],
  ['yard', 'corridor', 'workshop'],
  ['cafeteria', 'cell', null],
  [null, 'basement', 'solitary'],
  ['sewer1', 'sewer2', 'sewer3'],
  // Dungeon layer
  ['tunnels', 'tunnels_chapel', 'tunnels_deep'],
  [null, 'tunnels_exit', null],
];

const locationNames = {
  roof: '옥상',
  yard: '운동장',
  corridor: '복도',
  workshop: '작업장',
  cell: '감방',
  cafeteria: '식당',
  solitary: '독방',
  basement: '지하실',
  sewer1: '하수도',
  sewer2: '하수도',
  sewer3: '하수도',
  duct: '환기덕트',
  // Dungeon locations
  tunnels: '지하터널',
  tunnels_chapel: '폐예배당',
  tunnels_deep: '깊은 지하',
  tunnels_exit: '탈출구'
};

function Minimap({ location, visitedLocations = [] }) {
  if (!location) return null;

  // Special case for duct - it spans multiple areas
  const isDuct = location === 'duct';

  return (
    <div className="minimap">
      <div className="minimap-grid">
        {mapLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="minimap-row">
            {row.map((loc, colIndex) => {
              if (!loc) {
                return <div key={colIndex} className="minimap-cell empty" />;
              }

              const isCurrentLocation = loc === location;
              const isDuctOverlay = isDuct && ['corridor', 'cell', 'workshop'].includes(loc);
              const isVisited = visitedLocations.includes(loc);

              return (
                <div
                  key={colIndex}
                  className={`minimap-cell ${isCurrentLocation ? 'current' : ''} ${isDuctOverlay ? 'duct-overlay' : ''} ${!isVisited ? 'unvisited' : ''}`}
                  title={isVisited ? locationNames[loc] : '???'}
                >
                  <span className="minimap-label">{isVisited ? locationNames[loc] : '???'}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Minimap;
