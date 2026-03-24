-- B Mate schema + RLS policies
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.users add column if not exists dob text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists country_code text;
alter table public.users add column if not exists hostel text;
alter table public.users add column if not exists room text;
alter table public.users add column if not exists updated_at timestamptz default now();

create table if not exists public.food_items (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10,2) not null,
  image text not null,
  tags text[] not null default '{}',
  rating numeric(3,1) not null default 0,
  calories int,
  prep_time text,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  type text not null,
  price_weekly numeric(10,2) not null,
  price_monthly numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('food', 'water', 'laundry')),
  total numeric(10,2) not null,
  status text not null check (status in ('pending', 'confirmed', 'in_progress', 'completed')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.cart (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id bigint not null,
  item_type text not null check (item_type in ('food', 'water')),
  quantity int not null check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, item_id, item_type)
);

create table if not exists public.laundry_services (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10,2) not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.water_products (
  id bigint generated always as identity primary key,
  name text not null,
  volume text not null,
  temp text not null,
  price numeric(10,2) not null,
  image text not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.food_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.cart enable row level security;
alter table public.laundry_services enable row level security;
alter table public.water_products enable row level security;

-- users table policies
create policy "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- public catalog tables are readable by authenticated users
create policy "Read food items"
on public.food_items for select
to authenticated
using (true);

create policy "Read subscriptions"
on public.subscriptions for select
to authenticated
using (true);

create policy "Read laundry services"
on public.laundry_services for select
to authenticated
using (true);

create policy "Read water products"
on public.water_products for select
to authenticated
using (true);

-- orders policies
create policy "Users read own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users create own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own orders"
on public.orders for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- cart policies
create policy "Users read own cart"
on public.cart for select
to authenticated
using (auth.uid() = user_id);

create policy "Users write own cart"
on public.cart for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own cart"
on public.cart for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete own cart"
on public.cart for delete
to authenticated
using (auth.uid() = user_id);

-- optional seed data
insert into public.food_items (name, price, image, tags, rating, calories, prep_time)
values
  ('Today''s Basic Meal', 60, 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?auto=format&fit=crop&w=900&q=80', '{"Budget Friendly","Veg"}', 4.2, 450, '30-45 min'),
  ('Special Veg Meal', 110, 'https://images.unsplash.com/photo-1505253716362-afaea6c46fd9?auto=format&fit=crop&w=900&q=80', '{"Veg"}', 4.7, 600, '35-50 min')
on conflict do nothing;

insert into public.subscriptions (type, price_weekly, price_monthly)
values ('Basic Meal Plan', 399, 1599)
on conflict do nothing;

insert into public.laundry_services (name, price, description)
values
  ('Wash & Fold', 25, 'Everyday clothes'),
  ('Extra Items', 0, 'Bedsheet, Blanket, etc.'),
  ('Dry Cleaning', 120, 'Suits, dresses, delicate fabrics')
on conflict do nothing;

insert into public.water_products (name, volume, temp, price, image)
values
  ('Chilled Water Container', '20 Liters', 'Chilled (5C)', 80, 'https://images.unsplash.com/photo-1624392294437-8fc9f876f4d3?auto=format&fit=crop&w=900&q=80'),
  ('Regular Water Container', '20 Liters', 'Room Temp', 40, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80'),
  ('Insulated Hot Water', '5 Liters', 'Hot (80C)', 130, 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80')
on conflict do nothing;
