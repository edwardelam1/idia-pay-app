CREATE TABLE public.nano_bite_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carton_code text NOT NULL,
  sub_module_id text NOT NULL,
  nano_bite_id text NOT NULL,
  screen text NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX nano_bite_executions_carton_bite_idx
  ON public.nano_bite_executions (carton_code, nano_bite_id, created_at DESC);

GRANT SELECT, INSERT ON public.nano_bite_executions TO authenticated;
GRANT ALL ON public.nano_bite_executions TO service_role;

ALTER TABLE public.nano_bite_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authed insert own executions"
  ON public.nano_bite_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "authed read all executions"
  ON public.nano_bite_executions
  FOR SELECT
  TO authenticated
  USING (true);