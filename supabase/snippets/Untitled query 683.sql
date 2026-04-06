drop policy if exists "user_select_own" on "User";
drop policy if exists "user_insert_own" on "User";
drop policy if exists "user_update_own" on "User";

drop policy if exists "work_select_own_or_public" on "Work";
drop policy if exists "work_insert_own" on "Work";
drop policy if exists "work_update_own" on "Work";
drop policy if exists "work_delete_own" on "Work";

drop policy if exists "feedback_select_own" on "Feedback";
drop policy if exists "feedback_insert_own_work" on "Feedback";
drop policy if exists "feedback_update_own_work" on "Feedback";
drop policy if exists "feedback_delete_own" on "Feedback";

drop policy if exists "generated_select_own_or_public" on "GeneratedContent";
drop policy if exists "generated_insert_own" on "GeneratedContent";
drop policy if exists "generated_update_own" on "GeneratedContent";
drop policy if exists "generated_delete_own" on "GeneratedContent";

drop policy if exists "worklike_select_own" on "WorkLike";
drop policy if exists "worklike_insert_own" on "WorkLike";
drop policy if exists "worklike_delete_own" on "WorkLike";

drop policy if exists "generatedlike_select_own" on "GeneratedContentLike";
drop policy if exists "generatedlike_insert_own" on "GeneratedContentLike";
drop policy if exists "generatedlike_delete_own" on "GeneratedContentLike";

alter table "User" enable row level security;
alter table "Work" enable row level security;
alter table "Feedback" enable row level security;
alter table "GeneratedContent" enable row level security;
alter table "WorkLike" enable row level security;
alter table "GeneratedContentLike" enable row level security;

create policy "user_select_own"
on "User"
for select
using (
  auth.uid()::text = "id"
);

create policy "user_insert_own"
on "User"
for insert
with check (
  auth.uid()::text = "id"
);

create policy "user_update_own"
on "User"
for update
using (
  auth.uid()::text = "id"
)
with check (
  auth.uid()::text = "id"
);

create policy "work_select_own_or_public"
on "Work"
for select
using (
  auth.uid()::text = "userId"
  or (
    "visibility" = 'PUBLIC'
    and "status" = 'PUBLISHED'
  )
);

create policy "work_insert_own"
on "Work"
for insert
with check (
  auth.uid()::text = "userId"
);

create policy "work_update_own"
on "Work"
for update
using (
  auth.uid()::text = "userId"
)
with check (
  auth.uid()::text = "userId"
);

create policy "work_delete_own"
on "Work"
for delete
using (
  auth.uid()::text = "userId"
);

create policy "feedback_select_own"
on "Feedback"
for select
using (
  auth.uid()::text = "userId"
);

create policy "feedback_insert_own_work"
on "Feedback"
for insert
with check (
  auth.uid()::text = "userId"
  and exists (
    select 1
    from "Work"
    where "Work"."id" = "Feedback"."workId"
      and "Work"."userId" = auth.uid()::text
  )
);

create policy "feedback_update_own_work"
on "Feedback"
for update
using (
  auth.uid()::text = "userId"
)
with check (
  auth.uid()::text = "userId"
  and exists (
    select 1
    from "Work"
    where "Work"."id" = "Feedback"."workId"
      and "Work"."userId" = auth.uid()::text
  )
);

create policy "feedback_delete_own"
on "Feedback"
for delete
using (
  auth.uid()::text = "userId"
);

create policy "generated_select_own_or_public"
on "GeneratedContent"
for select
using (
  auth.uid()::text = "userId"
  or "visibility" = 'PUBLIC'
);

create policy "generated_insert_own"
on "GeneratedContent"
for insert
with check (
  auth.uid()::text = "userId"
);

create policy "generated_update_own"
on "GeneratedContent"
for update
using (
  auth.uid()::text = "userId"
)
with check (
  auth.uid()::text = "userId"
);

create policy "generated_delete_own"
on "GeneratedContent"
for delete
using (
  auth.uid()::text = "userId"
);

create policy "worklike_select_own"
on "WorkLike"
for select
using (
  auth.uid()::text = "userId"
);

create policy "worklike_insert_own"
on "WorkLike"
for insert
with check (
  auth.uid()::text = "userId"
);

create policy "worklike_delete_own"
on "WorkLike"
for delete
using (
  auth.uid()::text = "userId"
);

create policy "generatedlike_select_own"
on "GeneratedContentLike"
for select
using (
  auth.uid()::text = "userId"
);

create policy "generatedlike_insert_own"
on "GeneratedContentLike"
for insert
with check (
  auth.uid()::text = "userId"
);

create policy "generatedlike_delete_own"
on "GeneratedContentLike"
for delete
using (
  auth.uid()::text = "userId"
);