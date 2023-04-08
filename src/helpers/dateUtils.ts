const dateUtils = {
  getCurrentUnixTimestamp: () => {
    const getUnixTime = (date: Date) => Math.trunc(date.getTime() / 1000)

    // Get the timestamp of 29 February 2012 11:45:05 CET:
    return getUnixTime(new Date(Date.UTC(2012, 1, 29, 11, 45, 5)))
  }
}

export default dateUtils
