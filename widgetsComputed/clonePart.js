return async function (rowData) {
    console.log('Original Part Data:', rowData);

    function copyObjectWithoutExcludedProps(obj) {
        const newObj = {};
        for (const key in obj) {
            if (
                obj.hasOwnProperty(key) &&
                !key.startsWith('$') &&
                key !== '_id' &&
                key !== 'rowKey' &&
                key !== 'oldID' &&
                key !== 'createdDate'
            ) {
                if (!Array.isArray(obj[key])) {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }

    // Clone the main part
    let newPart = copyObjectWithoutExcludedProps(rowData);
    newPart.name = 'Clone Of' + ' ' + newPart.name;
    let newPartId = await $dgAddRow('parts', newPart);
    console.log('Cloned Part ID:', newPartId);

    // Filter and clone related method materials
    const methodMaterials = $getGrid('methodMaterials').filter(mat => mat.parentPart === rowData.rowKey);

    for (let mat of methodMaterials) {
        let newMatObj = copyObjectWithoutExcludedProps(mat);
        newMatObj.parentPart = newPartId;

        await $dgAddRow('methodMaterials', newMatObj);
    }

    // Filter and clone related method operations
    const methodOperations = $getGrid('methodOperations').filter(op => op.parentPart === rowData.rowKey);

    for (let op of methodOperations) {
        let newOpObj = copyObjectWithoutExcludedProps(op);
        newOpObj.parentPart = newPartId;

        await $dgAddRow('methodOperations', newOpObj);
    }

    $dgShowEditRowModal('parts', newPartId);
};
