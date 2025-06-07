const body = {
  "PrimaryEmailAddr": {
    "Address": context.payload.email ? context.payload.email : '',
  }, 
  "PrimaryPhone": {
    "FreeFormNumber": context.payload.vendorPhone ? context.payload.vendorPhone : ''
  }, 
  "DisplayName": context.payload.vendorName ? context.payload.vendorName : '',  
  "CompanyName": context.payload.vendorName ? context.payload.vendorName : '', 
  "BillAddr": {
    "City": context.payload.purchasingCity ? context.payload.purchasingCity : '', 
    "Country": "U.S.A", 
    "Line1": context.payload.purchasingAddress1 ? context.payload.purchasingAddress1 : '', 
    "PostalCode": context.payload.purchasingZipCode ? context.payload.purchasingZipCode : '', 
    "CountrySubDivisionCode": context.payload.purchasingState ? context.payload.purchasingState : '', 
  }
}

context.data.vendorBody = body

try {

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://quickbooks.api.intuit.com/v3/company/${context.companyId}/vendor?minorversion=70`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json',
      'Authorization': `Bearer ${context.refreshed.access_token}`
    },
    data : body
  };

  let response = await axios(config)

  response = response.data
  context.vendor = response.Vendor
  context.data.apiresponsevendor = response
} catch(err) {
  context.data.apierrorpo =err
  context.data.vendorCreateError = err.message
}