const axios = require('axios');

class DistanceCalculator {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async calculateDistance(pincodeFrom, pincodeTo) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
      const response = await axios.get(url, {
        params: {
          origins: pincodeFrom,
          destinations: pincodeTo,
          key: this.googleMapsApiKey,
          units: 'metric'
        }
      });

      if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
        const distanceMeters = response.data.rows[0].elements[0].distance.value;
        return Math.ceil(distanceMeters / 1000);
      }
      return this.estimateDistanceByPincode(pincodeFrom, pincodeTo);
    } catch (error) {
      return this.estimateDistanceByPincode(pincodeFrom, pincodeTo);
    }
  }

  estimateDistanceByPincode(pincodeFrom, pincodeTo) {
    const fromPrefix = parseInt(pincodeFrom.toString().substring(0, 2));
    const toPrefix = parseInt(pincodeTo.toString().substring(0, 2));
    const diff = Math.abs(fromPrefix - toPrefix);
    return Math.max(10, diff * 100);
  }

  getEWayBillValidity(distance, isODC = false) {
    const kmPerDay = isODC ? 20 : 200;
    return Math.max(1, Math.ceil(distance / kmPerDay));
  }

  isEWayBillRequired(taxableValue, distance, isInterState) {
    if (isInterState) return true;
    return taxableValue > 50000 && distance > 50;
  }
}

module.exports = new DistanceCalculator();