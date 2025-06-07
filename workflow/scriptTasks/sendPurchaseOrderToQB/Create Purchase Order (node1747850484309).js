
if (context.err) return;
const qs = require('qs');
//Body sample from API explorer examples
const body = {
  "DocNumber": context.payload.name,
  "Line": context.payload.lines, 
  "VendorRef": {
    "value": context.vendor.Id
  },
  "TxnDate": context.payload.date,
  // "SalesTermRef": {
  //   "value": context.customerTerms ? context.customerTerms : ''
  // },
  "APAccountRef": {
    "name": "Accounts Payable (A/P)", 
    "value": "22"
  }, 
    "ShipAddr": {
    "Line1": context.payload.shippingAddress1,
    "City": context.payload.shippingCity,
    "CountrySubDivisionCode": context.payload.shippingState, // State/Province
    "PostalCode": context.payload.shippingZipCode,
    "Country": context.payload.shippingCountry || 'USA'
  }
}



context.data.bodySent = body

try {

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://quickbooks.api.intuit.com/v3/company/${context.companyId}/purchaseorder?minorversion=40`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json',
      'Authorization': `Bearer ${context.refreshed.access_token}`
    },
    data : body
  };

  let response = await axios(config)

  response = response.data


  context.data.apiresponsepo = response
} catch(err) {
  context.data.apierrorpo =err
  context.data.qberror = err.response.data
  context.data.poCreateError = err.message
}