// app/page.tsx
'use client';

import { useState } from 'react';
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
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' },
  { id: 3, name: 'Team C' },
  { id: 4, name: 'Team D' },
];

const initialMatches: Match[] = [
  { id: 1, home: 1, away: 2, homeScore: 0, awayScore: 0 },
  { id: 2, home: 1, away: 3, homeScore: 0, awayScore: 0 },
  { id: 3, home: 1, away: 4, homeScore: 0, awayScore: 0 },
  { id: 4, home: 2, away: 3, homeScore: 0, awayScore: 0 },
  { id: 5, home: 2, away: 4, homeScore: 0, awayScore: 0 },
  { id: 6, home: 3, away: 4, homeScore: 0, awayScore: 0 },
];

export default function Page() {
  const [tab, setTab] = useState<'admin' | 'league'>('admin');
  const [matches, setMatches] = useState(initialMatches);

  const updateScore = (id: number, field: 'homeScore' | 'awayScore', value: number) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const calculateStandings = () => {
    const table = initialTeams.map(team => ({
      ...team,
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      gf: 0,
      ga: 0,
      points: 0,
    }));

    matches.forEach(m => {
      const home = table.find(t => t.id === m.home)!;
      const away = table.find(t => t.id === m.away)!;

      home.played++;
      away.played++;

      home.gf += m.homeScore;
      home.ga += m.awayScore;
      away.gf += m.awayScore;
      away.ga += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.win++; home.points += 3;
        away.lose++;
      } else if (m.homeScore < m.awayScore) {
        away.win++; away.points += 3;
        home.lose++;
      } else {
        home.draw++; away.draw++;
        home.points++; away.points++;
      }
    });

    return table.sort((a, b) =>
      b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)
    );
  };

  const exportImage = async (id: number) => {
    const element = document.getElementById(`match-${id}`);
    if (!element) return;
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `match-${id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const standings = calculateStandings();

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('admin')} className="px-4 py-2 bg-blue-500 text-white rounded">Quản trị</button>
        <button onClick={() => setTab('league')} className="px-4 py-2 bg-green-500 text-white rounded">Giải đấu</button>
      </div>

      {tab === 'admin' && (
        <div className="space-y-4">
          {matches.map(m => (
            <div key={m.id} className="p-4 border rounded shadow">
              <div className="flex justify-between items-center">
                <span>{initialTeams.find(t => t.id === m.home)?.name}</span>
                <input type="number" value={m.homeScore}
                  onChange={e => updateScore(m.id, 'homeScore', +e.target.value)}
                  className="w-16 text-center border mx-2" />
                <span>-</span>
                <input type="number" value={m.awayScore}
                  onChange={e => updateScore(m.id, 'awayScore', +e.target.value)}
                  className="w-16 text-center border mx-2" />
                <span>{initialTeams.find(t => t.id === m.away)?.name}</span>
              </div>

              <div id={`match-${m.id}`} className="mt-4 p-4 bg-gray-100 text-center rounded">
                <h3 className="font-bold">Match Result</h3>
                <p>
                  {initialTeams.find(t => t.id === m.home)?.name} {m.homeScore} - {m.awayScore} {initialTeams.find(t => t.id === m.away)?.name}
                </p>
              </div>

              <button onClick={() => exportImage(m.id)} className="mt-2 px-3 py-1 bg-purple-500 text-white rounded">
                Xuất ảnh
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'league' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Bảng xếp hạng</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th>#</th><th>Đội</th><th>Tr</th><th>T</th><th>H</th><th>B</th><th>HS</th><th>Điểm</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((t, i) => (
                <tr key={t.id} className="text-center border-t">
                  <td>{i + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.played}</td>
                  <td>{t.win}</td>
                  <td>{t.draw}</td>
                  <td>{t.lose}</td>
                  <td>{t.gf - t.ga}</td>
                  <td>{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-bold mt-6 mb-2">Lịch thi đấu</h2>
          <div className="space-y-2">
            {matches.map(m => (
              <div key={m.id} className="flex justify-between border p-2 rounded">
                <span>{initialTeams.find(t => t.id === m.home)?.name}</span>
                <span>{m.homeScore} - {m.awayScore}</span>
                <span>{initialTeams.find(t => t.id === m.away)?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
