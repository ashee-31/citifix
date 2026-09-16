-- ============================================================
-- CivicProof — Initial Supabase Migration
-- Tables: profiles, complaints, complaint_events, complaint_support,
--         resolution_evidence, ai_evidence_reviews,
--         blockchain_proofs, notifications
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'citizen' check (role in ('citizen','authority','admin')),
  display_name text,
  ward         text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 2. COMPLAINTS
-- ============================================================
create type complaint_status as enum (
  'SUBMITTED','AI_VERIFIED','ACKNOWLEDGED','ASSIGNED','IN_PROGRESS',
  'RESOLUTION_EVIDENCE_REQUIRED','RESOLUTION_SUBMITTED',
  'AI_RESOLUTION_REVIEW','PUBLIC_REVIEW','RESOLVED',
  'DISPUTED','REOPENED'
);

create type complaint_category as enum (
  'ROADS','WASTE','STREETLIGHTS','WATER','DRAINAGE','FOOTPATH','OTHER'
);

create type priority_level as enum ('CRITICAL','HIGH','MEDIUM','LOW');

create table public.complaints (
  id                     uuid primary key default uuid_generate_v4(),
  complaint_number       text not null unique,
  reporter_id            uuid not null references public.profiles(id) on delete cascade,
  category               complaint_category not null,
  description            text not null,
  location_label         text not null,
  latitude               double precision not null,
  longitude              double precision not null,
  status                 complaint_status not null default 'SUBMITTED',
  priority               priority_level not null default 'MEDIUM',
  priority_score         integer not null default 40,
  ai_severity            text not null default 'Medium',
  ai_severity_score      integer not null default 50,
  safety_risk            text not null default 'Medium',
  safety_risk_score      integer not null default 50,
  evidence_quality       integer not null default 50,
  ai_summary             text not null default '',
  evidence_url           text,
  resolution_evidence_url text,
  resolution_note        text,
  support_count          integer not null default 0,
  depth_impact           integer not null default 100,
  overdue                boolean not null default false,
  report_count           integer not null default 1,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  resolved_at            timestamptz,
  reopen_count           integer not null default 0,
  dispute_count          integer not null default 0
);

alter table public.complaints enable row level security;

create index idx_complaints_status on public.complaints(status);
create index idx_complaints_category on public.complaints(category);
create index idx_complaints_priority_score on public.complaints(priority_score desc);
create index idx_complaints_created_at on public.complaints(created_at desc);
create index idx_complaints_complaint_number on public.complaints(complaint_number);
create index idx_complaints_location on public.complaints(latitude, longitude);

create policy "Anyone can view complaints"
  on public.complaints for select using (true);

create policy "Authenticated users can create complaints"
  on public.complaints for insert
  with check (auth.uid() = reporter_id);

create policy "Admins can delete complaints"
  on public.complaints for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 3. COMPLAINT EVENTS (audit trail)
-- ============================================================
create table public.complaint_events (
  id           uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  type         text not null,
  title        text not null,
  actor_role   text not null default 'citizen',
  description  text,
  entity_ref   text,
  created_at   timestamptz not null default now()
);

alter table public.complaint_events enable row level security;

create index idx_events_complaint_id on public.complaint_events(complaint_id);
create index idx_events_created_at on public.complaint_events(created_at desc);

create policy "Anyone can view events"
  on public.complaint_events for select using (true);

create policy "Authenticated users can insert events"
  on public.complaint_events for insert
  with check (auth.uid() is not null);

-- ============================================================
-- 4. COMPLAINT SUPPORT (community upvotes)
-- ============================================================
create table public.complaint_support (
  id           uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  supporter_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(complaint_id, supporter_id)
);

alter table public.complaint_support enable row level security;

create index idx_support_complaint_id on public.complaint_support(complaint_id);

create policy "Anyone can view support"
  on public.complaint_support for select using (true);

create policy "Authenticated users can add support"
  on public.complaint_support for insert
  with check (auth.uid() = supporter_id);

create policy "Authenticated users can remove support"
  on public.complaint_support for delete
  using (auth.uid() = supporter_id);

-- ============================================================
-- 5. RESOLUTION EVIDENCE
-- ============================================================
create table public.resolution_evidence (
  id           uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  kind         text not null check (kind in ('resolved','disputed','reopened_evidence')),
  description  text not null,
  evidence_url text not null,
  ai_analysis  text,
  created_at   timestamptz not null default now()
);

alter table public.resolution_evidence enable row level security;

create index idx_resolution_complaint_id on public.resolution_evidence(complaint_id);

create policy "Anyone can view resolution evidence"
  on public.resolution_evidence for select using (true);

create policy "Authorities can submit resolution evidence"
  on public.resolution_evidence for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('authority','admin'))
  );

-- ============================================================
-- 6. AI EVIDENCE REVIEWS
-- ============================================================
create table public.ai_evidence_reviews (
  id                      uuid primary key default uuid_generate_v4(),
  complaint_id            uuid not null references public.complaints(id) on delete cascade,
  category                complaint_category not null,
  severity                text not null,
  severity_score          integer not null,
  safety_risk             text not null,
  safety_risk_score       integer not null,
  evidence_quality        integer not null,
  summary                 text not null,
  duplicate_likelihood    double precision not null default 0,
  manipulation_indicators jsonb not null default '[]'::jsonb,
  analysis_version        text not null,
  created_at              timestamptz not null default now()
);

alter table public.ai_evidence_reviews enable row level security;

create index idx_ai_reviews_complaint_id on public.ai_evidence_reviews(complaint_id);

create policy "Anyone can view AI reviews"
  on public.ai_evidence_reviews for select using (true);

-- ============================================================
-- 7. BLOCKCHAIN PROOFS
-- ============================================================
create table public.blockchain_proofs (
  id               uuid primary key default uuid_generate_v4(),
  complaint_id     uuid not null references public.complaints(id) on delete cascade,
  chain            text not null default 'polygon-amoy',
  contract_address text not null,
  transaction_hash text not null,
  record_hash      text not null,
  block_number     bigint not null default 0,
  data_uri         text not null,
  anchored_at      timestamptz not null default now()
);

alter table public.blockchain_proofs enable row level security;

create index idx_proofs_complaint_id on public.blockchain_proofs(complaint_id);
create index idx_proofs_tx_hash on public.blockchain_proofs(transaction_hash);

create policy "Anyone can view blockchain proofs"
  on public.blockchain_proofs for select using (true);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

create or replace function public.update_updated_at()
returns trigger as 
begin
  new.updated_at = now();
  return new;
end;
 language plpgsql;

create trigger complaints_updated_at
  before update on public.complaints
  for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger as 
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    coalesce(new.raw_user_meta_data->>'display_name', null)
  );
  return new;
end;
 language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
