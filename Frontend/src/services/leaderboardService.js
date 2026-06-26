import api, { extractData } from './api';

export const leaderboardService = {
  getLeaderboard: ({ scope = 'global', district = '', limit = 20 } = {}) =>
    api
      .get('/leaderboard', {
        params: {
          scope,
          district: district || undefined,
          limit,
        },
      })
      .then((r) => extractData(r)),

  getMyStats: () =>
    api.get('/leaderboard/my-stats').then((r) => extractData(r)),
};
