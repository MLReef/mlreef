import { EXTERNAL_ROOT_URL } from 'apiConfig';
import ApiRequestCallBuilder from 'apis/apiBuilders/ApiRequestCallBuilder';
import { METHODS } from 'apis/apiBuilders/requestEnums';
import ApiDirector from 'apis/ApiDirector';

//
// This is a spike implementation.
// This code exists only to show a possible architecture of the end2end tests
// As with all spikes it is an experiment / investigation which
// can -and probably should- be deleted once a final solution is found
//
class UserApi extends ApiDirector {
  register(data: any) {
    const builder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildAnonHeaders(),
      `${EXTERNAL_ROOT_URL}/api/v1/auth/register`,
      JSON.stringify(data),
    );
    return fetch(builder.build());
  }

  login(data: any) {
    const url = `${EXTERNAL_ROOT_URL}/api/v1/auth/login`;
    const builder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildAnonHeaders(),
      url,
      JSON.stringify(data),
    );
    return fetch(builder.build());
  }
}

export default UserApi;
