import MergeRequestAPI from 'apis/MergeRequestApi';

const mergeRequestAPI = new MergeRequestAPI();

const submit = (
  gid,
  branch,
  branchToMergeInto,
  title,
  description,
) => mergeRequestAPI
  .submitMergeReq(
    gid,
    branch,
    branchToMergeInto,
    title,
    description,
);

export default {
  submit,
};
