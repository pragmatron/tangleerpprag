return async function () {
  $setGlobalModel('printingSalesOrders', true);

  // Retrieve sales orders that are in edit mode
  let selectedSalesOrders = Object.keys(this.$store.state.dgRowInEditMode)
    .filter((item) => item.startsWith('opportunities.'))
    .map((item) => item.split('.')[1]);

  if (selectedSalesOrders.length < 1) {
    alert('Please select at least one sales order to print.');
    $setGlobalModel('printingSalesOrders', false);
    return;
  }

  let rowData = {};
  let filteredSelectedSalesOrders = $getGrid('opportunities').filter((order) =>
    selectedSalesOrders.includes(order.rowKey)
  );

  console.log('Selected Sales Orders:', filteredSelectedSalesOrders);

  // Retrieve the related sales order lines for each sales order
  for (let order of filteredSelectedSalesOrders) {
    let salesOrderLines = $getGrid('salesLines').filter(
      (line) => line.salesOrder === order.rowKey
    );
    console.log('salesLines: ', salesOrderLines);
    order.salesLines = salesOrderLines;
  }

  rowData.salesOrders = filteredSelectedSalesOrders; // Pass all formatted sales orders in rowData
  console.log('Formatted Data for Printing:', rowData);
  

  try {
    // Print the document
    await $printDocument(
      {
        workspaceId: this.currentDash, // Use the current workspace ID
        gridId: 'salesOrderTemplate', // Replace with the actual template grid ID
        rowKey: '-OCnE5PjhBRf3yRuS2V6', // Replace with the actual template rowKey
        cellKey: 'template', // The name of the template field
      },
      `Sales-Orders`, // Name of the printed/downloaded file
      rowData,
      true,
      'printedDocuments', // Name of the table where the printed documents will be stored
      {
        name: 'Sales Orders',
        rowKey: rowData.rowKey,
      },
      true // Save the file in a designated table with metadata
    );

    alert('Sales Orders printed successfully!');
  } catch (error) {
        $setGlobalModel('printingSalesOrders', false);
    console.error('There was an error in $printDocument:', error);
    alert('An error occurred while printing sales orders.');
  } finally {
    $setGlobalModel('printingSalesOrders', false);
  }
};
