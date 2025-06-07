// Function to create a new receipt and associated receipt lines for each purchase line.
async function receiveAllPOLines(data) {
    console.log('data: ', data);
    const purchaseLines = $getGrid('purchaseLines').filter(line => line.purchaseOrder === data.rowKey && !line.received);
    const checkForLocation = purchaseLines.find((line) => !line.locationToReceive || !line.quantityToReceive)

    if(checkForLocation) {
        alert('Please ensure a quantity to receive and location to receive is selected for each purchase line')
        return
    }

    let receiptIndex = $getGlobalModel('receiptIndex') ?? 1;
    console.log('receiptIndex pre: ', receiptIndex);

    const nextId = `Receipt-${String(receiptIndex).padStart(4, '0')}`;
    const todaysdate = new Date().toISOString().substring(0, 10);

    let newReceipt = await $dgAddRow('receipts', {
        name: nextId,
        purchaseOrder: data.rowKey,
    });
    console.log('new receipt is', newReceipt);

    $setGlobalModel('receiptIndex', receiptIndex + 1);

    // Get purchase lines for this PO
    console.log('purchase lines are ', purchaseLines);

    for (const [index, line] of purchaseLines.entries()) {
        try {
           let newReceiptLine = await $dgAddRow('receiptLines', {
                name: `${nextId}.0${index + 1}`,
                receipt: newReceipt,
                purchaseOrder: line.purchaseOrder,
                purchaseLine: line.rowKey,
                quantityReceived: line.quantityToReceive,
                location: line.locationToReceive,
                part: line.part
            });

            await $dgSetRow('purchaseLines', line.rowKey, {
                dateReceived: todaysdate,
                // received: true
            });

            await $dgSetRow('purchaseOrders', data.rowKey, {
                dateReceived: todaysdate
            });
        let newTransaction = await $dgAddRow('inventoryTransaction', {

        })
        let locationInventoryRowkey;
        let getLocationInventory = $getGrid('locationInventory').find((d) => d.location === line.locationToReceive && d.part === line.part)

        if(getLocationInventory) {
            locationInventoryRowkey = getLocationInventory.rowKey
        } else {
            let newLocationInventory = await $dgAddRow('locationInventory', {
                part: line.part,
                location: line.locationToReceive
            })
            locationInventoryRowkey = newLocationInventory
        }

        await $dgSetRowVals('inventoryTransaction', newTransaction, {
            parts: line.part,
            quantity: line.quantityToReceive,
            purchaseLine: line.rowKey, 
            locationInventory: locationInventoryRowkey || null,
            unitCost: line.unitPrice,
            cost: line.totalLinePrice,
            receiptLine: newReceiptLine
        })
        await $dgSetRowVals('purchaseLines', line.rowKey, {
            quantityToReceive: 0
        })

        } catch (err) {
            console.log('error creating receipt line: ', err);
        }
    }

    // Check if all lines are received
    let updatedPurchaseLines = $getGrid('purchaseLines').filter(line => line.purchaseOrder === data.rowKey);
    let allReceived = updatedPurchaseLines.every(line => line.received === true);

    // ✅ Fix: Use the existing lookup option for status
    const statusOptions = $getGrid('pOStatus'); // Update if your lookup table has a different name
    const closedStatus = statusOptions.find(s => s.name === 'Closed');

    if (allReceived && closedStatus) {
        await $dgSetRow('purchaseOrders', data.rowKey, {
            status: closedStatus.rowKey
        });
    }

    // Show receipt modal for review
    $dgShowEditRowModal('receipts', newReceipt);
}

// Async function wrapper
return async function(data) {
    try {
        await receiveAllPOLines(data);
    } catch (error) {
        console.error('Error creating receipts:', error);
    }
};


