-- Resolution evidence is append-only. A citizen can review a public resolution once.
create table public.resolution_reviews (
  id uuid primary key default uuid_generate_v4(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('approved', 'disputed')),
  reason text,
  evidence_url text,
  created_at timestamptz not null default now(),
  unique (complaint_id, reviewer_id)
);

alter table public.resolution_reviews enable row level security;
create policy "Users can view own resolution reviews" on public.resolution_reviews
  for select using (auth.uid() = reviewer_id);
create policy "Users can create own resolution reviews" on public.resolution_reviews
  for insert with check (auth.uid() = reviewer_id);
create index idx_resolution_reviews_complaint on public.resolution_reviews(complaint_id);
