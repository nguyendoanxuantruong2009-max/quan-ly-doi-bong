// app/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';

interface Team {
  id: number;
  name: string;
}

interface Match {
  id: number;
  home: number;
  away: number;
  homeScore: number;
  awayScore: number;
}

const initialTeams: Team[] = [
  { id: 1, name: 'FC Community' },
  { id: 2, name: 'FC Tech' },
  { id: 3, name: 'FC United' },
  { id: 4, name: 'FC Star' },
];

const initialMatches: Match[] = [
  { id: 1, home: 1, away: 2, homeScore: 0, awayScore: 0 },
  { id: 2, home: 3, away: 4, homeScore: 0, awayScore: 0 },
  { id: 3, home: 1, away: 3, homeScore: 0, awayScore: 0 },
  { id: 4, home: 2, away: 4, homeScore: 0, awayScore: 0 },
  { id: 5, home: 1, away: 4, homeScore: 0, awayScore: 0 },
  { id: 6, home: 2, away: 3, homeScore: 0, awayScore: 0 },
];

export default function FootballPage() {
  const [tab, setTab] = useState<'admin' | 'league'>('admin');
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [mounted, setMounted] = useState(false);

  // Khắc phục lỗi Hydration trong Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateScore = (id: number, field: 'homeScore' | 'awayScore', value: string) => {
    const numValue = parseInt(value) || 0;
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: numValue } : m));
  };

  const standings = useMemo(() => {
    const table = initialTeams.map(team => ({
      ...team,
      played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0,
    }));

    matches.forEach(m => {
      const home = table.find(t => t.id === m.home);
      const away = table.find(t => t.id === m.away);
      if (!home || !away) return;

      home.played++; away.played++;
      home.gf += m.homeScore; home.ga += m.awayScore;
      away.gf += m.awayScore; away.ga += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.win++; home.points += 3; away.lose++;
      } else if (m.homeScore < m.awayScore) {
        away.win++; away.points += 3; home.lose++;
      } else {
        home.draw++; away.draw++; home.points++; away.points++;
      }
    });

    return [...table].sort((a, b) => 
      b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
    );
  }, [matches]);

  const exportImage = async (id: number) => {
    const element = document.getElementById(`match-${id}`);
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `ket-qua-tran-${id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Lỗi xuất ảnh:", err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 p-6 text-white text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Giải Bóng Đá Tứ Hùng 2026</h1>
          <p className="text-blue-100 text-sm mt-1">Sân 7 người - Vòng tròn tính điểm</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button 
            onClick={() => setTab('admin')} 
            className={`flex-1 py-4 font-semibold transition ${tab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            ⚙️ Quản Trị Viên
          </button>
          <button 
            onClick={() => setTab('league')} 
            className={`flex-1 py-4 font-semibold transition ${tab === 'league' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            🏆 Bảng Xếp Hạng
          </button>
        </div>

        <div className="p-6">
          {tab === 'admin' && (
            <div className="grid gap-6 md:grid-cols-2">
              {matches.map(m => (
                <div key={m.id} className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 text-right font-bold text-gray-700">{initialTeams.find(t => t.id === m.home)?.name}</div>
                    <div className="flex items-center gap-2 mx-4">
                      <input 
                        type="number" 
                        min="0"
                        value={m.homeScore}
                        onChange={e => updateScore(m.id, 'homeScore', e.target.value)}
                        className="w-12 h-10 text-center border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      />
                      <span className="text-gray-400">:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={m.awayScore}
                        onChange={e => updateScore(m.id, 'awayScore', e.target.value)}
                        className="w-12 h-10 text-center border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      />
                    </div>
                    <div className="flex-1 text-left font-bold text-gray-700">{initialTeams.find(t => t.id === m.away)?.name}</div>
                  </div>

                  {/* Poster Preview */}
                  <div id={`match-${m.id}`} className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-lg text-white text-center shadow-inner">
                    <p className="text-[10px] uppercase opacity-80 mb-1">Kết quả trận đấu</p>
                    <div className="flex justify-around items-center">
                       <span className="text-lg font-black">{initialTeams.find(t => t.id === m.home)?.name}</span>
                       <span className="text-3xl font-black px-4">{m.homeScore} - {m.awayScore}</span>
                       <span className="text-lg font-black">{initialTeams.find(t => t.id === m.away)?.name}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => exportImage(m.id)} 
                    className="w-full mt-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    📸 Tải Poster Kết Quả
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'league' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 p-1.5 rounded-lg">📊</span> Bảng Xếp Hạng Chi Tiết
                </h2>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Đội bóng</th>
                        <th className="px-4 py-3 text-center">Trận</th>
                        <th className="px-4 py-3 text-center">T-H-B</th>
                        <th className="px-4 py-3 text-center">HS</th>
                        <th className="px-4 py-3 text-center text-blue-600">Điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {standings.map((t, i) => (
                        <tr key={t.id} className="hover:bg-blue-50/50 transition">
                          <td className="px-4 py-3 font-bold">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{t.name}</td>
                          <td className="px-4 py-3 text-center">{t.played}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{t.win}-{t.draw}-{t.lose}</td>
                          <td className="px-4 py-3 text-center font-mono">{t.gf - t.ga > 0 ? `+${t.gf - t.ga}` : t.gf - t.ga}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-700 text-base">{t.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 p-1.5 rounded-lg">📅</span> Lịch Thi Đấu & Kết Quả
                </h2>
                <div className="grid gap-3">
                  {matches.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition">
                      <span className="flex-1 font-medium">{initialTeams.find(t => t.id === m.home)?.name}</span>
                      <span className="px-4 py-1 bg-white border rounded-full font-bold text-blue-600 shadow-sm">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span className="flex-1 text-right font-medium">{initialTeams.find(t => t.id === m.away)?.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}