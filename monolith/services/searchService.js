const searchRepository = require('../repositories/searchRepository');

class SearchService {
  async searchHotels(city) {
    return searchRepository.searchHotelsByCity(city);
  }

  async checkAvailability(hotelId, requestedRooms) {
    const hotel = await searchRepository.getHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    
    if (hotel.available_rooms < requestedRooms) {
      return { available: false, hotelName: hotel.name, availableRooms: hotel.available_rooms };
    }
    
    return { available: true, hotelName: hotel.name };
  }

  async bookRooms(hotelId, roomCount) {
    const availability = await this.checkAvailability(hotelId, roomCount);
    if (!availability.available) {
      throw new Error('Not enough rooms available');
    }
    
    // Decrement the rooms
    await searchRepository.decrementAvailableRooms(hotelId, roomCount);
  }
}

module.exports = new SearchService();
