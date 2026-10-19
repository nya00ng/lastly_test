-- 이미 배포된 데이터베이스에도 개인 프로젝트 주소를 적용한다.
-- 새 프로젝트는 이전 마이그레이션에서도 이 주소를 사용한다.
select cron.unschedule('keep-api-awake')
 where exists (select 1 from cron.job where jobname = 'keep-api-awake');

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

  if v_secret is null or v_supabase_url is null then
    raise warning '알림 배치 설정이 없습니다: Vault 의 cron_secret 과 supabase_url 을 확인하세요.';
    return;
  end if;

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

revoke execute on function public.dispatch_digests() from public, anon, authenticated;

comment on function public.dispatch_digests() is
  'Vault 의 현재 Supabase 프로젝트로 알림 배치를 보낸다. cron 이 5분마다 부른다.';
