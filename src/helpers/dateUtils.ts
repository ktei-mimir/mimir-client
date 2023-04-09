const dateUtils = {
  getUtcNowTicks: () => {
    return Date.now() * 10000 + 621355968000000000
  }
}

export default dateUtils
