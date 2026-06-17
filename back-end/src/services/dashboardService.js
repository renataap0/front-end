const carsDao = require("../daos/carsDao");
const driversDao = require("../daos/driversDao");
const productsDao = require("../daos/productsDao");
const racesDao = require("../daos/racesDao");
const teamsDao = require("../daos/teamsDao");
const tracksDao = require("../daos/tracksDao");
const { getRankings, getSalesSummary } = require("./analyticsService");

async function getDashboardSummary() {
  const [teams, drivers, cars, tracks, races, products, rankings, sales] = await Promise.all([
    teamsDao.countTeams(),
    driversDao.countDrivers(),
    carsDao.countCars(),
    tracksDao.countTracks(),
    racesDao.countRaces(),
    productsDao.countProducts(),
    getRankings(),
    getSalesSummary()
  ]);

  return {
    teams,
    drivers,
    cars,
    tracks,
    races,
    products,
    orders: sales.totalOrders,
    revenue: sales.revenue,
    rankings
  };
}

module.exports = { getDashboardSummary };
