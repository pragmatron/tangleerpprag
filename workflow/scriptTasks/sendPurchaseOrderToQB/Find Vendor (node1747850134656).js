if (context.err) return;

await $log.debug('queried vendor: ' + context.payload.vendorName);
$log.debug(context.refreshed);

let response;

// Set companyId
context.companyId = context.credentials.companyID;

context.companyId = context.companyId.replace(/\s+/g, '');
context.data.companyId = context.companyId;

if (!context.companyId) {
  $log('Company ID missing from API Credentials');
  context.err = true;
  context.data.err = 'Company ID missing from API Credentials, please set it in API Credentials or hardcode it in the workflow';
}

try {
  // Encode vendor name to prevent query issues
  let encodedVendorName = encodeURIComponent(context.payload.vendorName);

  // Retrieve vendor using API call
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://quickbooks.api.intuit.com/v3/company/${context.companyId}/query?query=${encodeURIComponent(`SELECT * FROM Vendor WHERE DisplayName = '${context.payload.vendorName}'`)}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${context.refreshed.access_token}`
    }
  };

  response = await axios(config);
  response = response.data;

  context.data.vendorapi = response;

} catch (err) {
  context.data.err = err.message;
  context.err = true;
  context.vendor = false;
  await $log.debug(err.message);
}

await $log.debug('after vendor query');

// Validate vendor response
if (response && response.QueryResponse && response.QueryResponse.Vendor && response.QueryResponse.Vendor.length > 0) {
  context.vendor = response.QueryResponse.Vendor[0];
  context.data.vendor = response.QueryResponse.Vendor[0];
} else {
  context.vendor = false;
}