import api, { extractData } from './api';

export const leaderboardService = {
  getLeaderboard: ({ scope = 'global', district = '', limit = 50, page = 1 } = {}) =>
    api
      .get('/leaderboard', {
        params: {
          scope,
          district: district || undefined,
          limit,
          page,
        },
      })
      .then((r) => extractData(r)),

  getMyStats: () =>
    api.get('/leaderboard/my-stats').then((r) => extractData(r)),
};
