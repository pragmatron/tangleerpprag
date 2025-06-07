return async function (rowData) {
  console.log("Function called with data:", rowData);

  // Show spinner at the start
  $setGlobalModel("creatingTopWorkOrder", true);
  $setGlobalModel("showSpinner", true);

  try {
    // Validate that a part is selected
    let parentPart = rowData.part;
    if (!parentPart) {
      alert("Error: No part has been selected. Please select a part to create the work order.");
      $setGlobalModel("creatingTopWorkOrder", false);
      $setGlobalModel("showSpinner", false); // Hide spinner
      return; // Stop the function if no part is selected
    }

    console.log("Using parent part:", parentPart);

    const parts = $getGrid("parts");

    // Use the current work order name (not the rowKey) for the parent work order
    let currentWorkOrder = rowData.rowKey || "UnnamedWorkOrder";
    console.log("Using current work order:", currentWorkOrder, "for parent part:", parentPart);

    // Function to process operations and materials for a work order
    const processOperationsAndMaterials = async (workOrder, part) => {
      console.log("Processing operations and materials for work order:", workOrder, "and part:", part);

      // Fetch method operations for the part
      let methodOperations = $getGrid("methodOperations").filter((op) => op.parentPart === part);
      console.log("Filtered method operations:", methodOperations);

  // **New Step: Determine the maximum sequence number among methodOperations**
  let maxSequence = 0;
  if (methodOperations.length > 0) {
    maxSequence = Math.max(...methodOperations.map(op => op.sequence || 0));
    console.log("Maximum sequence number identified:", maxSequence);
  }

  for (const op of methodOperations) {
    let newOp = await $dgAddRow("workOrderOperations", {
      workOrder: workOrder,
      name: `${op.sequence} - ${op.name} - ${op.description || ''}`,
      part: op.parentPart,
      operationSequence: op.sequence || null,
      sequence: op.sequence || null,
    });

    // **New Step: Prepare the values to set, including lastOperation if applicable**
    let rowVals = {
      sourceMethodOperation: op.rowKey,
    };

    if (op.sequence === maxSequence) {
      rowVals.lastOperation = true;
      console.log(`Marked workOrderOperation with sequence ${op.sequence} as lastOperation.`);
    }

    await $dgSetRowVals("workOrderOperations", newOp, rowVals);
  }

      // Fetch method materials for the part
      let methodMaterials = $getGrid("methodMaterials").filter((mat) => mat.parentPart === part);
      console.log("Filtered method materials:", methodMaterials);

      for (const mat of methodMaterials) {
        let quantityRequired = mat.quantityPer || 0;
        let newMat = await $dgAddRow("workOrderMaterials", {
          workOrder: workOrder,
          name: `${mat.name}`,
          part: mat.part,
          quantityRequired: quantityRequired,
          materialSequence: mat.sequence || null,
        });
        await $dgSetRowVals("workOrderMaterials", newMat, {
          sourceMethodMaterial: mat.rowKey,
        });
      }
    };

    // Recursive function for sub-materials
    const handleSubMethodMaterialsAndOperations = async (material, parentWorkOrder, parentWorkOrderName, subIndex) => {
      console.log("Processing sub-material:", material);

      // Fetch sub-method materials and operations
      let subMethodMaterials = $getGrid("methodMaterials").filter((mat) => mat.parentPart === material.part);
      let subMethodOperations = $getGrid("methodOperations").filter((op) => op.parentPart === material.part);

      if (subMethodMaterials.length > 0 || subMethodOperations.length > 0) {
        // Use parent work order name (not rowKey) for sub-work order naming
        let subWorkOrderName = `${parentWorkOrderName}.${String(subIndex).padStart(2, '0')}`;
        console.log("Creating sub-work order with name:", subWorkOrderName);

        let subWorkOrder = await $dgAddRow("opportunityLines", {
          name: subWorkOrderName,
          open: true,
          stage: "-NZaTKczYyF8kPTfQbwP",
          salesLine: rowData.rowKey,
          mainWorkOrder: parentWorkOrder,
          part: material.part,
        });

        let nextSubIndex = 1;

        // Process materials for the sub-work order
        console.log("Processing materials for sub-work order:", subWorkOrderName);
        for (const subMaterial of subMethodMaterials) {
          let quantityRequired = subMaterial.quantityPer || 0;

          let newSubMat = await $dgAddRow("workOrderMaterials", {
            workOrder: subWorkOrder,
            name: `${subMaterial.name}`,
            part: subMaterial.part,
            quantityRequired: quantityRequired,
            materialSequence: subMaterial.sequence || null,
          });
          await $dgSetRowVals("workOrderMaterials", newSubMat, {
            sourceMethodMaterial: subMaterial.rowKey,
          });

          // Recursive call for deeper levels
          await handleSubMethodMaterialsAndOperations(subMaterial, subWorkOrder, subWorkOrderName, nextSubIndex++);
        }

        // Process operations for the sub-work order
        console.log("Processing operations for sub-work order:", subWorkOrderName);
        for (const subOperation of subMethodOperations) {
          let newOp = await $dgAddRow("workOrderOperations", {
            workOrder: subWorkOrder,
            name: `${subOperation.sequence} - ${subOperation.name} - ${subOperation.description || ''}`,
            part: subOperation.part,
            operationSequence: subOperation.sequence || null,
            sequence: subOperation.sequence || null,
          });
          await $dgSetRowVals("workOrderOperations", newOp, {
            sourceMethodOperation: subOperation.rowKey,
          });
        }
      }
    };

    // Process operations and materials for the main (parent) work order
    console.log("Processing main work order operations and materials directly from part");
    await processOperationsAndMaterials(currentWorkOrder, parentPart);

    // Handle sub-materials and operations recursively
    let initialSubIndex = 1;
    let methodMaterials = $getGrid("methodMaterials").filter((mat) => mat.parentPart === parentPart);
    for (const mat of methodMaterials) {
      await handleSubMethodMaterialsAndOperations(mat, currentWorkOrder, rowData.name, initialSubIndex++);
    }

    alert("Work order creation completed!");
  } catch (error) {
    console.error("Error caught:", error);
    alert("An error occurred while creating the work order. Please try again.");
  } finally {
    // Hide spinner at the end
    $setGlobalModel("creatingTopWorkOrder", false);
    $setGlobalModel("showSpinner", false);
  }
};
