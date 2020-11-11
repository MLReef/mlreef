import GroupsApi from 'apis/GroupApi';

const grApi = new GroupsApi();

const getGroupUsers = (groupId) => grApi.getUsers(groupId);

export default {
  getGroupUsers,
};
