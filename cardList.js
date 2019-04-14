const request = require('request-promise-native');

var options = {
    uri: 'https://dtdb.co/api/cards/',
    //qs: {
    //    access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
    //},
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

module.exports = request(options)
  .then(function (result) {
      console.log(result);
      return result;
  })
  .catch(function (err) {
      throw err;
});
