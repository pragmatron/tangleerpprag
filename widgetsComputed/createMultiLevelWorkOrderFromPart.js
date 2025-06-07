return async function (rowData) {
  $setGlobalModel('creatingWorkOrderFromPart', true)
  // Check if part is selected
  if (!rowData.part) {
    alert('No part selected. Cannot create a work order.');
    return; // Exit the function early
  }
  const partOptions = await $getGrid('partOptions');
  const bomlevels = partOptions
    .filter(option => option.salesLine === rowData.rowKey && (option.quantity || 0) < 1)
    .map(option => option.bomLevel);
  $setGlobalModel("creatingTopWorkOrder", true);
  let parentInsideBom = false;
  let parts = $getGrid("parts");
  let id = $getSharedModel('workOrderIndex') ? $getSharedModel('workOrderIndex') : 500000;
  $setSharedModel('workOrderIndex', id + 1);
  let nextId = 'WO' + String(id);
  // Create the top-level work order
  let topWorkOrder = await $dgAddRow("opportunityLines", {
    name: nextId,
    open: true,
    stage: "-NZaTKczYyF8kPTfQbwP",
    salesLine: rowData.rowKey,
    part: rowData.part,
    topLevel: true
  });
  const handleSubMethodMaterialsAndOperations = async (
    material,
    parentWorkOrderName,
    parentWorkOrder,
    subIndexMap
  ) => {
    let subMethodMaterials = [];
    let subMethodOperations = [];
    // Fetch sub-method materials
    try {
      const snapshot = await this.$dbService
        .getRef("models/methodMaterials")
        .orderByChild("parentPart")
        .equalTo(material.part)
        .once("value");
      subMethodMaterials = Object.values(snapshot.val() || {});
    } catch (error) {
      $setGlobalModel('creatingWorkOrderFromPart', false)
      console.error("Error retrieving sub-method materials: ", error);
    }
    // Fetch sub-method operations
    try {
      const snapshotOps = await this.$dbService
        .getRef("models/methodOperations")
        .orderByChild("parentPart")
        .equalTo(material.part)
        .once("value");
      subMethodOperations = Object.values(snapshotOps.val() || {});
    } catch (error) {
      $setGlobalModel('creatingWorkOrderFromPart', false)
      console.error("Error retrieving sub-method operations: ", error);
    }
    // Ensure subIndexMap exists for this parent work order
    if (!subIndexMap[parentWorkOrderName]) {
      subIndexMap[parentWorkOrderName] = 1;
    }
    // Create sub-work order if sub-method materials or operations exist
    if (subMethodMaterials.length > 0 || subMethodOperations.length > 0) {
      let subWorkOrderName = `${parentWorkOrderName}.${String(subIndexMap[parentWorkOrderName]).padStart(2, '0')}`;
      let subWorkOrder = await $dgAddRow("opportunityLines", {
        name: subWorkOrderName,
        open: true,
        stage: "-NZaTKczYyF8kPTfQbwP",
        salesLine: rowData.rowKey,
        mainWorkOrder: parentWorkOrder,
        part: material.part,
        topLevelWorkOrder: topWorkOrder,
        parentWorkOrder: parentWorkOrder
      });
      // Increment the sub-index for this parent
      subIndexMap[parentWorkOrderName]++;
      // Add sub-method materials to the sub-work order
      for (const subMaterial of subMethodMaterials) {
        if (subMaterial.part === material.part) {
          parentInsideBom = true;
          continue;
        }
        const quantityRequired = subMaterial.quantityPer * (material.quantityPer || 1);
        await $dgAddRow("workOrderMaterials", {
          workOrder: subWorkOrder,
          name: subMaterial.name,
          part: subMaterial.part,
          quantityRequired: quantityRequired || 0,
          materialSequence: subMaterial.sequence || null,
          sourceMethodMaterial: subMaterial.rowKey,
        });
        // Recursively handle deeper sub-method materials and operations
        await handleSubMethodMaterialsAndOperations(
          subMaterial,
          subWorkOrderName,
          subWorkOrder,
          subIndexMap
        );
      }
      // Add sub-method operations to the sub-work order
      for (const subOperation of subMethodOperations) {
        await $dgAddRow("workOrderOperations", {
          workOrder: subWorkOrder,
          name: `${subOperation.sequence} - ${subOperation.name || ''}`,
          sequence: subOperation.sequence || null,
          part: subOperation.part,
          sourceMethodOperation: subOperation.rowKey
        });
      }
    }
  };
  // Fetch top-level method materials and operations
  let topLevelMaterials = [];
  let topLevelOperations = [];
  try {
    const topLevelMaterialsSnapshot = await this.$dbService
      .getRef("models/methodMaterials")
      .orderByChild("parentPart")
      .equalTo(rowData.part)
      .once("value");
    topLevelMaterials = Object.values(topLevelMaterialsSnapshot.val() || {});
  } catch (error) {
    $setGlobalModel('creatingWorkOrderFromPart', false)
    console.error("Error retrieving top-level materials: ", error);
  }
  try {
    const topLevelOperationsSnapshot = await this.$dbService
      .getRef("models/methodOperations")
      .orderByChild("parentPart")
      .equalTo(rowData.part)
      .once("value");
    topLevelOperations = Object.values(topLevelOperationsSnapshot.val() || {});
  } catch (error) {
    $setGlobalModel('creatingWorkOrderFromPart', false)
    console.error("Error retrieving top-level operations: ", error);
  }
  // Add top-level method materials to the top-level work order
  let subIndexMap = {}; // Maintain sub-index for each parent work order
  for (const material of topLevelMaterials) {
    const quantityRequired = material.quantityPer * (rowData.quantity || 1);
    await $dgAddRow("workOrderMaterials", {
      workOrder: topWorkOrder,
      name: material.name,
      part: material.part,
      quantityRequired: quantityRequired || 0,
      materialSequence: material.sequence || null,
      sourceMethodMaterial: material.rowKey,
    });
    // Recursively handle sub-method materials and operations
    await handleSubMethodMaterialsAndOperations(material, nextId, topWorkOrder, subIndexMap);
  }
  // Add top-level method operations to the top-level work order
  for (const operation of topLevelOperations) {
    await $dgAddRow("workOrderOperations", {
      workOrder: topWorkOrder,
      name: `${operation.sequence} - ${operation.name || ''}`,
      sequence: operation.sequence || null,
      part: operation.parentPart,
      sourceMethodOperation: operation.rowKey,
     
    });
  }

  $setGlobalModel('creatingWorkOrderFromPart', false)
 $dgShowEditRowModal('opportunityLines', topWorkOrder);

  if (parentInsideBom) {
    alert('One or more BOMs have a method material of itself.');
  }
  alert('Work order creation completed!');
};




