ALTER TABLE public.subject
    ADD COLUMN IF NOT EXISTS user_role         character varying(100) COLLATE pg_catalog."default" DEFAULT 'UNDEFINED',
    ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS has_newsletters   BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.subject
SET user_role = 'UNDEFINED'
WHERE user_role is null;

UPDATE public.subject
SET terms_accepted_at = created_at
WHERE terms_accepted_at is null
  AND created_at is not null;

UPDATE public.subject
SET terms_accepted_at = updated_at
WHERE terms_accepted_at is null
  AND updated_at is not null;

UPDATE public.subject
SET has_newsletters = false
WHERE has_newsletters is null;
