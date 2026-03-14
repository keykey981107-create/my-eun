/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  User, 
  Timer, 
  Hash,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Difficulty, DIFFICULTIES, CardData, GameState } from './types';

// A set of icons to use for cards
const CARD_ICONS = [
  '🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍋', '🍉', '🍑',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🚗', '🚕', '🚙', '🚌', '🏎️', '🚑', '🚒', '🚐', '🚚', '🚜',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
  '🎸', '🎹', '🎷', '🎺', '🎻', '🥁', '🎨', '🎬', '🎤', '🎧',
  '🌈', '☀️', '🌙', '⭐', '☁️', '❄️', '🔥', '💧', '⚡', '🍀',
  '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍦', '🍰', '🍫', '🍭',
  '🚀', '🛸', '🛰️', '🪐', '🌍', '🌋', '🏔️', '🏖️', '🏝️', '🏜️',
  '💎', '👑', '🎁', '🎈', '🎉', '🎊', '🎀', '🪄', '🔮', '🧿',
  '🧸', '🧩', '🎮', '🕹️', '🎲', '🃏', '🎯', '🎳', '🛹', '🚲',
  '🏠', '🏰', '🗼', '🎡', '🎢', '🚢', '✈️', '🚁', '🚂', '🚇',
  '🌻', '🌹', '🌷', '🌵', '🌴', '🌲', '🌳', '🍄', '🐚', '🦀'
];

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameState, setGameState] = useState<GameState>({
    playerName: '',
    difficulty: 'beginner',
    cards: [],
    flippedIndices: [],
    moves: 0,
    isGameOver: false,
    startTime: null,
    endTime: null,
  });

  const config = DIFFICULTIES[difficulty];

  const initGame = useCallback(() => {
    const totalCards = config.rows * config.cols;
    const pairCount = Math.floor(totalCards / 2);
    
    // Select random icons for pairs
    const selectedIcons = [...CARD_ICONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairCount);
    
    let cardValues = [...selectedIcons, ...selectedIcons];
    
    // If odd number of cards, add a "Joker" or empty card
    if (totalCards % 2 !== 0) {
      cardValues.push('🃏');
    }
    
    // Shuffle
    cardValues.sort(() => Math.random() - 0.5);
    
    const initialCards: CardData[] = cardValues.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: value === '🃏' ? true : false, // Joker is pre-matched if odd
    }));

    setGameState({
      playerName,
      difficulty,
      cards: initialCards,
      flippedIndices: [],
      moves: 0,
      isGameOver: false,
      startTime: Date.now(),
      endTime: null,
    });
    setGameStarted(true);
  }, [config, difficulty, playerName]);

  const handleCardClick = (index: number) => {
    if (
      gameState.isGameOver ||
      gameState.flippedIndices.length === 2 ||
      gameState.cards[index].isFlipped ||
      gameState.cards[index].isMatched
    ) {
      return;
    }

    const newFlippedIndices = [...gameState.flippedIndices, index];
    const newCards = [...gameState.cards];
    newCards[index].isFlipped = true;

    setGameState(prev => ({
      ...prev,
      cards: newCards,
      flippedIndices: newFlippedIndices,
    }));

    if (newFlippedIndices.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      setGameState(prev => ({ ...prev, moves: prev.moves + 1 }));

      if (firstCard.value === secondCard.value) {
        // Match!
        setTimeout(() => {
          setGameState(prev => {
            const updatedCards = [...prev.cards];
            updatedCards[firstIndex].isMatched = true;
            updatedCards[secondIndex].isMatched = true;
            
            const allMatched = updatedCards.every(card => card.isMatched);
            
            return {
              ...prev,
              cards: updatedCards,
              flippedIndices: [],
              isGameOver: allMatched,
              endTime: allMatched ? Date.now() : null,
            };
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setGameState(prev => {
            const updatedCards = [...prev.cards];
            updatedCards[firstIndex].isFlipped = false;
            updatedCards[secondIndex].isFlipped = false;
            return {
              ...prev,
              cards: updatedCards,
              flippedIndices: [],
            };
          });
        }, 1000);
      }
    }
  };

  const getRank = (moves: number, diff: Difficulty) => {
    const base = diff === 'beginner' ? 20 : 100;
    if (moves <= base) return { label: 'S등급', color: 'text-yellow-500' };
    if (moves <= base * 1.5) return { label: 'A등급', color: 'text-blue-500' };
    if (moves <= base * 2) return { label: 'B등급', color: 'text-green-500' };
    return { label: 'C등급', color: 'text-gray-500' };
  };

  const formatTime = (start: number | null, end: number | null) => {
    if (!start) return '00:00';
    const duration = (end || Date.now()) - start;
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer update
  const [time, setTime] = useState('00:00');
  useEffect(() => {
    let interval: any;
    if (gameStarted && !gameState.isGameOver) {
      interval = setInterval(() => {
        setTime(formatTime(gameState.startTime, null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameState.isGameOver, gameState.startTime]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-black/5"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <Trophy className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">카드 뒤집기 게임</h1>
            <p className="text-gray-500 italic">기억력을 테스트해보세요!</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">사용자 이름</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">난이도 선택</label>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      difficulty === key 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="font-medium">{DIFFICULTIES[key].label}</span>
                    {difficulty === key && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initGame}
              disabled={!playerName.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              게임 시작
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-center gap-3">
              <User className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">플레이어</p>
                <p className="font-bold text-gray-900">{gameState.playerName}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-center gap-3">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">시간</p>
                <p className="font-bold text-gray-900 font-mono">{time}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-center gap-3">
              <Hash className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">시도 횟수</p>
                <p className="font-bold text-gray-900">{gameState.moves}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setGameStarted(false)}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 font-semibold rounded-xl border border-gray-200 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            메인으로
          </button>
        </div>

        {/* Game Grid */}
        <div 
          className="grid gap-1 md:gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            maxWidth: difficulty === 'beginner' ? '350px' : '480px'
          }}
        >
          {gameState.cards.map((card, index) => (
            <div key={card.id} className="aspect-square perspective-1000">
              <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                onClick={() => handleCardClick(index)}
              >
                {/* Front (Hidden) */}
                <div className="absolute inset-0 backface-hidden bg-emerald-600 rounded-lg md:rounded-xl shadow-md flex items-center justify-center border-2 border-emerald-500/50 overflow-hidden">
                  <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                  <Trophy className="w-1/3 h-1/3 text-white/30" />
                </div>

                {/* Back (Revealed) */}
                <div 
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-lg md:rounded-xl shadow-md flex items-center justify-center text-lg md:text-xl lg:text-2xl transition-colors ${
                    card.isMatched ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-white border-2 border-gray-100'
                  }`}
                >
                  <span className={card.isMatched ? 'opacity-50 grayscale' : ''}>
                    {card.value}
                  </span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameState.isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">축하합니다!</h2>
                <p className="text-gray-500 mb-6">{gameState.playerName}님, 모든 카드를 찾았습니다!</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">최종 시도</span>
                    <span className="text-xl font-bold text-gray-900">{gameState.moves}회</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">소요 시간</span>
                    <span className="text-xl font-bold text-gray-900">{time}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">최종 등급</span>
                    <span className={`text-2xl font-black ${getRank(gameState.moves, difficulty).color}`}>
                      {getRank(gameState.moves, difficulty).label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={initGame}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-100"
                  >
                    다시 하기
                  </button>
                  <button
                    onClick={() => setGameStarted(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-all"
                  >
                    메인으로
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
