import { CustomObjectsApi } from '@kubernetes/client-node';
import { GroupCustomObject, GroupObjResponse } from '../types';

export class MissingGroupError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MissingGroupError.prototype);
  }
}

export const getGroup = async (
  customObjectsApi: CustomObjectsApi,
  adminGroup: string,
): Promise<string[]> => {
  try {
    const adminGroupResponse = await customObjectsApi.getClusterCustomObject(
      'user.openshift.io',
      'v1',
      'groups',
      adminGroup,
    );
    return (adminGroupResponse.body as GroupObjResponse).users || [];
  } catch (e) {
    throw new MissingGroupError(`Failed to retrieve Group ${adminGroup}, might not exist.`);
  }
};

export const getAllGroupsByUser = async (
  customObjectsApi: CustomObjectsApi,
  username: string,
): Promise<string[]> => {
  try {
    const adminGroupResponse = await customObjectsApi.listClusterCustomObject(
      'user.openshift.io',
      'v1',
      'groups',
    );
    const groups = adminGroupResponse.body as GroupCustomObject;
    const userGroups = groups.items
      .filter((x) => x.users?.includes(username))
      .map((x) => x.metadata?.name);
    console.log(`User ${username} is in groups: ${userGroups.join(', ')}`);
    return userGroups;
  } catch (e) {
    throw new Error(`Failed to list groups filtered by username: ${e.message}.`);
  }
};
