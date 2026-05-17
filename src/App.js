import { useState, useEffect, useRef, useCallback } from ‘react’
import { supabase, MOD_PASSWORD } from ‘./supabase’

const G = {
bg: ‘#050508’, bg2: ‘#08080f’, panel: ‘#0f0f1a’, panel2: ‘#141428’,
border: ‘#1a1a30’, border2: ‘#222240’,
accent: ‘#2A6BFF’, success: ‘#00e5a0’, danger: ‘#ff3366’, warning: ‘#ffb800’,
text: ‘#eaeaf5’, text2: ‘#7878a0’, text3: ‘#3a3a60’,
}

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body { background: ${G.bg}; color: ${G.text}; font-family: ‘Syne’, sans-serif; overflow-x: hidden; }
body::before { content: ‘’; position: fixed; inset: 0; pointer-events: none; z-index: 9999; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,20,0.04) 2px, rgba(0,0,20,0.04) 4px); }
::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: ${G.border2}; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes glow { 0%,100% { box-shadow: 0 0 10px rgba(42,107,255,0.3); } 50% { box-shadow: 0 0 30px rgba(42,107,255,0.7); } }
@keyframes called { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
@keyframes timerPulse { 0%,100% { color: ${G.danger}; } 50% { color: #ff6688; } }
@keyframes summaryIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
.fade-in { animation: fadeIn 0.35s ease forwards; }

/* ENTRY */
.entry-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse 100% 80% at 50% -10%, rgba(42,107,255,0.12) 0%, transparent 60%), ${G.bg}; padding: 24px; }
.entry-box { width: 100%; max-width: 420px; background: ${G.panel}; border: 1px solid ${G.border}; padding: 48px 40px; position: relative; overflow: hidden; animation: fadeIn 0.4s ease; }
.entry-box::before { content: ‘’; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, ${G.accent}, transparent); animation: glow 2s infinite; }
.entry-logo { font-family: ‘JetBrains Mono’, monospace; font-size: 40px; font-weight: 700; letter-spacing: -2px; margin-bottom: 4px; }
.entry-logo span { color: ${G.accent}; text-shadow: 0 0 20px rgba(42,107,255,0.5); }
.entry-sub { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 3px; color: ${G.text2}; text-transform: uppercase; margin-bottom: 36px; }
.entry-label { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${G.text2}; margin-bottom: 8px; }
.entry-input { width: 100%; background: ${G.bg2}; border: 1px solid ${G.border}; color: ${G.text}; padding: 13px 16px; font-size: 15px; font-family: ‘Syne’, sans-serif; outline: none; transition: all 0.2s; margin-bottom: 16px; display: block; }
.entry-input:focus { border-color: ${G.accent}; box-shadow: 0 0 0 3px rgba(42,107,255,0.1); }
.entry-btn { width: 100%; border: none; padding: 15px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: ‘Syne’, sans-serif; transition: all 0.2s; }
.entry-btn-primary { background: ${G.accent}; color: #fff; } .entry-btn-primary:hover { background: #1a4fd4; }
.entry-err { color: ${G.danger}; font-size: 11px; margin-top: 10px; font-family: ‘JetBrains Mono’, monospace; }
.entry-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 1px solid ${G.border}; }
.entry-tab { flex: 1; padding: 10px; text-align: center; font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; color: ${G.text2}; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
.entry-tab.active { color: ${G.accent}; border-bottom-color: ${G.accent}; }

/* PARTICIPANT */
.pview { min-height: 100vh; background: ${G.bg}; }
.pview-header { background: ${G.panel}; border-bottom: 1px solid ${G.border}; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
.pview-logo { font-family: ‘JetBrains Mono’, monospace; font-size: 20px; font-weight: 700; letter-spacing: -1px; }
.pview-logo span { color: ${G.accent}; }
.pview-content { padding: 20px; }

/* CALLED */
.called-screen { position: fixed; inset: 0; background: ${G.bg}; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 500; padding: 24px; animation: called 0.5s ease; }
.called-icon { font-size: 80px; margin-bottom: 24px; animation: pulse 1s infinite; }
.called-title { font-size: 32px; font-weight: 800; color: ${G.success}; margin-bottom: 8px; text-align: center; }
.called-name { font-size: 20px; color: ${G.text2}; text-align: center; font-family: ‘JetBrains Mono’, monospace; }
.called-hint { font-size: 14px; color: ${G.text2}; margin-top: 24px; text-align: center; }

/* VOTE */
.vote-card { background: ${G.panel}; border: 1px solid ${G.border}; padding: 24px; margin-bottom: 16px; animation: slideUp 0.3s ease; }
.vote-card.active-vote { border-color: ${G.accent}; box-shadow: 0 0 20px rgba(42,107,255,0.1); }
.vote-question { font-size: 18px; font-weight: 700; margin-bottom: 20px; line-height: 1.4; }
.vote-buttons { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.vote-btn { padding: 16px 8px; border: 2px solid; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: ‘Syne’, sans-serif; transition: all 0.2s; text-align: center; }
.vote-btn-ano { border-color: ${G.success}; color: ${G.success}; background: transparent; }
.vote-btn-ano:hover, .vote-btn-ano.selected { background: ${G.success}; color: #000; }
.vote-btn-ne { border-color: ${G.danger}; color: ${G.danger}; background: transparent; }
.vote-btn-ne:hover, .vote-btn-ne.selected { background: ${G.danger}; color: #fff; }
.vote-btn-zdrzuji { border-color: ${G.warning}; color: ${G.warning}; background: transparent; }
.vote-btn-zdrzuji:hover, .vote-btn-zdrzuji.selected { background: ${G.warning}; color: #000; }
.vote-voted { text-align: center; padding: 16px; font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: ${G.success}; letter-spacing: 2px; }

/* SPEAKER */
.speaker-card { background: ${G.panel}; border: 1px solid ${G.border}; padding: 20px; margin-bottom: 16px; }
.speaker-queue-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: ${G.panel2}; border: 1px solid ${G.border}; margin-bottom: 8px; animation: fadeIn 0.2s ease; }

/* REACTIONS */
.reaction-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.reaction-btn { padding: 10px 16px; border: 1px solid ${G.border}; background: transparent; cursor: pointer; font-size: 20px; transition: all 0.2s; border-radius: 4px; }
.reaction-btn:hover { border-color: ${G.accent}; transform: scale(1.1); }
.reaction-btn.active-reaction { border-color: ${G.accent}; background: rgba(42,107,255,0.1); }

/* AGENDA */
.agenda-item { padding: 14px 18px; display: flex; align-items: center; gap: 14px; background: ${G.panel}; border: 1px solid ${G.border}; margin-bottom: 8px; transition: all 0.2s; cursor: pointer; }
.agenda-item.active-agenda { border-color: ${G.accent}; background: rgba(42,107,255,0.05); }
.agenda-num { font-family: ‘JetBrains Mono’, monospace; font-size: 18px; font-weight: 700; color: ${G.text3}; min-width: 32px; }
.agenda-item.active-agenda .agenda-num { color: ${G.accent}; }

/* DISPLAY */
.display { min-height: 100vh; background: ${G.bg}; display: flex; flex-direction: column; }
.display-header { padding: 20px 32px; background: ${G.panel}; border-bottom: 1px solid ${G.border}; display: flex; align-items: center; gap: 20px; }
.display-logo { font-family: ‘JetBrains Mono’, monospace; font-size: 28px; font-weight: 700; letter-spacing: -1px; }
.display-logo span { color: ${G.accent}; }
.display-content { flex: 1; padding: 32px; display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
.display-main { display: flex; flex-direction: column; gap: 20px; }
.display-side { display: flex; flex-direction: column; gap: 16px; }
.result-card { background: ${G.panel}; border: 1px solid ${G.border}; padding: 32px; }
.result-question { font-size: 24px; font-weight: 800; margin-bottom: 28px; line-height: 1.3; }
.result-bar-wrap { margin-bottom: 20px; }
.result-bar-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.result-bar-track { height: 16px; background: ${G.border}; position: relative; overflow: hidden; }
.result-bar-fill { height: 100%; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
.result-voters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.result-voter { font-family: ‘JetBrains Mono’, monospace; font-size: 11px; padding: 4px 10px; animation: fadeIn 0.3s ease; }
.voter-ano { background: rgba(0,229,160,0.12); color: ${G.success}; }
.voter-ne { background: rgba(255,51,102,0.12); color: ${G.danger}; }
.voter-zdrzuji { background: rgba(255,184,0,0.1); color: ${G.warning}; }
.display-speaker-card { background: ${G.panel}; border: 1px solid ${G.border}; padding: 24px; }
.display-called-card { background: rgba(0,229,160,0.05); border: 2px solid ${G.success}; padding: 28px; animation: called 0.5s ease; }
.display-called-name { font-size: 36px; font-weight: 800; color: ${G.success}; margin-bottom: 8px; }
.display-called-label { font-family: ‘JetBrains Mono’, monospace; font-size: 11px; color: ${G.success}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
.timer-display { font-family: ‘JetBrains Mono’, monospace; font-size: 64px; font-weight: 700; text-align: center; margin: 16px 0; }
.timer-green { color: ${G.success}; }
.timer-yellow { color: ${G.warning}; }
.timer-red { color: ${G.danger}; animation: timerPulse 0.5s infinite; }
.reactions-display { display: flex; flex-wrap: wrap; gap: 10px; }
.reaction-pill { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: ${G.panel2}; border: 1px solid ${G.border}; }
.participants-badge { display: flex; align-items: center; gap: 8px; }
.participants-dot { width: 8px; height: 8px; border-radius: 50%; background: ${G.success}; box-shadow: 0 0 6px ${G.success}; animation: pulse 1.5s infinite; }

/* SUMMARY SCREEN */
.summary-screen { position: fixed; inset: 0; background: rgba(5,5,8,0.97); z-index: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; animation: summaryIn 0.5s ease; }
.summary-title { font-family: ‘JetBrains Mono’, monospace; font-size: 14px; letter-spacing: 4px; color: ${G.accent}; text-transform: uppercase; margin-bottom: 16px; }
.summary-name { font-size: 40px; font-weight: 800; margin-bottom: 8px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 28px 0; width: 100%; max-width: 900px; }
.summary-stat { background: ${G.panel}; border: 1px solid ${G.border}; padding: 24px; text-align: center; }
.summary-stat-val { font-family: ‘JetBrains Mono’, monospace; font-size: 48px; font-weight: 700; margin-bottom: 4px; }
.summary-stat-label { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 2px; color: ${G.text2}; text-transform: uppercase; }
.summary-resolutions { width: 100%; max-width: 900px; }
.summary-resolution { padding: 16px 20px; background: ${G.panel}; border: 1px solid ${G.border}; margin-bottom: 8px; display: flex; gap: 16px; align-items: center; }
.summary-resolution-num { font-family: ‘JetBrains Mono’, monospace; font-size: 14px; color: ${G.accent}; min-width: 40px; }
.summary-resolution-text { font-size: 14px; flex: 1; }
.summary-resolution-result { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; font-weight: 700; }
.result-prijat { color: ${G.success}; }
.result-zamitnout { color: ${G.danger}; }
.result-nerozhodnut { color: ${G.warning}; }
.summary-countdown { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: ${G.text3}; margin-top: 20px; letter-spacing: 2px; }

/* MODERATOR */
.mod-wrap { min-height: 100vh; background: ${G.bg}; }
.mod-header { background: ${G.panel}; border-bottom: 1px solid ${G.border}; padding: 14px 24px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 100; flex-wrap: wrap; }
.mod-logo { font-family: ‘JetBrains Mono’, monospace; font-size: 22px; font-weight: 700; }
.mod-logo span { color: ${G.accent}; }
.mod-badge { background: ${G.danger}; color: #fff; font-family: ‘JetBrains Mono’, monospace; font-size: 9px; padding: 2px 8px; letter-spacing: 1px; }
.mod-content { padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.mod-panel { background: ${G.panel}; border: 1px solid ${G.border}; padding: 20px; margin-bottom: 16px; }
.mod-title { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: ${G.text2}; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.mod-title::after { content: ‘’; flex: 1; height: 1px; background: ${G.border}; }
.reaction-mod-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: ${G.panel2}; border: 1px solid ${G.border}; margin-bottom: 6px; animation: fadeIn 0.2s ease; }

/* FORMS */
.fi { width: 100%; background: ${G.bg2}; border: 1px solid ${G.border}; color: ${G.text}; padding: 10px 14px; font-size: 13px; font-family: ‘Syne’, sans-serif; outline: none; transition: all 0.2s; margin-bottom: 10px; display: block; }
.fi:focus { border-color: ${G.accent}; }
.fs { width: 100%; background: ${G.bg2}; border: 1px solid ${G.border}; color: ${G.text2}; padding: 10px 14px; font-size: 12px; font-family: ‘Syne’, sans-serif; outline: none; cursor: pointer; margin-bottom: 10px; display: block; }
.btn { border: none; padding: 10px 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; font-family: ‘Syne’, sans-serif; transition: all 0.2s; }
.btn-p { background: ${G.accent}; color: #fff; } .btn-p:hover { background: #1a4fd4; }
.btn-s { background: ${G.success}; color: #000; } .btn-s:hover { opacity: 0.85; }
.btn-d { background: ${G.danger}; color: #fff; } .btn-d:hover { opacity: 0.85; }
.btn-w { background: ${G.warning}; color: #000; } .btn-w:hover { opacity: 0.85; }
.btn-g { background: transparent; border: 1px solid ${G.border}; color: ${G.text2}; }
.btn-g:hover { border-color: ${G.text2}; color: ${G.text}; }
.btn-full { width: 100%; margin-bottom: 8px; }
.call-btn { padding: 10px 16px; background: ${G.success}; color: #000; border: none; cursor: pointer; font-size: 11px; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; }
.call-btn:hover { opacity: 0.85; }
.done-btn { padding: 10px 16px; background: transparent; border: 1px solid ${G.border}; color: ${G.text2}; cursor: pointer; font-size: 11px; font-weight: 700; transition: all 0.2s; }
.done-btn:hover { border-color: ${G.danger}; color: ${G.danger}; }

/* HISTORY */
.history-item { padding: 16px; background: ${G.panel}; border: 1px solid ${G.border}; margin-bottom: 10px; }

/* UTILS */
.loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.sec { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: ${G.text2}; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.sec::after { content: ‘’; flex: 1; height: 1px; background: ${G.border}; }
.div { height: 1px; background: ${G.border}; margin: 16px 0; }
.participants-count { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: ${G.text2}; }

@media (max-width: 900px) {
.mod-content { grid-template-columns: 1fr; }
.display-content { grid-template-columns: 1fr; }
.vote-buttons { grid-template-columns: 1fr; }
.timer-display { font-size: 48px; }
.summary-grid { grid-template-columns: 1fr 1fr; }
}
`

const formatTimer = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

const getResolutionResult = (poll) => {
const votes = poll.vote_responses || []
const ano = votes.filter(v => v.vote === ‘ano’).length
const ne = votes.filter(v => v.vote === ‘ne’).length
if (ano > ne) return { text: ‘PŘIJATO’, cls: ‘result-prijat’ }
if (ne > ano) return { text: ‘ZAMÍTNUTO’, cls: ‘result-zamitnout’ }
return { text: ‘NEROZHODNUTO’, cls: ‘result-nerozhodnut’ }
}

// – PDF EXPORT –
const generatePDF = (session, polls, speakers, agenda, participants) => {
const now = new Date()
const dateStr = now.toLocaleDateString(‘cs-CZ’, { day: ‘numeric’, month: ‘long’, year: ‘numeric’ })
const timeStr = now.toLocaleTimeString(‘cs-CZ’, { hour: ‘2-digit’, minute: ‘2-digit’ })
const doneSpeakers = speakers.filter(s => s.status === ‘done’ || s.status === ‘called’)
const closedPolls = polls.filter(p => p.status === ‘closed’)

const html = `<!DOCTYPE html>

<html lang="cs">
<head>
<meta charset="utf-8">
<title>Protokol - ${session.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; color: #111; background: #fff; padding: 40px; font-size: 13px; line-height: 1.5; }
  .header { border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 28px; }
  .header-logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
  .header-logo span { color: #2A6BFF; }
  .header-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .header-meta { font-size: 12px; color: #666; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 14px; font-weight: 700; }
  .stats-row { display: flex; gap: 20px; margin-bottom: 20px; }
  .stat-box { border: 1px solid #ddd; padding: 14px 20px; flex: 1; text-align: center; }
  .stat-val { font-size: 32px; font-weight: 900; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
  .agenda-item { padding: 8px 12px; border-left: 3px solid #ddd; margin-bottom: 6px; }
  .agenda-item.active { border-left-color: #2A6BFF; }
  .poll-block { border: 1px solid #ddd; padding: 16px; margin-bottom: 14px; }
  .poll-question { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
  .poll-resolution { font-size: 13px; font-weight: 700; margin-bottom: 8px; padding: 6px 12px; display: inline-block; }
  .res-prijato { background: #e8fdf5; color: #00a36c; }
  .res-zamitnuto { background: #fff0f3; color: #cc2244; }
  .res-nerozhodnut { background: #fffbf0; color: #cc7700; }
  .vote-row { display: flex; gap: 20px; margin-bottom: 8px; }
  .vote-count { font-size: 13px; font-weight: 700; }
  .vote-ano { color: #00a36c; }
  .vote-ne { color: #cc2244; }
  .vote-zdrzuji { color: #cc7700; }
  .voters-list { font-size: 11px; color: #555; margin-top: 6px; }
  .speaker-item { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; display: flex; gap: 12px; }
  .speaker-num { color: #2A6BFF; font-weight: 700; min-width: 24px; }
  .participant-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .participant-tag { background: #f5f5f5; padding: 4px 10px; font-size: 11px; border-radius: 2px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; display: flex; justify-content: space-between; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-logo">[<span>CTRL</span>]</div>
  <div class="header-title">Protokol z konference</div>
  <div style="font-size:18px; font-weight:800; margin:6px 0;">${session.title}</div>
  <div class="header-meta">Datum: ${dateStr} . Čas vygenerování: ${timeStr} . PIN: ${session.pin}</div>
</div>

<div class="section">
  <div class="section-title">Souhrn</div>
  <div class="stats-row">
    <div class="stat-box"><div class="stat-val">${participants.length}</div><div class="stat-label">Účastníků</div></div>
    <div class="stat-box"><div class="stat-val">${closedPolls.length}</div><div class="stat-label">Hlasování</div></div>
    <div class="stat-box"><div class="stat-val">${doneSpeakers.length}</div><div class="stat-label">Řečníků</div></div>
    <div class="stat-box"><div class="stat-val">${agenda.length}</div><div class="stat-label">Bodů programu</div></div>
  </div>
</div>

${agenda.length > 0 ? `

<div class="section">
  <div class="section-title">Program jednání</div>
  ${agenda.map(a => `<div class="agenda-item${a.active ? ' active' : ''}"><strong>${a.order_num}. ${a.title}</strong>${a.description ? `<br><span style="color:#666;font-size:12px">${a.description}</span>` : ''}</div>`).join('')}
</div>` : ''}

${closedPolls.length > 0 ? `

<div class="section">
  <div class="section-title">Výsledky hlasování a usnesení</div>
  ${closedPolls.map((poll, i) => {
    const votes = poll.vote_responses || []
    const ano = votes.filter(v => v.vote === 'ano').length
    const ne = votes.filter(v => v.vote === 'ne').length
    const zdrzuji = votes.filter(v => v.vote === 'zdrzuji_se').length
    const res = getResolutionResult(poll)
    const anoVoters = votes.filter(v => v.vote === 'ano').map(v => v.voter_name).join(', ')
    const neVoters = votes.filter(v => v.vote === 'ne').map(v => v.voter_name).join(', ')
    const zdrzVoters = votes.filter(v => v.vote === 'zdrzuji_se').map(v => v.voter_name).join(', ')
    return `<div class="poll-block">
      <div style="font-size:11px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Usnesení č. ${i+1}</div>
      <div class="poll-question">${poll.question}</div>
      <div class="poll-resolution res-${res.text === 'PŘIJATO' ? 'prijato' : res.text === 'ZAMÍTNUTO' ? 'zamitnuto' : 'nerozhodnut'}">${res.text}</div>
      <div class="vote-row" style="margin-top:10px">
        <span class="vote-count vote-ano">ANO: ${ano}</span>
        <span class="vote-count vote-ne">NE: ${ne}</span>
        <span class="vote-count vote-zdrzuji">ZDRŽEL SE: ${zdrzuji}</span>
        <span style="color:#999;font-size:12px">Celkem: ${votes.length}</span>
      </div>
      ${anoVoters ? `<div class="voters-list"><strong style="color:#00a36c">ANO:</strong> ${anoVoters}</div>` : ''}
      ${neVoters ? `<div class="voters-list"><strong style="color:#cc2244">NE:</strong> ${neVoters}</div>` : ''}
      ${zdrzVoters ? `<div class="voters-list"><strong style="color:#cc7700">ZDRŽEL SE:</strong> ${zdrzVoters}</div>` : ''}
    </div>`
  }).join('')}
</div>` : ''}

${doneSpeakers.length > 0 ? `

<div class="section">
  <div class="section-title">Řečníci</div>
  ${doneSpeakers.map((s, i) => `<div class="speaker-item"><div class="speaker-num">${i+1}.</div><div><strong>${s.name}</strong>${s.note ? `<br><span style="color:#666;font-size:12px;font-style:italic">"${s.note}"</span>` : ''}</div></div>`).join('')}
</div>` : ''}

<div class="section">
  <div class="section-title">Účastníci (${participants.length})</div>
  <div class="participant-list">
    ${participants.map(p => `<span class="participant-tag">${p.name}</span>`).join('')}
  </div>
</div>

<div class="footer">
  <span>CTRL Europe Team - Hlasovací systém</span>
  <span>Vygenerováno: ${dateStr} v ${timeStr}</span>
</div>
</body>
</html>`

const win = window.open(’’, ‘_blank’)
win.document.write(html)
win.document.close()
setTimeout(() => win.print(), 500)
}

// – ENTRY –
function EntryScreen({ onParticipant, onModerator, onDisplay }) {
const [tab, setTab] = useState(‘participant’)
const [name, setName] = useState(’’)
const [pin, setPin] = useState(’’)
const [modPass, setModPass] = useState(’’)
const [error, setError] = useState(’’)
const [loading, setLoading] = useState(false)
const [sessions, setSessions] = useState([])
const [selectedSession, setSelectedSession] = useState(’’)

useEffect(() => {
supabase.from(‘vote_sessions’).select(’*’).eq(‘active’, true).then(({ data }) => { if (data) setSessions(data) })
}, [])

const joinAsParticipant = async () => {
if (!name.trim()) return setError(’// Zadej své jméno’)
if (!pin.trim()) return setError(’// Zadej PIN konference’)
setLoading(true); setError(’’)
const { data: session } = await supabase.from(‘vote_sessions’).select(’*’).eq(‘pin’, pin).eq(‘active’, true).single()
if (!session) { setError(’// Nesprávný PIN nebo konference není aktivní’); setLoading(false); return }
const { data: participant } = await supabase.from(‘vote_participants’).insert([{ session_id: session.id, name: name.trim() }]).select().single()
onParticipant({ session, participant })
setLoading(false)
}

const joinAsModerator = () => {
if (modPass !== MOD_PASSWORD) return setError(’// Nesprávné heslo moderátora’)
onModerator()
}

const openDisplay = () => {
if (!selectedSession) return setError(’// Vyber konferenci’)
const session = sessions.find(s => s.id === parseInt(selectedSession))
onDisplay(session)
}

return (
<div className="entry-wrap">
<div className="entry-box">
<div className="entry-logo">[<span>CTRL</span>]</div>
<div className="entry-sub">Hlasovací systém . Conference</div>
<div className="entry-tabs">
{[[‘participant’,‘Účastník’],[‘display’,‘Obrazovka’],[‘moderator’,‘Moderátor’]].map(([id,label]) => (
<div key={id} className={`entry-tab${tab===id?' active':''}`} onClick={() => { setTab(id); setError(’’) }}>{label}</div>
))}
</div>
{tab === ‘participant’ && (
<div className="fade-in">
<div className="entry-label">Tvoje jméno</div>
<input className=“entry-input” placeholder=“Jan Novák” value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key===‘Enter’ && joinAsParticipant()} />
<div className="entry-label">PIN konference</div>
<input className=“entry-input” placeholder=“XXXX” value={pin} onChange={e => setPin(e.target.value.toUpperCase())} onKeyDown={e => e.key===‘Enter’ && joinAsParticipant()} style={{ letterSpacing:4, fontSize:20, textAlign:‘center’ }} />
<button className="entry-btn entry-btn-primary" onClick={joinAsParticipant} disabled={loading}>{loading ? ‘PŘIPOJUJI…’ : ‘VSTOUPIT >’}</button>
</div>
)}
{tab === ‘display’ && (
<div className="fade-in">
<div className="entry-label">Vyber konferenci</div>
<select className=“fi” value={selectedSession} onChange={e => setSelectedSession(e.target.value)} style={{ marginBottom:16 }}>
<option value="">– Vyber konferenci –</option>
{sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
</select>
<button className="entry-btn entry-btn-primary" onClick={openDisplay}>OTEVŘÍT OBRAZOVKU ></button>
</div>
)}
{tab === ‘moderator’ && (
<div className="fade-in">
<div className="entry-label">Heslo moderátora</div>
<input className=“entry-input” type=“password” placeholder=”**********” value={modPass} onChange={e => setModPass(e.target.value)} onKeyDown={e => e.key===‘Enter’ && joinAsModerator()} />
<button className="entry-btn entry-btn-primary" onClick={joinAsModerator}>VSTOUPIT JAKO MODERÁTOR ></button>
</div>
)}
{error && <div className="entry-err">{error}</div>}
</div>
</div>
)
}

// – PARTICIPANT –
function ParticipantView({ session, participant }) {
const [polls, setPolls] = useState([])
const [myVotes, setMyVotes] = useState({})
const [speakers, setSpeakers] = useState([])
const [agenda, setAgenda] = useState([])
const [myReaction, setMyReaction] = useState(null)
const [showSpeakerForm, setShowSpeakerForm] = useState(false)
const [speakerNote, setSpeakerNote] = useState(’’)
const [isCalled, setIsCalled] = useState(false)
const [requested, setRequested] = useState(false)
const [sessionClosed, setSessionClosed] = useState(false)

const load = useCallback(async () => {
const [{ data: p }, { data: s }, { data: a }, { data: sess }] = await Promise.all([
supabase.from(‘vote_polls’).select(’*, vote_responses(*)’).eq(‘session_id’, session.id).order(‘created_at’),
supabase.from(‘vote_speakers’).select(’*’).eq(‘session_id’, session.id).in(‘status’, [‘waiting’,‘called’]).order(‘requested_at’),
supabase.from(‘vote_agenda’).select(’*’).eq(‘session_id’, session.id).order(‘order_num’),
supabase.from(‘vote_sessions’).select(’*’).eq(‘id’, session.id).single(),
])
if (p) setPolls(p)
if (s) setSpeakers(s)
if (a) setAgenda(a)
if (sess && !sess.active) setSessionClosed(true)
const mySpeaker = s?.find(sp => sp.participant_id === participant.id && sp.status === ‘called’)
if (mySpeaker) setIsCalled(true)
const myReq = s?.find(sp => sp.participant_id === participant.id && sp.status === ‘waiting’)
if (myReq) setRequested(true)
}, [session.id, participant.id])

useEffect(() => {
load()
const channel = supabase.channel(`p-${session.id}-${participant.id}`)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_polls’ }, load)
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_responses’ }, load)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_speakers’ }, load)
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_sessions’ }, load)
.subscribe()
return () => supabase.removeChannel(channel)
}, [load, session.id, participant.id])

const castVote = async (pollId, vote) => {
if (myVotes[pollId]) return
await supabase.from(‘vote_responses’).insert([{ poll_id: pollId, voter_name: participant.name, vote }])
setMyVotes(prev => ({ …prev, [pollId]: vote }))
}

const requestSpeaker = async () => {
if (requested) return
await supabase.from(‘vote_speakers’).insert([{ session_id: session.id, participant_id: participant.id, name: participant.name, note: speakerNote, status: ‘waiting’ }])
setRequested(true); setShowSpeakerForm(false); setSpeakerNote(’’)
}

const sendReaction = async (reaction) => {
const newReaction = myReaction === reaction ? null : reaction
setMyReaction(newReaction)
await supabase.from(‘vote_participants’).update({ reaction: newReaction, reaction_at: new Date().toISOString() }).eq(‘id’, participant.id)
}

if (sessionClosed) return (
<>
<style>{css}</style>
<div className=“called-screen” style={{ background: G.bg }}>
<div style={{ fontSize: 60, marginBottom: 20 }}></div>
<div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Konference ukončena</div>
<div style={{ color: G.text2, fontFamily: ‘JetBrains Mono, monospace’, fontSize: 13 }}>Děkujeme za účast</div>
</div>
</>
)

if (isCalled) return (
<>
<style>{css}</style>
<div className="called-screen">
<div className="called-icon"></div>
<div className="called-title">Jsi vyvolán!</div>
<div className="called-name">{participant.name}</div>
<div className="called-hint">Začni mluvit - moderátor spustí časomíru</div>
<button className=“btn btn-g” style={{ marginTop: 32 }} onClick={() => setIsCalled(false)}>Zpět</button>
</div>
</>
)

const activePolls = polls.filter(p => p.status === ‘active’)
const closedPolls = polls.filter(p => p.status === ‘closed’)
const activeAgenda = agenda.find(a => a.active)
const waitingSpeakers = speakers.filter(s => s.status === ‘waiting’)

return (
<>
<style>{css}</style>
<div className="pview">
<div className="pview-header">
<div><div className="pview-logo">[<span>CTRL</span>]</div><div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:10, color:G.text2 }}>{session.title}</div></div>
<div style={{ textAlign:‘right’ }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, color:G.accent }}>{participant.name}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.text3, letterSpacing:1 }}>ÚČASTNÍK</div>
</div>
</div>
<div className="pview-content">
{activeAgenda && (
<div style={{ background:‘rgba(42,107,255,0.05)’, border:`1px solid rgba(42,107,255,0.3)`, padding:‘14px 18px’, marginBottom:16 }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.accent, letterSpacing:2, textTransform:‘uppercase’, marginBottom:4 }}>Aktuální bod</div>
<div style={{ fontSize:15, fontWeight:700 }}>{activeAgenda.title}</div>
{activeAgenda.description && <div style={{ fontSize:12, color:G.text2, marginTop:3 }}>{activeAgenda.description}</div>}
</div>
)}
{activePolls.map(poll => (
<div key={poll.id} className="vote-card active-vote">
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.accent, letterSpacing:2, textTransform:‘uppercase’, marginBottom:8 }}>
<span style={{ animation:‘pulse 1s infinite’, display:‘inline-block’ }}>*</span> AKTIVNÍ HLASOVÁNÍ
</div>
<div className="vote-question">{poll.question}</div>
{myVotes[poll.id] ? (
<div className="vote-voted">v Hlasoval/a jsi: {myVotes[poll.id].toUpperCase().replace(’_SE’,’’)}</div>
) : (
<div className="vote-buttons">
{[[‘ano’,‘ANO v’,‘vote-btn-ano’],[‘ne’,‘NE x’,‘vote-btn-ne’],[‘zdrzuji_se’,‘ZDRŽUJI SE’,‘vote-btn-zdrzuji’]].map(([val,label,cls]) => (
<button key={val} className={`vote-btn ${cls}`} onClick={() => castVote(poll.id, val)}>{label}</button>
))}
</div>
)}
</div>
))}
<div className="speaker-card">
<div className="sec">REAKCE</div>
<div className="reaction-bar">
{[[’’,‘souhlas’],[’’,‘namitka’],[’’,‘otazka’]].map(([icon,type]) => (
<button key={type} className={`reaction-btn${myReaction===type?' active-reaction':''}`} onClick={() => sendReaction(type)}>{icon}</button>
))}
{myReaction && <button className=“btn btn-g” style={{ fontSize:11 }} onClick={() => sendReaction(null)}>Zrušit</button>}
</div>
</div>
<div className="speaker-card">
<div className="sec">PŘIHLÁSIT SE O SLOVO</div>
{!requested ? (
showSpeakerForm ? (
<div>
<input className=“fi” placeholder=“Poznámka k projevu (volitelné)…” value={speakerNote} onChange={e => setSpeakerNote(e.target.value)} />
<div style={{ display:‘flex’, gap:8 }}>
<button className="btn btn-p" onClick={requestSpeaker}>PŘIHLÁSIT SE</button>
<button className=“btn btn-g” onClick={() => setShowSpeakerForm(false)}>ZRUŠIT</button>
</div>
</div>
) : (
<button className=“btn btn-p btn-full” onClick={() => setShowSpeakerForm(true)}> PŘIHLÁSIT SE O SLOVO</button>
)
) : (
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, color:G.warning, padding:‘12px 0’ }}>… Jsi v pořadí - čekej na vyvolání</div>
)}
{waitingSpeakers.length > 0 && (
<div style={{ marginTop:16 }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.text3, letterSpacing:2, textTransform:‘uppercase’, marginBottom:10 }}>Fronta</div>
{waitingSpeakers.map((s,i) => (
<div key={s.id} className="speaker-queue-item">
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:18, fontWeight:700, color:G.accent, minWidth:28 }}>{i+1}</div>
<div><div style={{ fontSize:14, fontWeight:600 }}>{s.name}</div>{s.note && <div style={{ fontSize:11, color:G.text2 }}>{s.note}</div>}</div>
</div>
))}
</div>
)}
</div>
{closedPolls.length > 0 && (
<div>
<div className="sec">VÝSLEDKY HLASOVÁNÍ</div>
{closedPolls.map((poll, i) => {
const votes = poll.vote_responses || []
const ano = votes.filter(v => v.vote===‘ano’).length
const ne = votes.filter(v => v.vote===‘ne’).length
const zdrzuji = votes.filter(v => v.vote===‘zdrzuji_se’).length
const res = getResolutionResult(poll)
return (
<div key={poll.id} className="history-item">
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.text3, letterSpacing:1, marginBottom:4 }}>USNESENÍ Č. {i+1}</div>
<div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>{poll.question}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, fontWeight:700, marginBottom:6 }} className={res.cls}>{res.text}</div>
<div style={{ display:‘flex’, gap:16 }}>
<span style={{ color:G.success }}>ANO: {ano}</span>
<span style={{ color:G.danger }}>NE: {ne}</span>
<span style={{ color:G.warning }}>ZDRŽEL: {zdrzuji}</span>
</div>
</div>
)
})}
</div>
)}
</div>
</div>
</>
)
}

// – DISPLAY –
function DisplayScreen({ session }) {
const [polls, setPolls] = useState([])
const [speakers, setSpeakers] = useState([])
const [agenda, setAgenda] = useState([])
const [reactions, setReactions] = useState([])
const [participants, setParticipants] = useState([])
const [timerSeconds, setTimerSeconds] = useState(120)
const [timerRunning, setTimerRunning] = useState(false)
const [showSummary, setShowSummary] = useState(false)
const [summaryCountdown, setSummaryCountdown] = useState(60)
const timerRef = useRef(null)
const summaryRef = useRef(null)

const load = useCallback(async () => {
const [{ data: p }, { data: s }, { data: a }, { data: r }, { data: part }, { data: sess }] = await Promise.all([
supabase.from(‘vote_polls’).select(’*, vote_responses(*)’).eq(‘session_id’, session.id).order(‘created_at’),
supabase.from(‘vote_speakers’).select(’*’).eq(‘session_id’, session.id).order(‘requested_at’),
supabase.from(‘vote_agenda’).select(’*’).eq(‘session_id’, session.id).order(‘order_num’),
supabase.from(‘vote_participants’).select(’*’).eq(‘session_id’, session.id).not(‘reaction’, ‘is’, null),
supabase.from(‘vote_participants’).select(’*’).eq(‘session_id’, session.id),
supabase.from(‘vote_sessions’).select(’*’).eq(‘id’, session.id).single(),
])
if (p) setPolls(p)
if (s) setSpeakers(s)
if (a) setAgenda(a)
if (r) setReactions(r)
if (part) setParticipants(part)
if (sess && !sess.active) setShowSummary(true)
}, [session.id])

useEffect(() => {
load()
const channel = supabase.channel(`display-${session.id}`)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_polls’ }, load)
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_responses’ }, load)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_speakers’ }, load)
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_agenda’ }, load)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_participants’ }, load)
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_sessions’ }, load)
.subscribe()
return () => supabase.removeChannel(channel)
}, [load, session.id])

// Sync timer from DB
useEffect(() => {
const channel = supabase.channel(`timer-${session.id}`)
.on(‘broadcast’, { event: ‘timer_sync’ }, ({ payload }) => {
setTimerSeconds(payload.seconds)
setTimerRunning(payload.running)
}).subscribe()
return () => supabase.removeChannel(channel)
}, [session.id])

useEffect(() => {
if (timerRunning && timerSeconds > 0) {
timerRef.current = setInterval(() => setTimerSeconds(s => s - 1), 1000)
} else {
clearInterval(timerRef.current)
}
return () => clearInterval(timerRef.current)
}, [timerRunning, timerSeconds])

// Summary countdown
useEffect(() => {
if (showSummary) {
summaryRef.current = setInterval(() => setSummaryCountdown(c => c - 1), 1000)
}
return () => clearInterval(summaryRef.current)
}, [showSummary])

const activePoll = polls.find(p => p.status === ‘active’)
const calledSpeaker = speakers.find(s => s.status === ‘called’)
const waitingSpeakers = speakers.filter(s => s.status === ‘waiting’)
const activeAgenda = agenda.find(a => a.active)
const timerColor = timerSeconds > 60 ? ‘timer-green’ : timerSeconds > 30 ? ‘timer-yellow’ : ‘timer-red’
const closedPolls = polls.filter(p => p.status === ‘closed’)

const getVoteCount = (poll, type) => (poll.vote_responses || []).filter(v => v.vote === type).length
const getVotePercent = (poll, type) => { const t = (poll.vote_responses || []).length; return t === 0 ? 0 : Math.round((getVoteCount(poll, type)/t)*100) }

if (showSummary) return (
<>
<style>{css}</style>
<div className="summary-screen">
<div className="summary-title">Konference ukončena</div>
<div className="summary-name">{session.title}</div>
<div className="summary-grid">
<div className="summary-stat"><div className=“summary-stat-val” style={{ color:G.accent }}>{participants.length}</div><div className="summary-stat-label">Účastníků</div></div>
<div className="summary-stat"><div className=“summary-stat-val” style={{ color:G.success }}>{closedPolls.length}</div><div className="summary-stat-label">Hlasování</div></div>
<div className="summary-stat"><div className=“summary-stat-val” style={{ color:G.warning }}>{speakers.filter(s=>s.status===‘done’).length}</div><div className="summary-stat-label">Řečníků</div></div>
</div>
{closedPolls.length > 0 && (
<div className="summary-resolutions">
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, color:G.text2, letterSpacing:3, textTransform:‘uppercase’, marginBottom:12 }}>USNESENÍ</div>
{closedPolls.map((poll, i) => {
const res = getResolutionResult(poll)
const votes = poll.vote_responses || []
return (
<div key={poll.id} className="summary-resolution">
<div className="summary-resolution-num">#{i+1}</div>
<div className="summary-resolution-text">{poll.question}</div>
<div style={{ textAlign:‘right’ }}>
<div className={`summary-resolution-result ${res.cls}`}>{res.text}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:11, color:G.text2 }}>
{votes.filter(v=>v.vote===‘ano’).length}:{votes.filter(v=>v.vote===‘ne’).length}:{votes.filter(v=>v.vote===‘zdrzuji_se’).length}
</div>
</div>
</div>
)
})}
</div>
)}
<div className="summary-countdown">Obrazovka se uzavře za {summaryCountdown} sekund</div>
</div>
</>
)

return (
<>
<style>{css}</style>
<div className="display">
<div className="display-header">
<div className="display-logo">[<span>CTRL</span>]</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, color:G.text2, letterSpacing:2 }}>{session.title.toUpperCase()}</div>
<div className=“participants-badge” style={{ marginLeft:‘auto’ }}>
<div className="participants-dot" />
<span className="participants-count">{participants.length} účastníků</span>
</div>
</div>
<div className="display-content">
<div className="display-main">
{activeAgenda && (
<div style={{ background:‘rgba(42,107,255,0.05)’, border:`1px solid rgba(42,107,255,0.3)`, padding:‘20px 24px’ }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:10, color:G.accent, letterSpacing:3, textTransform:‘uppercase’, marginBottom:6 }}>Aktuální bod jednání</div>
<div style={{ fontSize:22, fontWeight:800 }}>{activeAgenda.title}</div>
{activeAgenda.description && <div style={{ fontSize:14, color:G.text2, marginTop:4 }}>{activeAgenda.description}</div>}
</div>
)}
{calledSpeaker && (
<div className="display-called-card">
<div className="display-called-label"> Právě mluví</div>
<div className="display-called-name">{calledSpeaker.name}</div>
{calledSpeaker.note && <div style={{ fontSize:16, color:G.text2, fontStyle:‘italic’ }}>”{calledSpeaker.note}”</div>}
<div className={`timer-display ${timerColor}`}>{formatTimer(timerSeconds)}</div>
</div>
)}
{activePoll && (
<div className=“result-card” style={{ border:`1px solid ${G.accent}`, boxShadow:‘0 0 20px rgba(42,107,255,0.1)’ }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:10, color:G.accent, letterSpacing:3, textTransform:‘uppercase’, marginBottom:12 }}>
<span style={{ animation:‘pulse 1s infinite’, display:‘inline-block’ }}>*</span> AKTIVNÍ HLASOVÁNÍ . {(activePoll.vote_responses||[]).length} hlasů
</div>
<div className="result-question">{activePoll.question}</div>
{[[‘ano’,G.success,‘ANO’],[‘ne’,G.danger,‘NE’],[‘zdrzuji_se’,G.warning,‘ZDRŽEL SE’]].map(([type,color,label]) => (
<div key={type} className="result-bar-wrap">
<div className="result-bar-label">
<div style={{ fontSize:16, fontWeight:700, color }}>{label}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:20, fontWeight:700, color }}>{getVoteCount(activePoll,type)}</div>
</div>
<div className="result-bar-track">
<div className=“result-bar-fill” style={{ width:`${getVotePercent(activePoll,type)}%`, background:color }} />
</div>
<div className="result-voters">
{(activePoll.vote_responses||[]).filter(v=>v.vote===type).map(v => (
<span key={v.id} className={`result-voter voter-${type.replace('_se','').replace('_','')}`}>{v.voter_name}</span>
))}
</div>
</div>
))}
</div>
)}
{closedPolls.map((poll,i) => {
const res = getResolutionResult(poll)
return (
<div key={poll.id} className="result-card">
<div style={{ display:‘flex’, justifyContent:‘space-between’, alignItems:‘flex-start’, marginBottom:12 }}>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:10, color:G.text3, letterSpacing:2, textTransform:‘uppercase’ }}>USNESENÍ Č. {i+1}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, fontWeight:700 }} className={res.cls}>{res.text}</div>
</div>
<div style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>{poll.question}</div>
<div style={{ display:‘flex’, gap:20 }}>
<span style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:16, color:G.success }}>ANO: {getVoteCount(poll,‘ano’)}</span>
<span style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:16, color:G.danger }}>NE: {getVoteCount(poll,‘ne’)}</span>
<span style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:16, color:G.warning }}>ZDRŽEL: {getVoteCount(poll,‘zdrzuji_se’)}</span>
</div>
</div>
)
})}
</div>
<div className="display-side">
{reactions.length > 0 && (
<div className="display-speaker-card">
<div className="sec">REAKCE PUBLIKA</div>
<div className="reactions-display">
{reactions.map(r => (
<div key={r.id} className="reaction-pill">
<span style={{ fontSize:18 }}>{r.reaction===‘souhlas’?’’:r.reaction===‘namitka’?’’:’’}</span>
<span style={{ fontSize:12, color:G.text2 }}>{r.name}</span>
</div>
))}
</div>
</div>
)}
<div className="display-speaker-card">
<div className="sec">FRONTA ({waitingSpeakers.length})</div>
{waitingSpeakers.length===0 && <div style={{ color:G.text3, fontSize:13, fontFamily:‘JetBrains Mono,monospace’ }}>Nikdo není přihlášen</div>}
{waitingSpeakers.map((s,i) => (
<div key={s.id} className="speaker-queue-item">
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:18, fontWeight:700, color:G.accent, minWidth:28 }}>{i+1}</div>
<div><div style={{ fontSize:14, fontWeight:600 }}>{s.name}</div>{s.note && <div style={{ fontSize:11, color:G.text2, fontStyle:‘italic’ }}>{s.note}</div>}</div>
</div>
))}
</div>
<div className="display-speaker-card">
<div className="sec">PROGRAM</div>
{agenda.map(item => (
<div key={item.id} className={`agenda-item${item.active?' active-agenda':''}`}>
<div className="agenda-num">{item.order_num}</div>
<div><div style={{ fontSize:13, fontWeight:600 }}>{item.title}</div>{item.description && <div style={{ fontSize:11, color:G.text2 }}>{item.description}</div>}</div>
{item.active && <span style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, padding:‘2px 8px’, background:‘rgba(42,107,255,0.12)’, color:G.accent, marginLeft:‘auto’ }}>AKTIVNÍ</span>}
</div>
))}
</div>
</div>
</div>
</div>
</>
)
}

// – MODERATOR –
function ModeratorView() {
const [sessions, setSessions] = useState([])
const [activeSession, setActiveSession] = useState(null)
const [polls, setPolls] = useState([])
const [speakers, setSpeakers] = useState([])
const [agenda, setAgenda] = useState([])
const [participants, setParticipants] = useState([])
const [reactions, setReactions] = useState([])
const [newSession, setNewSession] = useState({ title: ‘’, pin: ‘’ })
const [newPoll, setNewPoll] = useState(’’)
const [newAgenda, setNewAgenda] = useState({ title: ‘’, description: ‘’ })
const [timer, setTimer] = useState(120)
const [timerRunning, setTimerRunning] = useState(false)
const [timerInput, setTimerInput] = useState(120)
const timerRef = useRef(null)

const loadSessions = async () => {
const { data } = await supabase.from(‘vote_sessions’).select(’*’).order(‘created_at’, { ascending: false })
if (data) setSessions(data)
}

const loadSession = useCallback(async (session) => {
const [{ data: p }, { data: s }, { data: a }, { data: part }, { data: r }] = await Promise.all([
supabase.from(‘vote_polls’).select(’*, vote_responses(*)’).eq(‘session_id’, session.id).order(‘created_at’),
supabase.from(‘vote_speakers’).select(’*’).eq(‘session_id’, session.id).order(‘requested_at’),
supabase.from(‘vote_agenda’).select(’*’).eq(‘session_id’, session.id).order(‘order_num’),
supabase.from(‘vote_participants’).select(’*’).eq(‘session_id’, session.id),
supabase.from(‘vote_participants’).select(’*’).eq(‘session_id’, session.id).not(‘reaction’, ‘is’, null),
])
if (p) setPolls(p)
if (s) setSpeakers(s)
if (a) setAgenda(a)
if (part) setParticipants(part)
if (r) setReactions(r)
}, [])

useEffect(() => { loadSessions() }, [])

useEffect(() => {
if (!activeSession) return
loadSession(activeSession)
const ch = supabase.channel(`mod-${activeSession.id}`)
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_polls’ }, () => loadSession(activeSession))
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_responses’ }, () => loadSession(activeSession))
.on(‘postgres_changes’, { event: ‘*’, schema: ‘public’, table: ‘vote_speakers’ }, () => loadSession(activeSession))
.on(‘postgres_changes’, { event: ’*’, schema: ‘public’, table: ‘vote_participants’ }, () => loadSession(activeSession))
.subscribe()
return () => supabase.removeChannel(ch)
}, [activeSession, loadSession])

// Timer countdown
useEffect(() => {
if (timerRunning && timer > 0) {
timerRef.current = setInterval(() => setTimer(t => { return t - 1 }), 1000)
} else { clearInterval(timerRef.current) }
return () => clearInterval(timerRef.current)
}, [timerRunning, timer])

// Broadcast timer to display
const broadcastTimer = useCallback(async (seconds, running) => {
await supabase.channel(`timer-${activeSession?.id}`).send({
type: ‘broadcast’, event: ‘timer_sync’, payload: { seconds, running }
})
}, [activeSession])

const startTimer = () => { setTimerRunning(true); broadcastTimer(timer, true) }
const pauseTimer = () => { setTimerRunning(false); broadcastTimer(timer, false) }
const resetTimer = () => { setTimerRunning(false); setTimer(timerInput); broadcastTimer(timerInput, false) }
const setTimerAndReset = (s) => { setTimerInput(s); setTimer(s); setTimerRunning(false); broadcastTimer(s, false) }

const createSession = async () => {
if (!newSession.title || !newSession.pin) return
const { data } = await supabase.from(‘vote_sessions’).insert([newSession]).select().single()
if (data) { setSessions(prev => [data, …prev]); setActiveSession(data); setNewSession({ title: ‘’, pin: ‘’ }) }
}

const createPoll = async () => {
if (!newPoll.trim() || !activeSession) return
await supabase.from(‘vote_polls’).insert([{ session_id: activeSession.id, question: newPoll.trim(), status: ‘waiting’ }])
setNewPoll(’’); loadSession(activeSession)
}

const setPollStatus = async (pollId, status) => {
if (status === ‘active’) await supabase.from(‘vote_polls’).update({ status: ‘waiting’ }).eq(‘session_id’, activeSession.id).eq(‘status’, ‘active’)
await supabase.from(‘vote_polls’).update({ status, …(status===‘closed’ ? { closed_at: new Date().toISOString() } : {}) }).eq(‘id’, pollId)
loadSession(activeSession)
}

const callSpeaker = async (speaker) => {
await supabase.from(‘vote_speakers’).update({ status: ‘called’, called_at: new Date().toISOString() }).eq(‘id’, speaker.id)
setTimer(timerInput); setTimerRunning(false); broadcastTimer(timerInput, false)
loadSession(activeSession)
}

const doneSpeaker = async (speakerId) => {
await supabase.from(‘vote_speakers’).update({ status: ‘done’ }).eq(‘id’, speakerId)
setTimerRunning(false); setTimer(timerInput); broadcastTimer(timerInput, false)
loadSession(activeSession)
}

const addAgenda = async () => {
if (!newAgenda.title || !activeSession) return
const maxOrder = agenda.length > 0 ? Math.max(…agenda.map(a => a.order_num)) : 0
await supabase.from(‘vote_agenda’).insert([{ session_id: activeSession.id, …newAgenda, order_num: maxOrder + 1 }])
setNewAgenda({ title: ‘’, description: ‘’ }); loadSession(activeSession)
}

const setActiveAgenda = async (agendaId) => {
await supabase.from(‘vote_agenda’).update({ active: false }).eq(‘session_id’, activeSession.id)
await supabase.from(‘vote_agenda’).update({ active: true }).eq(‘id’, agendaId)
loadSession(activeSession)
}

const closeSession = async () => {
if (!window.confirm(‘Opravdu ukončit konferenci? Tato akce je nevratná.’)) return
await supabase.from(‘vote_sessions’).update({ active: false }).eq(‘id’, activeSession.id)
// Generate PDF
generatePDF(activeSession, polls, speakers, agenda, participants)
setActiveSession(null); loadSessions()
}

const timerColor = timer > 60 ? G.success : timer > 30 ? G.warning : G.danger
const calledSpeaker = speakers.find(s => s.status === ‘called’)
const waitingSpeakers = speakers.filter(s => s.status === ‘waiting’)

if (!activeSession) return (
<>
<style>{css}</style>
<div className="mod-wrap">
<div className="mod-header">
<div className="mod-logo">[<span>CTRL</span>]</div>
<span className="mod-badge">MODERÁTOR</span>
</div>
<div style={{ padding:24, maxWidth:600 }}>
<div className="sec">NOVÁ KONFERENCE</div>
<input className=“fi” placeholder=“Název konference…” value={newSession.title} onChange={e => setNewSession(p => ({ …p, title: e.target.value }))} />
<input className=“fi” placeholder=“PIN pro účastníky (např. CTRL)” value={newSession.pin} onChange={e => setNewSession(p => ({ …p, pin: e.target.value.toUpperCase() }))} style={{ letterSpacing:4, fontSize:18 }} />
<button className="btn btn-p" onClick={createSession}>VYTVOŘIT KONFERENCI ></button>
{sessions.length > 0 && (
<div style={{ marginTop:28 }}>
<div className="sec">EXISTUJÍCÍ KONFERENCE</div>
{sessions.map(s => (
<div key={s.id} style={{ display:‘flex’, alignItems:‘center’, gap:12, padding:‘14px 18px’, background:G.panel, border:`1px solid ${G.border}`, marginBottom:8, cursor:‘pointer’ }} onClick={() => setActiveSession(s)}>
<div style={{ flex:1 }}>
<div style={{ fontSize:14, fontWeight:700 }}>{s.title}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:10, color:G.text2, marginTop:2 }}>PIN: {s.pin}</div>
</div>
<span style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:9, padding:‘3px 8px’, background:s.active?‘rgba(0,229,160,0.1)’:G.panel2, color:s.active?G.success:G.text3, letterSpacing:1 }}>
{s.active ? ‘AKTIVNÍ’ : ‘UKONČENÁ’}
</span>
<span style={{ color:G.accent, fontSize:18 }}>></span>
</div>
))}
</div>
)}
</div>
</div>
</>
)

return (
<>
<style>{css}</style>
<div className="mod-wrap">
<div className="mod-header">
<div className="mod-logo">[<span>CTRL</span>]</div>
<span className="mod-badge">MODERÁTOR</span>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:12, color:G.text2 }}>{activeSession.title}</div>
<div style={{ fontFamily:‘JetBrains Mono,monospace’, fontSize:11, color:G.accent }}>PIN: {activeSession.pin}</div>
<div className=“participants-badge” style={{ marginLeft:‘auto’ }}>
<div className="participants-dot" />
<span className="participants-count">{participants.length} účastníků</span>
</div>
<button className=“btn btn-g” style={{ fontSize:10 }} onClick={() => setActiveSession(null)}>< Zpět</button>
<button className=“btn btn-d” style={{ fontSize:10 }} onClick={closeSession}>stop UKONČIT KONFERENCI</button>
</div>

```
    <div className="mod-content">
      <div>
        {/* REACTIONS */}
        {reactions.length > 0 && (
          <div className="mod-panel">
            <div className="mod-title">REAKCE PUBLIKA ({reactions.length})</div>
            {reactions.map(r => (
              <div key={r.id} className="reaction-mod-item">
                <span style={{ fontSize:18 }}>{r.reaction==='souhlas'?'':r.reaction==='namitka'?'':''}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{r.name}</span>
                <span style={{ fontSize:11, color:G.text2, marginLeft:'auto' }}>{r.reaction==='souhlas'?'Souhlas':r.reaction==='namitka'?'Námitka':'Otázka'}</span>
              </div>
            ))}
          </div>
        )}

        {/* HLASOVÁNÍ */}
        <div className="mod-panel">
          <div className="mod-title">HLASOVÁNÍ</div>
          <input className="fi" placeholder="Otázka hlasování..." value={newPoll} onChange={e => setNewPoll(e.target.value)} onKeyDown={e => e.key==='Enter' && createPoll()} />
          <button className="btn btn-p" onClick={createPoll}>+ VYTVOŘIT HLASOVÁNÍ</button>
          <div style={{ marginTop:16 }}>
            {polls.map((poll, i) => {
              const votes = poll.vote_responses || []
              const ano = votes.filter(v => v.vote==='ano').length
              const ne = votes.filter(v => v.vote==='ne').length
              const zdrzuji = votes.filter(v => v.vote==='zdrzuji_se').length
              const res = poll.status === 'closed' ? getResolutionResult(poll) : null
              return (
                <div key={poll.id} style={{ background:G.panel2, border:`1px solid ${poll.status==='active'?G.accent:G.border}`, padding:'14px 18px', marginBottom:10 }}>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, color:G.text3, letterSpacing:1, marginBottom:4 }}>Hlasování #{i+1}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>{poll.question}</div>
                  <div style={{ display:'flex', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:G.success }}>ANO: {ano}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:G.danger }}>NE: {ne}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:G.warning }}>ZDRŽEL: {zdrzuji}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:G.text2 }}>CELKEM: {votes.length}</span>
                  </div>
                  {res && <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, fontWeight:700, marginBottom:8 }} className={res.cls}>{res.text}</div>}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {poll.status==='waiting' && <button className="btn btn-s" style={{ fontSize:10 }} onClick={() => setPollStatus(poll.id,'active')}>> SPUSTIT</button>}
                    {poll.status==='active' && <button className="btn btn-d" style={{ fontSize:10 }} onClick={() => setPollStatus(poll.id,'closed')}>stop UKONČIT</button>}
                    {poll.status==='closed' && <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:G.text3, padding:'10px 0' }}>UZAVŘENO</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AGENDA */}
        <div className="mod-panel">
          <div className="mod-title">PROGRAM JEDNÁNÍ</div>
          <input className="fi" placeholder="Název bodu..." value={newAgenda.title} onChange={e => setNewAgenda(p => ({ ...p, title: e.target.value }))} />
          <input className="fi" placeholder="Popis (volitelné)..." value={newAgenda.description} onChange={e => setNewAgenda(p => ({ ...p, description: e.target.value }))} />
          <button className="btn btn-p" onClick={addAgenda}>+ PŘIDAT BOD</button>
          <div style={{ marginTop:16 }}>
            {agenda.map(item => (
              <div key={item.id} className={`agenda-item${item.active?' active-agenda':''}`} onClick={() => setActiveAgenda(item.id)}>
                <div className="agenda-num">{item.order_num}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize:11, color:G.text2 }}>{item.description}</div>}
                </div>
                {item.active && <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, padding:'2px 8px', background:'rgba(42,107,255,0.12)', color:G.accent }}>AKTIVNÍ</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        {/* TIMER */}
        <div className="mod-panel">
          <div className="mod-title">ČASOMÍRA</div>
          {calledSpeaker && (
            <div style={{ textAlign:'center', marginBottom:16, padding:16, background:'rgba(0,229,160,0.05)', border:`1px solid rgba(0,229,160,0.2)` }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:G.success, letterSpacing:2, marginBottom:6 }}> VYVOLÁN</div>
              <div style={{ fontSize:18, fontWeight:700, color:G.success }}>{calledSpeaker.name}</div>
            </div>
          )}
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:64, fontWeight:700, textAlign:'center', margin:'16px 0', color:timerColor }}>{formatTimer(timer)}</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12, flexWrap:'wrap' }}>
            <button className="btn btn-s" onClick={startTimer} disabled={timerRunning}>> START</button>
            <button className="btn btn-w" onClick={pauseTimer}>|| PAUZA</button>
            <button className="btn btn-g" onClick={resetTimer}>reset RESET</button>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input className="fi" type="number" value={timerInput} onChange={e => setTimerInput(parseInt(e.target.value)||120)} style={{ maxWidth:80, marginBottom:0, textAlign:'center' }} />
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:G.text2 }}>s</span>
            {[60,120,180,300].map(s => (
              <button key={s} className="btn btn-g" style={{ fontSize:10, padding:'6px 10px' }} onClick={() => setTimerAndReset(s)}>
                {s<60?`${s}s`:`${s/60}m`}
              </button>
            ))}
          </div>
        </div>

        {/* SPEAKERS */}
        <div className="mod-panel">
          <div className="mod-title">FRONTA ŘEČNÍKŮ ({waitingSpeakers.length})</div>
          {waitingSpeakers.length===0 && <div style={{ color:G.text3, fontSize:13, fontFamily:'JetBrains Mono,monospace' }}>Nikdo není přihlášen</div>}
          {waitingSpeakers.map((s,i) => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:G.panel2, border:`1px solid ${G.border}`, marginBottom:8 }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, fontWeight:700, color:G.accent, minWidth:28 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{s.name}</div>
                {s.note && <div style={{ fontSize:11, color:G.text2, fontStyle:'italic' }}>"{s.note}"</div>}
              </div>
              <button className="call-btn" onClick={() => callSpeaker(s)}>VYVOLAT</button>
            </div>
          ))}
          {calledSpeaker && (
            <div style={{ padding:'14px 18px', background:'rgba(0,229,160,0.05)', border:`2px solid ${G.success}`, marginBottom:8 }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, color:G.success, letterSpacing:2, marginBottom:6 }}>PRÁVĚ MLUVÍ</div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:10 }}>{calledSpeaker.name}</div>
              <button className="done-btn" onClick={() => doneSpeaker(calledSpeaker.id)}>v DOKONČIT</button>
            </div>
          )}
          {speakers.filter(s=>s.status==='done').length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, color:G.text3, letterSpacing:2, marginBottom:8 }}>MLUVILI</div>
              {speakers.filter(s=>s.status==='done').map(s => (
                <div key={s.id} style={{ padding:'8px 14px', color:G.text3, fontSize:12, fontFamily:'JetBrains Mono,monospace', borderLeft:`2px solid ${G.border}`, marginBottom:4 }}>v {s.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</>
```

)
}

// – MAIN –
export default function App() {
const [view, setView] = useState(‘entry’)
const [sessionData, setSessionData] = useState(null)
const [participantData, setParticipantData] = useState(null)

if (view===‘participant’ && sessionData && participantData) return <ParticipantView session={sessionData} participant={participantData} />
if (view===‘display’ && sessionData) return <DisplayScreen session={sessionData} />
if (view===‘moderator’) return <ModeratorView />

return (
<>
<style>{css}</style>
<EntryScreen
onParticipant={({ session, participant }) => { setSessionData(session); setParticipantData(participant); setView(‘participant’) }}
onModerator={() => setView(‘moderator’)}
onDisplay={(session) => { setSessionData(session); setView(‘display’) }}
/>
</>
)
}
