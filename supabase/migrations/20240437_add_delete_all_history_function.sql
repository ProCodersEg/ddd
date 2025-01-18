-- Create function to delete all history entries
create or replace function delete_all_history()
returns void
language plpgsql
security definer
as $$
begin
  delete from ad_history;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function delete_all_history to authenticated;