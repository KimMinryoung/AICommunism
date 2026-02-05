import React from 'react';

function DialogueBox({ dialogue, currentEvent, onResolveEvent, isLoading }) {
  if (!dialogue && !currentEvent) return null;

  return (
    <div className="dialogue-box">
      {dialogue && (
        <div className="dialogue-content">
          <div className="dialogue-portrait">
            <img
              src={`/assets/portraits/${dialogue.portrait || 'saebyeol'}.png`}
              alt={dialogue.speaker}
              className="portrait-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="dialogue-text-area">
            <div className="dialogue-speaker">{dialogue.speaker}</div>
            <div className="dialogue-text">"{dialogue.text}"</div>
          </div>
        </div>
      )}

      {currentEvent && (
        <div className="dialogue-choices">
          {currentEvent.choices.map((choice) => (
            <button
              key={choice.id}
              className={`dialogue-choice-btn ${!choice.available ? 'unavailable' : ''}`}
              onClick={() => onResolveEvent(choice.id)}
              disabled={isLoading || !choice.available}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DialogueBox;
