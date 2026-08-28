import React, { useState, useEffect } from 'react';
import { Trophy, Star, ShieldAlert, Medal } from 'lucide-react';
import { BASE_URL } from '../services/api';

export default function BountyLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/bounties/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaders(data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800">
      <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
        <Trophy className="w-4 h-4" />
        <span>Community Trust Mesh Leaderboard</span>
      </div>
      
      <p className="text-xs text-slate-400 mb-6">
        Top actors earning Trust Score bounties for detecting anomalies and counterfeit scans, building our early-warning mesh.
      </p>

      {loading ? (
        <div className="text-center py-8 text-slate-500 animate-pulse text-xs">Loading Trust Scores...</div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
          <div className="text-sm font-bold text-slate-400">No Bounties Awarded Yet</div>
          <div className="text-xs text-slate-500 mt-1">Be the first to flag a suspicious scan!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((actor, idx) => (
            <div key={actor.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  idx === 0 ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' :
                  idx === 1 ? 'bg-slate-300 text-slate-900' :
                  idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{actor.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                    <span>{actor.role}</span>
                    <span>•</span>
                    <span className="font-mono">{actor.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center space-x-1 text-amber-400">
                <span className="text-lg font-bold">{actor.bounty_score}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
