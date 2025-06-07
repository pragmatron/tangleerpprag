return async function () {
  $setGlobalModel('printingWorkOrders', true);

  // Retrieve work orders that are in edit mode
  let selectedWorkOrders = Object.keys(this.$store.state.dgRowInEditMode)
    .filter((item) => item.startsWith('opportunityLines.'))
    .map((item) => item.split('.')[1]);

  if (selectedWorkOrders.length < 1) {
    alert('Please select at least one work order to print.');
    $setGlobalModel('printingWorkOrders', false);
    return;
  }

  let rowData = {};
  let filteredSelectedWorkOrders = $getGrid('opportunityLines').filter((workOrder) =>
    selectedWorkOrders.includes(workOrder.rowKey)
  );

  console.log('Selected Work Orders:', filteredSelectedWorkOrders);

  // Retrieve related work order operations and materials for each work order
  for (let workOrder of filteredSelectedWorkOrders) {
    // Retrieve operations for the work order
    let workOrderOperations = $getGrid('workOrderOperations').filter(
      (operation) => operation.workOrder === workOrder.rowKey
    );

 
      let workOrderMaterials = $getGrid('workOrderMaterials').filter(
        (material) => material.workOrder === workOrder.rowKey
      );


    // Add operations (with materials) to the work order
    workOrder.workOrderOperations = workOrderOperations;
    workOrder.workOrderMaterials = workOrderMaterials;
  }

  // Include additional fields or modify `rowData` if required
  rowData.workOrders = filteredSelectedWorkOrders; // Pass all formatted work orders in rowData
  console.log('Formatted Data for Printing:', rowData);

  try {
    // Call to print the document
    await $printDocument(
      {
        workspaceId: this.currentDash, // Use the current workspace ID
        gridId: 'workOrderTemplate', // Replace with the actual template grid ID
        rowKey: '-OCrvq6HNyCW7pPJOsBP', // Replace with the actual template rowKey
        cellKey: 'template', // The name of the template field
      },
      `WorkOrders`, // Name of the printed/downloaded file
      rowData,
      true, // Print as a single file or batch
      'printedDocuments', // Table where the printed documents will be stored
      {
        name: 'WorkOrders', // Add metadata for the file
        rowKey: rowData.rowKey,
      },
      true // Save the file in a designated table with metadata
    );

    alert('Work Orders printed successfully!');
  } catch (error) {
    console.error('There was an error in $printDocument:', error);
    alert('An error occurred while printing work orders.');
  } finally {
    $setGlobalModel('printingWorkOrders', false);
  }
};
