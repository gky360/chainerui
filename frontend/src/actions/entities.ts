import { RSAA, RSAAAction, RSAASuccessAction } from '../middleware/apiMiddleware';
import { fetchResultTypes } from '../constants';
import {
  ProjectId,
  Project,
  ResultId,
  Result,
  CommandSchedule,
  Assets,
  Commands,
} from '../store/types';

// projects API

export const PROJECT_LIST_REQUEST = 'PROJECT_LIST_REQUEST';
export const PROJECT_LIST_SUCCESS = 'PROJECT_LIST_SUCCESS';
export const PROJECT_LIST_FAILURE = 'PROJECT_LIST_FAILURE';
export const PROJECT_REQUEST = 'PROJECT_REQUEST';
export const PROJECT_SUCCESS = 'PROJECT_SUCCESS';
export const PROJECT_FAILURE = 'PROJECT_FAILURE';
export const PROJECT_UPDATE_REQUEST = 'PROJECT_UPDATE_REQUEST';
export const PROJECT_UPDATE_SUCCESS = 'PROJECT_UPDATE_SUCCESS';
export const PROJECT_UPDATE_FAILURE = 'PROJECT_UPDATE_FAILURE';
export const PROJECT_DELETE_REQUEST = 'PROJECT_DELETE_REQUEST';
export const PROJECT_DELETE_SUCCESS = 'PROJECT_DELETE_SUCCESS';
export const PROJECT_DELETE_FAILURE = 'PROJECT_DELETE_FAILURE';

export const getProjectList = (): RSAAAction => ({
  [RSAA]: {
    types: [PROJECT_LIST_REQUEST, PROJECT_LIST_SUCCESS, PROJECT_LIST_FAILURE],
    endpoint: 'projects',
  },
});
export type ProjectListSuccessAction = RSAASuccessAction<
  typeof PROJECT_LIST_SUCCESS,
  { projects: Project[] }
>;

export const getProject = (projectId: ProjectId): RSAAAction => ({
  [RSAA]: {
    types: [PROJECT_REQUEST, PROJECT_SUCCESS, PROJECT_FAILURE],
    endpoint: `projects/${projectId}`,
  },
});
export type ProjectSuccessAction = RSAASuccessAction<typeof PROJECT_SUCCESS, { project: Project }>;

export const updateProject = (project: Project): RSAAAction => {
  const { id, name } = project;
  if (!Number.isInteger(id)) {
    throw new Error('Project id is invalid.');
  }
  return {
    [RSAA]: {
      types: [PROJECT_UPDATE_REQUEST, PROJECT_UPDATE_SUCCESS, PROJECT_UPDATE_FAILURE],
      endpoint: `projects/${id}`,
      method: 'PUT',
      body: { project: { id, name } },
    },
  };
};
export type ProjectUpdateSuccessAction = RSAASuccessAction<
  typeof PROJECT_UPDATE_SUCCESS,
  { project: Project }
>;

export const deleteProject = (projectId: ProjectId): RSAAAction => {
  if (!Number.isInteger(projectId)) {
    throw new Error('Project id is invalid.');
  }
  return {
    [RSAA]: {
      types: [PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, PROJECT_DELETE_FAILURE],
      endpoint: `projects/${projectId}`,
      method: 'DELETE',
    },
  };
};
export type ProjectDeleteSuccessAction = RSAASuccessAction<
  typeof PROJECT_DELETE_SUCCESS,
  { project: Project }
>;

// results API

export const RESULT_LIST_REQUEST = 'RESULT_LIST_REQUEST';
export const RESULT_LIST_SUCCESS = 'RESULT_LIST_SUCCESS';
export const RESULT_LIST_FAILURE = 'RESULT_LIST_FAILURE';
export const RESULT_REQUEST = 'RESULT_REQUEST';
export const RESULT_SUCCESS = 'RESULT_SUCCESS';
export const RESULT_FAILURE = 'RESULT_FAILURE';
export const RESULT_UPDATE_REQUEST = 'RESULT_UPDATE_REQUEST';
export const RESULT_UPDATE_SUCCESS = 'RESULT_UPDATE_SUCCESS';
export const RESULT_UPDATE_FAILURE = 'RESULT_UPDATE_FAILURE';
export const RESULTS_PATCH_REQUEST = 'RESULTS_PATCH_REQUEST';
export const RESULTS_PATCH_SUCCESS = 'RESULTS_PATCH_SUCCESS';
export const RESULTS_PATCH_FAILURE = 'RESULTS_PATCH_FAILURE';
export const RESULT_LIST_CLEAR = 'RESULT_LIST_CLEAR';
export const RESULT_ASSET_REQUEST = 'RESULT_ASSET_REQUEST';
export const RESULT_ASSET_SUCCESS = 'RESULT_ASSET_SUCCESS';
export const RESULT_ASSET_FAILURE = 'RESULT_ASSET_FAILURE';

// TODO: avoid any
export const getResultList = (
  projectId: ProjectId,
  logsLimit = -1,
  resultType: any
): RSAAAction => {
  const resultTypeQuery = resultType === fetchResultTypes[0].id ? '' : '&is_unregistered=1';

  return {
    [RSAA]: {
      types: [RESULT_LIST_REQUEST, RESULT_LIST_SUCCESS, RESULT_LIST_FAILURE],
      endpoint: `projects/${projectId}/results?logs_limit=${logsLimit}${resultTypeQuery}`,
    },
  };
};
export type ResultListSuccessAction = RSAASuccessAction<
  typeof RESULT_LIST_SUCCESS,
  { results: Result[] }
>;

export const getResult = (
  projectId: ProjectId,
  resultId: ResultId,
  logsLimit = -1
): RSAAAction => ({
  [RSAA]: {
    types: [RESULT_REQUEST, RESULT_SUCCESS, RESULT_FAILURE],
    endpoint: `projects/${projectId}/results/${resultId}?logs_limit=${logsLimit}`,
  },
});
export type ResultSuccessAction = RSAASuccessAction<typeof RESULT_SUCCESS, { result: Result }>;

export const updateResult = (projectId: ProjectId, result: Result): RSAAAction => {
  const { id, name, isUnregistered } = result;
  if (!Number.isInteger(id)) {
    throw new Error('Result id is invalid.');
  }
  return {
    [RSAA]: {
      types: [RESULT_UPDATE_REQUEST, RESULT_UPDATE_SUCCESS, RESULT_UPDATE_FAILURE],
      endpoint: `projects/${projectId}/results/${id}`,
      method: 'PUT',
      body: { result: { id, name, isUnregistered } },
    },
  };
};
export type ResultUpdateSuccessAction = RSAASuccessAction<
  typeof RESULT_UPDATE_SUCCESS,
  { result: Result }
>;

export const patchResults = (
  projectId: ProjectId,
  results: { id: ResultId; checked: boolean }[] = []
): RSAAAction => {
  return {
    [RSAA]: {
      types: [RESULTS_PATCH_REQUEST, RESULTS_PATCH_SUCCESS, RESULTS_PATCH_FAILURE],
      endpoint: `projects/${projectId}/results`,
      method: 'PATCH',
      body: { projectId, results },
    },
  };
};
export type ResultPatchSuccessAction = RSAASuccessAction<
  typeof RESULTS_PATCH_SUCCESS,
  { results: { id: ResultId; is_unregistered: boolean }[] }
>;

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export const clearResultList = () => ({
  type: RESULT_LIST_CLEAR as typeof RESULT_LIST_CLEAR,
});
export type ResultClearAction = ReturnType<typeof clearResultList>;

export const getResultAsset = (projectId: ProjectId, resultId: ResultId): RSAAAction => ({
  [RSAA]: {
    types: [RESULT_ASSET_REQUEST, RESULT_ASSET_SUCCESS, RESULT_ASSET_FAILURE],
    endpoint: `projects/${projectId}/results/${resultId}/assets`,
  },
});
export type ResultAssetSuccessAction = RSAASuccessAction<
  typeof RESULT_ASSET_SUCCESS,
  { assets: Assets }
>;

// commands API

export const COMMAND_CREATE_REQUEST = 'COMMAND_CREATE_REQUEST';
export const COMMAND_CREATE_SUCCESS = 'COMMAND_CREATE_SUCCESS';
export const COMMAND_CREATE_FAILURE = 'COMMAND_CREATE_FAILURE';

export const createCommand = (
  projectId: ProjectId,
  resultId: ResultId,
  commandName: string,
  requestBody: object | null = null,
  schedule: CommandSchedule | null = null
): RSAAAction => {
  if (!Number.isInteger(resultId)) {
    throw new Error('Result id is invalid.');
  }
  return {
    [RSAA]: {
      types: [COMMAND_CREATE_REQUEST, COMMAND_CREATE_SUCCESS, COMMAND_CREATE_FAILURE],
      endpoint: `projects/${projectId}/results/${resultId}/commands`,
      method: 'POST',
      body: {
        name: commandName,
        body: requestBody,
        schedule,
        resultId,
      },
    },
  };
};
export type CommandCreateSuccessAction = RSAASuccessAction<
  typeof COMMAND_CREATE_SUCCESS,
  { commands: Commands }
>;

export type EntitiesAction =
  | ProjectListSuccessAction
  | ProjectSuccessAction
  | ProjectUpdateSuccessAction
  | ProjectDeleteSuccessAction
  | ResultListSuccessAction
  | ResultSuccessAction
  | ResultUpdateSuccessAction
  | ResultPatchSuccessAction
  | ResultClearAction
  | ResultAssetSuccessAction
  | CommandCreateSuccessAction;