ALTER TABLE public.subject
    ADD COLUMN IF NOT EXISTS gitlab_id BIGINT;

ALTER TABLE public.subject
    DROP CONSTRAINT IF EXISTS dtype_gitlab_id_unique_uidx RESTRICT;

ALTER TABLE public.subject
    ADD CONSTRAINT dtype_gitlab_id_unique_uidx
        UNIQUE (dtype, gitlab_id) NOT DEFERRABLE;

UPDATE public.subject
SET gitlab_id = account.gitlab_id
FROM public.account
WHERE subject.id = account.person_id
