import { combineReducers, Reducer } from 'redux';
import {
  PROJECT_LIST_SUCCESS,
  PROJECT_SUCCESS,
  PROJECT_UPDATE_SUCCESS,
  PROJECT_DELETE_SUCCESS,
  RESULT_LIST_SUCCESS,
  RESULT_SUCCESS,
  RESULT_UPDATE_SUCCESS,
  RESULTS_PATCH_SUCCESS,
  COMMAND_CREATE_SUCCESS,
  RESULT_LIST_CLEAR,
  RESULT_ASSET_SUCCESS,
  EntitiesAction,
} from '../actions/entities';
import { removePartialState } from './utils';
import { Projects, Result, Args, Commands, Snapshots, Results, Assets } from '../store/types';

const projectsReducer: Reducer<Projects, EntitiesAction> = (state = {}, action) => {
  switch (action.type) {
    case PROJECT_LIST_SUCCESS:
      if (action.payload) {
        const projectList = action.payload.projects;
        const projects: Projects = {};
        projectList.forEach((project) => {
          projects[project.id] = project;
        });
        return projects;
      }
      return state;
    case PROJECT_SUCCESS:
    case PROJECT_UPDATE_SUCCESS:
      if (action.payload) {
        const { project } = action.payload;
        return {
          ...state,
          [project.id]: project,
        };
      }
      return state;
    case PROJECT_DELETE_SUCCESS:
      if (action.payload) {
        const { project } = action.payload;
        return removePartialState(state, project.id);
      }
      return state;
    default:
      return state;
  }
};

const mergeResult = (result: Result, oldResult: Result): Result => {
  const newResult = { ...result };
  const keys: ('args' | 'commands' | 'snapshots')[] = ['args', 'commands', 'snapshots'];
  keys.forEach((k) => {
    const data = oldResult[k];
    if (data && newResult[k] && data.length === newResult[k].length) {
      (newResult[k] as Args | Commands | Snapshots) = data; // eslint-disable-line no-param-reassign
    }
  });
  if (oldResult.logs && oldResult.logs.length === newResult.logs.length) {
    if (oldResult.logModifiedAt === newResult.logModifiedAt) {
      newResult.logs = oldResult.logs; // eslint-disable-line no-param-reassign
    }
  }
  const modified = (Object.keys(newResult) as (keyof Result)[]).some(
    (k) => newResult[k] !== oldResult[k]
  );
  return modified ? newResult : oldResult;
};

const resultsReducer: Reducer<Results, EntitiesAction> = (state = {}, action) => {
  switch (action.type) {
    case RESULT_LIST_SUCCESS:
      if (action.payload) {
        const resultList = action.payload.results;
        const resultIds = resultList.map((result) => result.id);
        let modified = Object.keys(state).length !== resultIds.length;
        const results: Results = {};
        resultList.forEach((result) => {
          const oldResult = state[result.id] || {};
          const newResult = mergeResult(result, oldResult);
          const resultModified = oldResult !== newResult;
          results[result.id] = newResult;
          modified = modified || resultModified;
        });
        return modified ? results : state;
      }
      return state;
    case RESULT_SUCCESS:
      if (action.payload) {
        const { result } = action.payload;
        return {
          ...state,
          [result.id]: result,
        };
      }
      return state;
    case RESULT_UPDATE_SUCCESS:
      if (action.payload) {
        const { result } = action.payload;
        if (result.isUnregistered !== state[result.id].isUnregistered) {
          return removePartialState(state, result.id);
        }
        return {
          ...state,
          [result.id]: result,
        };
      }
      return state;
    case RESULTS_PATCH_SUCCESS:
      if (action.payload) {
        const { results } = action.payload;
        let currentState = state;
        results.forEach((result) => {
          currentState = removePartialState(currentState, result.id);
        });
        return currentState;
      }
      return state;
    case COMMAND_CREATE_SUCCESS:
      if (action.payload) {
        const { resultId } = action.meta.body;
        const result = state[resultId];
        return {
          ...state,
          [resultId]: {
            ...result,
            commands: action.payload.commands,
          },
        };
      }
      return state;
    case RESULT_LIST_CLEAR:
      return {};
    default:
      return state;
  }
};

const assetsReducer: Reducer<Assets, EntitiesAction> = (state = [], action) => {
  switch (action.type) {
    case RESULT_ASSET_SUCCESS:
      if (action.payload) {
        const assetList = action.payload.assets;
        return assetList;
      }
      return state;
    default:
      return state;
  }
};

const entitiesReducer = combineReducers({
  projects: projectsReducer,
  results: resultsReducer,
  assets: assetsReducer,
});

export default entitiesReducer;
