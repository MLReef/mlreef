ALTER TABLE public.membership
    ADD COLUMN IF NOT EXISTS access_level INTEGER;


ALTER TABLE public.membership
    DROP CONSTRAINT IF EXISTS group_id_person_id_unique_uidx RESTRICT;

ALTER TABLE public.membership
    ADD CONSTRAINT group_id_person_id_unique_uidx
        UNIQUE (group_id, person_id) NOT DEFERRABLE;