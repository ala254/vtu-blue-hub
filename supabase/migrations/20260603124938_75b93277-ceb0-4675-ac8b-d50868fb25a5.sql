
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- wallets
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallet read" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- transactions
CREATE TYPE public.tx_type AS ENUM ('fund','data','airtime','electricity','cable','betting','exam_pin','referral');
CREATE TYPE public.tx_status AS ENUM ('pending','successful','failed','reversed');
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.tx_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  reference TEXT UNIQUE NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.transactions(user_id, created_at DESC);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx read" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- referral earnings
CREATE TABLE public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.referral_earnings(referrer_id, created_at DESC);
GRANT SELECT ON public.referral_earnings TO authenticated;
GRANT ALL ON public.referral_earnings TO service_role;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own referrals read" ON public.referral_earnings FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

-- payment intents
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'paystack',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own intents read" ON public.payment_intents FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- credit wallet (atomic)
CREATE OR REPLACE FUNCTION public.credit_wallet(_user_id UUID, _amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.wallets SET balance = balance + _amount, updated_at = now() WHERE user_id = _user_id;
END;
$$;

-- debit wallet (atomic, returns true on success)
CREATE OR REPLACE FUNCTION public.debit_wallet(_user_id UUID, _amount NUMERIC)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bal NUMERIC;
BEGIN
  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _user_id FOR UPDATE;
  IF _bal IS NULL OR _bal < _amount THEN RETURN FALSE; END IF;
  UPDATE public.wallets SET balance = balance - _amount, updated_at = now() WHERE user_id = _user_id;
  RETURN TRUE;
END;
$$;
