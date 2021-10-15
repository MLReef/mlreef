ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS gitlab_id BIGINT;

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS user_role TEXT NOT NULL DEFAULT 'UNDEFINED'::character varying;

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS has_newsletters BOOLEAN;

------------

ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS account_gitlab_id_udx;

ALTER TABLE public.account
    ADD CONSTRAINT account_gitlab_id_udx UNIQUE (gitlab_id) NOT DEFERRABLE;

ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS account_slug_udx;

ALTER TABLE public.account
    ADD CONSTRAINT account_slug_udx UNIQUE (slug) NOT DEFERRABLE;

ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS account_username_udx;

ALTER TABLE public.account
    ADD CONSTRAINT account_username_udx UNIQUE (username) NOT DEFERRABLE;

----------- Remove Person dependencies

ALTER TABLE IF EXISTS public.account
    DROP CONSTRAINT IF EXISTS account_subject_person_id_fkey RESTRICT;

ALTER TABLE IF EXISTS public.experiments
    DROP CONSTRAINT IF EXISTS experiment_created_by_fk RESTRICT;

ALTER TABLE IF EXISTS public.gitlab_jobs
    DROP CONSTRAINT IF EXISTS experiment_jobs_runned_by_id_fkey RESTRICT;

ALTER TABLE IF EXISTS public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_subject_id RESTRICT;

ALTER TABLE IF EXISTS public.membership
    DROP CONSTRAINT IF EXISTS membership_person_person_id_fkey RESTRICT;

ALTER TABLE IF EXISTS public.pipeline_configurations
    DROP CONSTRAINT IF EXISTS pipeline_config_created_by_fk RESTRICT;

ALTER TABLE IF EXISTS public.pipelines
    DROP CONSTRAINT IF EXISTS pipeline_created_by_fk RESTRICT;

ALTER TABLE IF EXISTS public.processors
    DROP CONSTRAINT IF EXISTS processor_published_by_fkey RESTRICT;

ALTER TABLE IF EXISTS public.recent_projects
    DROP CONSTRAINT IF EXISTS recent_projects_user_id_fkey RESTRICT;

ALTER TABLE IF EXISTS public.tests
    DROP CONSTRAINT IF EXISTS tests_created_by_fk RESTRICT;

----------- Move person table data to account table

UPDATE account ac
SET id = sub.id, gitlab_id = sub.gitlab_id, name = sub.name, slug = sub.slug, user_role = sub.user_role
FROM (
         SELECT s.id, s.gitlab_id, s.name, s.slug, s.user_role, s.terms_accepted_at, s.has_newsletters
         FROM subject s
     ) sub
where ac.person_id = sub.id AND ac.id<>sub.id;

----------- Remove Person dependencies
ALTER TABLE IF EXISTS public.experiments
    ADD CONSTRAINT experiment_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.account(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.gitlab_jobs
    ADD CONSTRAINT experiment_jobs_runned_by_id_fkey FOREIGN KEY (runned_by)
        REFERENCES public.account(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.marketplace_star
    ADD CONSTRAINT marketplace_star_subject_id FOREIGN KEY (subject_id)
        REFERENCES public.account(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.membership
    ADD CONSTRAINT membership_person_person_id_fkey FOREIGN KEY (person_id)
        REFERENCES public.account(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.pipeline_configurations
    ADD CONSTRAINT pipeline_config_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.pipelines
    ADD CONSTRAINT pipeline_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.processors
    ADD CONSTRAINT processor_published_by_fkey FOREIGN KEY (published_by)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.recent_projects
    ADD CONSTRAINT recent_projects_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE IF EXISTS public.tests
    ADD CONSTRAINT tests_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;