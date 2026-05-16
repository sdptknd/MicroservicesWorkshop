const db = require('../db');

class SearchRepository {
  async searchHotelsByCity(city) {
    let query = 'SELECT * FROM search_schema.hotels';
    let params = [];

    if (city) {
      query += ' WHERE LOWER(city) = LOWER($1)';
      params.push(city);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  async getHotelById(hotelId) {
    const result = await db.query(
      'SELECT * FROM search_schema.hotels WHERE id = $1',
      [hotelId]
    );
    return result.rows[0];
  }

  async decrementAvailableRooms(hotelId, count) {
    const result = await db.query(
      'UPDATE search_schema.hotels SET available_rooms = available_rooms - $1 WHERE id = $2 RETURNING available_rooms',
      [count, hotelId]
    );
    return result.rows[0];
  }
}

module.exports = new SearchRepository();
