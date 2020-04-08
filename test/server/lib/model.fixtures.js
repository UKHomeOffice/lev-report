'use strict';

module.exports = {
  data: {
    hourlyUsage: [
      {count: 12, weekend: 1, hour: 7},
      {count: 183, weekend: 1, hour: 8},
      {count: 242, weekend: 1, hour: 9},
      {count: 221, weekend: 1, hour: 10},
      {count: 289, weekend: 1, hour: 11},
      {count: 172, weekend: 1, hour: 12},
      {count: 189, weekend: 1, hour: 13},
      {count: 151, weekend: 1, hour: 14},
      {count: 117, weekend: 1, hour: 15},
      {count: 377, weekend: 0, hour: 7},
      {count: 1254, weekend: 0, hour: 8},
      {count: 3825, weekend: 0, hour: 9},
      {count: 6202, weekend: 0, hour: 10},
      {count: 7362, weekend: 0, hour: 11},
      {count: 6003, weekend: 0, hour: 12},
      {count: 5203, weekend: 0, hour: 13},
      {count: 4467, weekend: 0, hour: 14},
      {count: 3061, weekend: 0, hour: 15},
      {count: 1447, weekend: 0, hour: 16},
      {count: 612, weekend: 0, hour: 17},
      {count: 217, weekend: 0, hour: 18},
      {count: 155, weekend: 0, hour: 19},
      {count: 28, weekend: 0, hour: 20},
      {count: 11, weekend: 0, hour: 21}
    ]
  },

  results: {
    hourlyUsage: [
      { name: 'weekday', data: [
          { hour: 0, count: 0 }, { hour: 1, count: 0 }, { hour: 2, count: 0 }, { hour: 3, count: 0 },
          { hour: 4, count: 0 }, { hour: 5, count: 0 }, { hour: 6, count: 0 },
          { hour: 7, count: 377/5.0 }, { hour: 8, count: 1254/5.0 }, { hour: 9, count: 3825/5 },
          { hour: 10, count: 6202/5.0 }, { hour: 11, count: 7362/5.0 }, { hour: 12, count: 6003/5.0 },
          { hour: 13, count: 5203/5.0 }, { hour: 14, count: 4467/5.0 }, { hour: 15, count: 3061/5.0 },
          { hour: 16, count: 1447/5.0 }, { hour: 17, count: 612/5.0 }, { hour: 18, count: 217/5.0 },
          { hour: 19, count: 155/5.0 }, { hour: 20, count: 28/5.0 }, { hour: 21, count: 11/5.0 },
          { hour: 22, count: 0 }, { hour: 23, count: 0 }
        ]
      },
      { name: 'weekend', data: [
          { hour: 0, count: 0 }, { hour: 1, count: 0 }, { hour: 2, count: 0 }, { hour: 3, count: 0 },
          { hour: 4, count: 0 }, { hour: 5, count: 0 }, { hour: 6, count: 0 },
          { hour: 7, count: 12/2 }, { hour: 8, count: 183/2.0 }, { hour: 9, count: 242/2 },
          { hour: 10, count: 221/2.0 }, { hour: 11, count: 289/2.0 }, { hour: 12, count: 172/2 },
          { hour: 13, count: 189/2.0 }, { hour: 14, count: 151/2.0 }, { hour: 15, count: 117/2.0 },
          { hour: 16, count: 0 }, { hour: 17, count: 0 }, { hour: 18, count: 0 }, { hour: 19, count: 0 },
          { hour: 20, count: 0 }, { hour: 21, count: 0 }, { hour: 22, count: 0 }, { hour: 23, count: 0 }
        ]
      },
      { name: 'average', data: [
          { hour: 0, count: 0 }, { hour: 1, count: 0 }, { hour: 2, count: 0 }, { hour: 3, count: 0 },
          { hour: 4, count: 0 }, { hour: 5, count: 0 }, { hour: 6, count: 0 },
          { hour: 7, count: (377+12)/7.0 }, { hour: 8, count: (1254+183)/7.0 }, { hour: 9, count: (3825+242)/7.0 },
          { hour: 10, count: (6202+221)/7.0 }, { hour: 11, count: (7362+289)/7.0 }, { hour: 12, count: (6003+172)/7.0 },
          { hour: 13, count: (5203+189)/7.0 }, { hour: 14, count: (4467+151)/7.0 }, { hour: 15, count: (3061+117)/7.0 },
          { hour: 16, count: 1447/7.0 }, { hour: 17, count: 612/7.0 }, { hour: 18, count: 217/7.0 },
          { hour: 19, count: 155/7.0 }, { hour: 20, count: 28/7.0 }, { hour: 21, count: 11/7.0 },
          { hour: 22, count: 0 }, { hour: 23, count: 0 }
        ]
      }
    ]
  }
};
