-- 예전 Render API 깨우기 작업을 제거한다.
-- 복제한 프로젝트가 원본 Render 서비스를 호출하지 않도록 한다.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.unschedule('keep-api-awake')
 where exists (select 1 from cron.job where jobname = 'keep-api-awake');
