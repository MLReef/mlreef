import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Returns true if it has not role limitations.
 *
 * If no role constraints: true
 * If user role number is less than role given: false
 * Otherwise: true
 *
 * @param {Number[integer]} role is the role constraint, between 10 and 60(?) https://docs.gitlab.com/ee/api/access_requests.html#valid-access-levels
 * @param {Object[type, id]} resource is the resource to be checked, mainly projects.
 *
 * @return {Boolean} if role is fullfilled.
 */
export const useGetHasRole = (role, resource = {}) => {
  const projects = useSelector(({ projects }) => projects);

  return useMemo(
    () => {
      // if resource is supplied then will lookup in the all projects, else will
      // check selectedProject
      const project = resource.id
        ? projects.all.find((pj) => resource.id === pj.id)
        : projects.selectedProject;

      // project_access is the gitlab impl for permissions
      const perm = project?.gitlab?.permissions;
      const level = perm?.project_access?.access_level;

      // this is in case of a resource different than project (like group) is given
      // so far there is nothing more than project
      switch (resource.type) {
        case 'project':
          return role <= (level || 0);

        default:
          return true;
      }
    },
    [projects, role, resource.type, resource.id],
  );
};

/**
 * Returns true if owner.
 *
 * If user is the owner of the resource (or selectedProject).
 * Since we don't know the gitlab user id there is a workaround with path.
 * if owneronly is false then return true.
 *
 * @param {Object[type, id]} resource is the resource to be checked, mainly projects.
 *
 * @return {Boolean} if fullfilled.
 */
export const useGetOwned = (resource = {}) => {
  const user = useSelector(({ user }) => user);
  const projects = useSelector(({ projects }) => projects);

  return useMemo(
    () => {
      // if resource is supplied then will lookup in the all projects, else will
      // check selectedProject
      const project = resource.id
        ? projects.all.find((pj) => resource.id === pj.id)
        : projects.selectedProject;

      // in simple project info there is not 'owner' key, so we need a workaround
      // with namespace
      const ownerInfo = project?.gitlab?.owner;
      const nsInfo = project?.gitlab?.namespace;

      const projectUsername = ownerInfo
        ? ownerInfo.username
        : nsInfo?.path;

      const { username } = user;

      // this is in case of a resource different than project (like group) is given
      // so far there is nothing more than project
      switch (resource.type) {
        // case 'project':
        // break;
        default:
          return username === projectUsername;
      }
    },
    [projects, user, resource.type, resource.id],
  );
};

/**
 * Returns true user has the required account tier.
 *
 * Currently there is no key sent from backend but we suppose it will be called membership.
 *
 * @param {Number} accountType a number between 1 and 4 (bronze 1, silver 2, etc)
 *
 * @return {Boolean} if fullfilled.
 */
export const useGetHasAccountType = (accountType) => {
  const user = useSelector(({ user }) => user);

  return useMemo(
    () => {
      const { membership } = user;
      return membership >= accountType;
    },
    [user, accountType],
  );
};
