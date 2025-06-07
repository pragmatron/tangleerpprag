return async function (data) {
  console.log('Function called with data:', data);
  $setGlobalModel('makeWorkOrderWithMethod', true);

  try {
    // Validate that a production method is selected
    let method = data.productionMethod;
    if (!method) {
      alert('No production method selected.');
      $setGlobalModel('makeWorkOrderWithMethod', false);
      return;
    }

    console.log('Selected Production Method:', method);

    // Fetch the method operations associated with the production method
    let operations = $getGrid('methodOperations').filter((row) => {
      return row.productionMethod === method;
    });

    console.log('Filtered operations:', operations);

    for (let op of operations) {
      console.log('Operation:', op);

      // Create a work order operation for each method operation
      let newOp = await $dgAddRow('workOrderOperations', {
        workOrder: data.rowKey, // Link to the current work order
      });

      await $dgSetRowVals('workOrderOperations', newOp, {
        name: `${op.sequence || ''} - ${op.name}`, // Combine sequence and name
        sourceMethodOperation: op.rowKey, // Reference the original method operation
        sequence: op.sequence || null, // Include sequence if available
        part: op.parentPart || null, // Tie to the parent part (if applicable)
        estProductionHours: op.estimatedProductionHours || null, // Include estimated hours
      });
    }

    // Fetch the method materials associated with the production method
    let materials = $getGrid('methodMaterials').filter((row) => {
      return row.productionMethod === method;
    });

    console.log('Filtered materials:', materials);

    for (let mat of materials) {
      console.log('Material:', mat);

      // Create a work order material for each method material
      let newMat = await $dgAddRow('workOrderMaterials', {
        workOrder: data.rowKey, // Link to the current work order
      });

      await $dgSetRowVals('workOrderMaterials', newMat, {
        name: `${mat.name}`, // Combine material name and part display
        sourceMethodMaterial: mat.rowKey, // Reference the original method material
        quantityRequired: mat.quantityPer || 0, // Quantity required
        part: mat.part || null, // Tie to the material's part
        materialSequence: mat.sequence || null, // Include material sequence if available
      });
    }

    // Success message and update global model
    console.log('Work order created with method successfully.');
    alert('Work order operations and materials added successfully.');
    $setGlobalModel('makeWorkOrderWithMethod', false);

  } catch (error) {
    console.error('Error caught while creating work order:', error);
    alert('An error occurred while creating the work order.');
    $setGlobalModel('makeWorkOrderWithMethod', false);
  }
};
