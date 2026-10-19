-- Child rows must belong to an item owned by the authenticated user as well.
alter policy "own logs" on public.item_logs
  with check (auth.uid() = user_id and exists (
    select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()
  ));
alter policy "own aliases" on public.item_aliases
  with check (auth.uid() = user_id and exists (
    select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()
  ));

create or replace function public.bump_item_alias(p_user_id uuid, p_item_id uuid, p_phrase text)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if not exists (select 1 from public.items where id = p_item_id and user_id = auth.uid() and status = 'active') then
    raise exception 'Item not found' using errcode = '42501';
  end if;
  insert into public.item_aliases(user_id, item_id, phrase)
  values(p_user_id, p_item_id, p_phrase)
  on conflict(user_id, phrase) do update
    set hit_count = public.item_aliases.hit_count + 1, item_id = excluded.item_id;
end;
$$;
revoke execute on function public.bump_item_alias(uuid, uuid, text) from public, anon;
grant execute on function public.bump_item_alias(uuid, uuid, text) to authenticated;
