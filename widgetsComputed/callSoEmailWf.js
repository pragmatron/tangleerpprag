return async function(rowData) {
  // call the workflow and get the resulting data
  console.log('data sent to templater', rowData)
$setGlobalModel('sendingSalesEmail', true)

 // rowDataNoCirc.opportunityLines = $getGrid('opportunityLines').filter((line) => line.salesOrder === rowData.rowKey  && !line.name.includes('W00'))

rowData.salesLines = $getGrid('salesLines').filter((line) => line.salesOrder === rowData.rowKey)
  console.log('sales lines', rowData.opportunityLines)
   let rowDataNoCirc = window.removeCircularReferences(rowData)
console.log('rowDatNoCirc: ', rowDataNoCirc)

  try {
  let d = await this.$wfGetData('-NhWA28IFFIbOuSnVCVE', rowDataNoCirc)
  alert('Email Sent')

  } catch(err) {
  $setGlobalModel('sendingSalesEmail', false)

    console.log('error sending email: ', err)
  }
  $setGlobalModel('sendingSalesEmail', false)

    // put the response into the global model
    // the global model is a browser memory store templates can render
  //   $setGlobalModel('data', d)
  // return d 
}