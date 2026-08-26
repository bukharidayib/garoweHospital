create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_hospital_id uuid;
  v_target_id text;
begin
  v_hospital_id := coalesce((to_jsonb(new)->>'hospital_id')::uuid, (to_jsonb(old)->>'hospital_id')::uuid);
  if v_hospital_id is null then return coalesce(new, old); end if;
  v_target_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
  insert into public.audit_logs (hospital_id, actor_id, action, module, target_type, target_id, severity, outcome, metadata)
  values (v_hospital_id, auth.uid(), lower(TG_OP) || ' ' || TG_TABLE_NAME,
    initcap(replace(TG_TABLE_NAME, '_', ' ')), TG_TABLE_NAME, v_target_id, 'info', 'success',
    jsonb_build_object('source', 'database trigger', 'operation', TG_OP));
  return coalesce(new, old);
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admissions', 'appointments', 'departments', 'doctors', 'inventory_batches',
    'inventory_movements', 'invoices', 'lab_orders', 'lab_tests', 'medicines',
    'patients', 'payments', 'prescriptions', 'visits'
  ] loop
    execute format('drop trigger if exists audit_operational_changes on public.%I', table_name);
    execute format(
      'create trigger audit_operational_changes after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
      table_name
    );
  end loop;
end;
$$;
