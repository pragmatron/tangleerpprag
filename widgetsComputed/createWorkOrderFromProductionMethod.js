return async function (data, so) {
  // Show spinner
  $setGlobalModel('showSpinner', true);
  $setGlobalModel('creatingWorkOrder', true);

  try {
    console.log('data: ', data);
    let method = data.productionMethod;

    if (!method) {
      alert('No Production Method Selected.');
      $setGlobalModel('showSpinner', false); // Hide spinner
      $setGlobalModel('creatingWorkOrder', false);
      return;
    }

    console.log('Production method is: ', method);

    // Fetch operations and materials for the selected method
    let ops = $getGrid('methodOperations') || [];
    let filteredOps = ops.filter((row) => row.productionMethod === method);

    console.log('Filtered operations: ', filteredOps);

    let mats = $getGrid('methodMaterials') || [];
    let filteredMats = mats.filter((row) => row.productionMethod === method);

    console.log('Filtered materials: ', filteredMats);

    // Generate a unique work order name using the shared model
    let workOrderIndex = $getSharedModel('workOrderIndex') || 30000;
    let newWorkOrderName = 'WO' + workOrderIndex;
    $setSharedModel('workOrderIndex', workOrderIndex + 1);

    console.log('Generated work order name: ', newWorkOrderName);

    // Create the new work order record
    let newWorkOrder = await $dgAddRow('opportunityLines', {
      name: newWorkOrderName,
    });

    await $dgSetRowVals('opportunityLines', newWorkOrder, {
      stage: '-NZaTKczYyF8kPTfQbwP',
      workOrder: data.rowKey,
      
      salesLine: data.rowKey,
      open: true,
    });

    // Add filtered materials to the work order
    for (let m of filteredMats) {
      let matsName = `${m.name}`;
      let newMat = await $dgAddRow('workOrderMaterials', {
        workOrder: newWorkOrder,
        name: matsName,
      });
      await $dgSetRowVals('workOrderMaterials', newMat, {
       
        sourceMethodMaterial: m.rowKey,
      });
    }

    // Add filtered operations to the work order
    for (let o of filteredOps) {
      let opName = `${o.sequence}-${o.name}`;
      let newOpId = await $dgAddRow('workOrderOperations', {
        workOrder: newWorkOrder,
      });
      await $dgSetRowVals('workOrderOperations', newOpId, {
        sequence: o.sequence,
        name: opName,
        sourceMethodOperation: o.rowKey,
        estProductionHours: o.estimatedProductionHours,
      });
    }

    // Open the new work order in edit mode
    $dgShowEditRowModal('opportunityLines', newWorkOrder);

    // Hide spinner and reset global model
    $setGlobalModel('showSpinner', false);
    $setGlobalModel('creatingWorkOrder', false);
  } catch (error) {
    console.log('Error caught: ', error);
    $setGlobalModel('showSpinner', false); // Hide spinner
    $setGlobalModel('creatingWorkOrder', false);
  }
};


