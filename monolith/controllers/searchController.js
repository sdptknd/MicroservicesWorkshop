const searchService = require('../services/searchService');

class SearchController {
  async searchHotels(req, res) {
    try {
      const { city } = req.query;
      const hotels = await searchService.searchHotels(city);
      res.json(hotels);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new SearchController();
