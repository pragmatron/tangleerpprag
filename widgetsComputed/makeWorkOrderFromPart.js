return async function (data) {
  console.log('Function called with data:', data);
  $setGlobalModel('makeWorkOrder', true);

  try {
    // Use 'part' as the primary filter
    let part = data.part;
    console.log('Part:', part);

    if (!part) {
      alert('No Part selected');
      $setGlobalModel('makeWorkOrder', false);
      return;
    }

    // Fetch the method operations associated with the part
    let operations = $getGrid('methodOperations').filter((row) => {
      return row.parentPart === part; // Match operations tied to the selected part
    });

    console.log('Filtered operations:', operations);

    for (let op of operations) {
      console.log('Operation:', op);

      // Create a work order operation for each method operation
      let newOp = await $dgAddRow('workOrderOperations', {
        workOrder: data.rowKey, // Link to the current work order
      });

      await $dgSetRowVals('workOrderOperations', newOp, {
        name: `${op.sequence} - ${op.name || ''}`, // Combine operation name and description
        sourceMethodOperation: op.rowKey, // Reference the original method operation
        sequence: op.sequence || null, // Include sequence if available
        part: op.parentPart, // Tie to the part
        operationSequence: op.operationSequence || null, // Copy operation sequence if it exists
      });
    }

    // Fetch the method materials associated with the part
    let materials = $getGrid('methodMaterials').filter((row) => {
      return row.parentPart === part; // Match materials tied to the selected part
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
        part: mat.part, // Tie to the material's part
        materialSequence: mat.sequence || null, // Include material sequence if available
      });
    }
    console.log('Work order created with method successfully.');
    alert('Work order operations and materials added successfully.');

    $setGlobalModel('makeWorkOrder', false);
    console.log('Work order operations and materials created successfully');
  } catch (error) {
    console.log('Error caught:', error);
    $setGlobalModel('makeWorkOrder', false);
  }
};

