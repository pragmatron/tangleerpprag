return async function (data, so) {
  $setGlobalModel('creatingWorkOrderFromPart', true);
console.log('creating work order')
  try {
    console.log('Data received: ', data);

    let part = data.part;
    if (!part) {
      alert('No part selected. Cannot create a work order.');
      $setGlobalModel('creatingWorkOrderFromPart', false);
      return;
    }

    // Generate a unique work order name using the shared model
    let workOrderIndex = $getSharedModel('workOrderIndex') || 30000;
    let newWorkOrderName = 'WO' + workOrderIndex;
    $setSharedModel('workOrderIndex', workOrderIndex + 1);

    console.log('Generated work order name: ', newWorkOrderName);

    let newWorkOrder = await $dgAddRow('opportunityLines', {
      salesLine: data.rowKey,
      name: newWorkOrderName,
      part: part,
    });

    if (!newWorkOrder) {
      alert('Failed to create work order. Please try again.');
      $setGlobalModel('creatingWorkOrderFromPart', false);
      return;
    }

    await $dgSetRowVals('opportunityLines', newWorkOrder, {
      stage: '-NZaTKczYyF8kPTfQbwP',
      open: true,
    });

    // Fetch and add filtered materials
    let mats = $getGrid('methodMaterials') || [];
    let filteredMats = mats.filter((row) => row.parentPart === part);
    console.log('Filtered materials: ', filteredMats);

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

    // Fetch and add filtered operations
    let ops = $getGrid('methodOperations') || [];
    let filteredOps = ops.filter((row) => row.parentPart === part);
    console.log('Filtered operations: ', filteredOps);

    for (let o of filteredOps) {
      let opName = `${o.sequence || ''} - ${o.name}`;
      let newOpId = await $dgAddRow('workOrderOperations', {
        workOrder: newWorkOrder,
        name: opName,
        sequence: o.sequence,
      });

      await $dgSetRowVals('workOrderOperations', newOpId, {
        sourceMethodOperation: o.rowKey,
      });
    }

    console.log('Work order created successfully with operations and materials.');
    $dgShowEditRowModal('opportunityLines', newWorkOrder);
    $setGlobalModel('creatingWorkOrderFromPart', false);
  } catch (error) {
    console.error('Error caught while creating work order: ', error);
    alert('An error occurred while creating the work order. Please check the console for details.');
    $setGlobalModel('creatingWorkOrderFromPart', false);
  }
};




