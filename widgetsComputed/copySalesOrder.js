return async function (rowData) {
    console.log('Original Opportunity Data: ', rowData);

    function copyObjectWithoutExcludedProps(obj) {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !key.startsWith('$') && key !== '_id' && key !== 'rowKey' && key !== 'oldID' && key !== 'createdDate') {
                if (!Array.isArray(obj[key])) {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }

    // Clone the main opportunity
    let newOpportunity = copyObjectWithoutExcludedProps(rowData);
    newOpportunity.name = 'C' + newOpportunity.name;
    let newOpportunityId = await $dgAddRow('opportunities', newOpportunity);
    console.log('Cloned Opportunity ID: ', newOpportunityId);

    // Filter and clone related sales lines
    const salesLines = $getGrid('salesLines').filter(line => line.salesOrder === rowData.rowKey);

    for (let line of salesLines) {
        let newLineObj = copyObjectWithoutExcludedProps(line);
        newLineObj.name = 'C' + line.name;
        newLineObj.salesOrder = newOpportunityId; // Link to new opportunity

        let newLineId = await $dgAddRow('salesLines', newLineObj);

        // Clone estimateOperations
        const estimateOps = $getGrid('estimateOperations').filter(op => op.salesLine === line.rowKey);

        for (let op of estimateOps) {
            let newOpObj = copyObjectWithoutExcludedProps(op);
            newOpObj.salesLine = newLineId;
            await $dgAddRow('estimateOperations', newOpObj);
        }

        // Clone estimateMaterials
        const estimateMats = $getGrid('estimateMaterials').filter(mat => mat.salesLine === line.rowKey);

        for (let mat of estimateMats) {
            let newMatObj = copyObjectWithoutExcludedProps(mat);
            newMatObj.salesLine = newLineId;
            await $dgAddRow('estimateMaterials', newMatObj);
        }

        console.log('Cloned Sales Line ID: ', newLineId);
    }

    $dgShowEditRowModal('opportunities', newOpportunityId);
};
