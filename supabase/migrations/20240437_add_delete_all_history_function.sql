-- Drop existing function if it exists
drop function if exists delete_all_history();

-- Create function to delete all history entries
create or replace function delete_all_history()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from ad_history
  returning count(*) into deleted_count;
  
  return json_build_object(
    'success', true,
    'deleted_count', deleted_count
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function delete_all_history() to authenticated;