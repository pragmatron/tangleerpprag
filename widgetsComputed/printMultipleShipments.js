return async function () {
  $setGlobalModel('printingShipments', true);

  // Retrieve shipments that are in edit mode
  let selectedShipments = Object.keys(this.$store.state.dgRowInEditMode)
    .filter((item) => item.startsWith('shipping.'))
    .map((item) => item.split('.')[1]);

  if (selectedShipments.length < 1) {
    alert('Please select at least one shipment to print.');
    $setGlobalModel('printingShipments', false);
    return;
  }

  let rowData = {};
  let filteredSelectedShipments = $getGrid('shipping').filter((shipment) =>
    selectedShipments.includes(shipment.rowKey)
  );

  console.log('Selected Shipments:', filteredSelectedShipments);

  // Retrieve the related shipment lines for each shipment
  for (let shipment of filteredSelectedShipments) {
    let shipmentLines = $getGrid('shipmentLines').filter(
      (line) => line.packingSlip === shipment.rowKey
    );
    console.log('shipmentLines: ', shipmentLines);
    shipment.shipmentLines = shipmentLines;
  }

  rowData.shipments = filteredSelectedShipments; // Pass all formatted shipments in rowData
  console.log('Formatted Data for Printing:', rowData);


  try {
    // Print the document
    await $printDocument(
      {
        workspaceId: this.currentDash, // Use the current workspace ID
        gridId: 'packingSlipTemplate', // Replace with the actual template grid ID
        rowKey: '-OCnfJ2noInSpqeefuqK', // Replace with the actual template rowKey
        cellKey: 'template', // The name of the template field
      },
      `Shipments`, // Name of the printed/downloaded file
      rowData,
      true,
      'printedDocuments', // Name of the table where the printed documents will be stored
      {
        name: 'Shipments',
        rowKey: rowData.rowKey,
      },
      true // Save the file in a designated table with metadata
    );

    alert('Shipments printed successfully!');
  } catch (error) {
    console.error('There was an error in $printDocument:', error);
    alert('An error occurred while printing shipments.');
  } finally {
    $setGlobalModel('printingShipments', false);
  }
};
