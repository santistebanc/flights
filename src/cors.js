var cors_api_url = "https://cors-anywhere.herokuapp.com/";
function doCORSRequest(options, printResult) {
  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function () {
    printResult(
      options.method +
        " " +
        options.url +
        "\n" +
        x.status +
        " " +
        x.statusText +
        "\n\n" +
        (x.responseText || "")
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.setRequestHeader("x-api-key", "prtl6749387986743898559646983194");
  }
  x.send(options.data);
}

doCORSRequest(
  {
    method: "POST",
    url: "https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search",
    data: '{ "query": { "market": "UK", "locale": "en-GB", "currency": "GBP", "queryLegs": [{ "originPlace": { "queryPlace": { "iata": "LHR" } }, "destinationPlace": { "queryPlace": { "iata": "LAX" } }, "anytime": true }] } }',
    headers: {},
  },
  function printResult(result) {
    console.log("?????", result);
  }
);

// const options = {
//   method: 'GET',
//   url: 'https://skyscanner44.p.rapidapi.com/search-extended',
//   params: {
//     adults: '1',
//     origin: 'SLP',
//     destination: 'CUN',
//     departureDate: '2023-01-29',
//   },
//   headers: {
//     'X-RapidAPI-Key': '7144003f71msh7d6b2425ddf4846p1acb5ejsn45d84e26974e',
//     'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
//   }
// };

// axios.request(options).then(function (response) {
//   console.log(response.data);
// }).catch(function (error) {
//   console.error(error);
// });

// fetch('https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search',
//   {
//     method: 'POST',
//     // mode: 'cors',
//     headers: {
//       // 'Content-Type': 'application/json',
//       'x-api-key': 'prtl6749387986743898559646983194',
//       // 'Access-Control-Allow-Origin': '*'
//     },
//     body: '{ "query": { "market": "UK", "locale": "en-GB", "currency": "GBP", "queryLegs": [{ "originPlace": { "queryPlace": { "iata": "LHR" } }, "destinationPlace": { "queryPlace": { "iata": "LAX" } }, "anytime": true }] } }'
//   })
// .then(res => {
//   if (res.status >= 400) {
//     throw new Error("Bad response from server");
//   }
//   return res.json();
// })
// .then(user => {
//   console.log(user);
// })
// .catch(err => {
//   console.error(err);
// });

// const options = {
//   method: 'POST',
//   url: 'https://http-cors-proxy.p.rapidapi.com/',
//   headers: {
//     'content-type': 'application/json',
//     'X-Requested-With': 'www.example.com',
//     'X-RapidAPI-Key': '7144003f71msh7d6b2425ddf4846p1acb5ejsn45d84e26974e',
//     'X-RapidAPI-Host': 'http-cors-proxy.p.rapidapi.com',
//     "x-api-key": "prtl6749387986743898559646983194"
//   },
//   data: '{"url":"https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search","method":"POST","body":{ "query": { "market": "UK", "locale": "en-GB", "currency": "GBP", "queryLegs": [{ "originPlace": { "queryPlace": { "iata": "LHR" } }, "destinationPlace": { "queryPlace": { "iata": "LAX" } }, "anytime": true }] } },"headers":{"x-api-key": "prtl6749387986743898559646983194", "content-type": "application/x-www-form-urlencoded"}}'
// };
