return async function () {
  $setGlobalModel('printingPurchaseOrders', true);

  // Retrieve purchase orders that are in edit mode
  let selectedPurchaseOrders = Object.keys(this.$store.state.dgRowInEditMode)
    .filter((item) => item.startsWith('purchaseOrders.'))
    .map((item) => item.split('.')[1]);

  if (selectedPurchaseOrders.length < 1) {
    alert('Please select at least one purchase order to print.');
    $setGlobalModel('printingPurchaseOrders', false);
    return;
  }
    let rowData = {}
    let filteredSelectedOrders = $getGrid('purchaseOrders').filter((order) =>
      selectedPurchaseOrders.includes(order.rowKey)
    );
    console.log('Selected Purchase Orders:', filteredSelectedOrders);
    // Retrieve the selected purchase orders

    for(let purchaseOrder of filteredSelectedOrders) {
    // Retrieve the related purchase lines
    let purchaseLines = $getGrid('purchaseLines').filter((line) => line.purchaseOrder === purchaseOrder.rowKey)
    console.log('purchaseLines: ', purchaseLines)
    purchaseOrder.purchaseLines = purchaseLines
    }
    
    rowData.purchaseOrders = filteredSelectedOrders// Pass all formatted orders in rowData

    console.log('Formatted Data for Printing:', rowData);
    rowData.logs = selectedPurchaseOrders

  try {
    // Print the document
    await $printDocument(
      {
        workspaceId: this.currentDash, // Use the current workspace ID
        gridId: 'purchaseOrderTemplate', // Replace with the actual template grid ID
        rowKey: '-OCmnX5cLI7W5lraa4k2', // Replace with the actual template rowKey
        cellKey: 'template', // The name of the template field
      },
      `Purchase-Orders`, // Name of the printed/downloaded file
      rowData,
      true,
      'printedDocuments', // Name of the table where the printed documents will be stored
      {
        name: 'Purchase Orders',
        rowKey: rowData.rowKey,
      },
      true // Save the file in a designated table with metadata
    );

    alert('Purchase Orders printed successfully!');
  } catch (error) {
    console.error('There was an error in $printDocument:', error);
    alert('An error occurred while printing purchase orders.');
  } finally {
    $setGlobalModel('printingPurchaseOrders', false);
  }
};
