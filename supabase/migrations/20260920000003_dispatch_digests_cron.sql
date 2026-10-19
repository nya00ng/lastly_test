-- 알림 배치를 DB 가 현재 프로젝트의 Edge Function 으로 호출한다.
--
-- 복제한 프로젝트가 원본 서비스에 요청을 보내지 않도록 주소는 Vault 에 둔다.
--
-- 토큰과 프로젝트 URL 은 Vault 에 둔다(cron_secret, supabase_url).
create or replace function public.dispatch_digests()
returns void
language plpgsql
security definer
set search_path = public, net, vault
as $$
declare
  v_secret text;
  v_supabase_url text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'cron_secret';

  select decrypted_secret into v_supabase_url
    from vault.decrypted_secrets
   where name = 'supabase_url';

  if v_secret is null then
    raise warning '알림 배치를 부르지 못했습니다 — Vault 에 cron_secret 이 없습니다.';
    return;
  end if;

  if v_supabase_url is null then
    raise warning '알림 배치를 부르지 못했습니다 — Vault 에 supabase_url 이 없습니다.';
    return;
  end if;

  -- 응답은 기다리지 않는다. 결과는 net._http_response 에 남는다.
  perform net.http_post(
    url := trim(trailing '/' from v_supabase_url) || '/functions/v1/dispatch-digests',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    timeout_milliseconds := 20000
  );
end;
$$;

comment on function public.dispatch_digests() is
  '알림 배치를 호출한다. cron 이 매시 정각에 부른다.';

-- 아무나 부를 수 있으면 안 된다. cron(postgres) 만 부른다.
revoke execute on function public.dispatch_digests() from public, anon, authenticated;

select cron.unschedule('dispatch-digests')
 where exists (select 1 from cron.job where jobname = 'dispatch-digests');

-- 매시 정각. 사용자별 시간대 비교는 서버가 한다.
select cron.schedule('dispatch-digests', '0 * * * *', $$ select public.dispatch_digests() $$);
