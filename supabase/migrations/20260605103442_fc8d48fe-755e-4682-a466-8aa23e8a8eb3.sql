
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.credit_wallet(uuid, numeric) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.debit_wallet(uuid, numeric) FROM anon, authenticated, public;
