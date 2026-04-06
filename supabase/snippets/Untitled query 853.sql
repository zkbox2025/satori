insert into public."User" (
  "id",
  "email",
  "name",
  "createdAt",
  "updatedAt"
)
select
  u.id::text,
  u.email,
  u.raw_user_meta_data ->> 'name',
  now(),
  now()
from auth.users u
on conflict ("id") do nothing;