-- Create the reports table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  patient_name text,
  modality text,
  urgency text,
  report_data jsonb not null
);

-- Enable Row Level Security (RLS)
alter table public.reports enable row level security;

-- Create a policy that allows anyone to insert/select (for demo purposes)
-- In production, you'd want authenticated users only
create policy "Enable all access for all users" on public.reports
for all using (true) with check (true);
