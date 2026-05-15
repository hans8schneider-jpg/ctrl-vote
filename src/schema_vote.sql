-- CTRL Vote System — SQL Schema
-- Run this in Supabase SQL Editor

-- Sessions (conferences)
create table if not exists vote_sessions (
  id serial primary key,
  title text not null,
  pin text not null,
  active boolean default true,
  created_at timestamp default now()
);

-- Agenda items
create table if not exists vote_agenda (
  id serial primary key,
  session_id integer references vote_sessions(id) on delete cascade,
  title text not null,
  description text,
  order_num integer default 0,
  active boolean default false,
  created_at timestamp default now()
);

-- Votes/Polls
create table if not exists vote_polls (
  id serial primary key,
  session_id integer references vote_sessions(id) on delete cascade,
  agenda_id integer references vote_agenda(id),
  question text not null,
  status text default 'waiting', -- waiting, active, closed
  created_at timestamp default now(),
  closed_at timestamp
);

-- Individual votes
create table if not exists vote_responses (
  id serial primary key,
  poll_id integer references vote_polls(id) on delete cascade,
  voter_name text not null,
  vote text not null, -- ano, ne, zdrzuji_se
  created_at timestamp default now()
);

-- Participants
create table if not exists vote_participants (
  id serial primary key,
  session_id integer references vote_sessions(id) on delete cascade,
  name text not null,
  joined_at timestamp default now(),
  reaction text, -- souhlas, namitka, otazka, null
  reaction_at timestamp
);

-- Speaker queue
create table if not exists vote_speakers (
  id serial primary key,
  session_id integer references vote_sessions(id) on delete cascade,
  participant_id integer references vote_participants(id),
  name text not null,
  note text,
  status text default 'waiting', -- waiting, called, done
  requested_at timestamp default now(),
  called_at timestamp,
  timer_started_at timestamp,
  timer_seconds integer default 120
);

-- RLS
alter table vote_sessions enable row level security;
alter table vote_agenda enable row level security;
alter table vote_polls enable row level security;
alter table vote_responses enable row level security;
alter table vote_participants enable row level security;
alter table vote_speakers enable row level security;

-- Allow all for anon (PIN-protected at app level)
create policy "vote_sessions_all" on vote_sessions for all using (true) with check (true);
create policy "vote_agenda_all" on vote_agenda for all using (true) with check (true);
create policy "vote_polls_all" on vote_polls for all using (true) with check (true);
create policy "vote_responses_all" on vote_responses for all using (true) with check (true);
create policy "vote_participants_all" on vote_participants for all using (true) with check (true);
create policy "vote_speakers_all" on vote_speakers for all using (true) with check (true);
