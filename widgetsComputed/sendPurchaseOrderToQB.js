return async (rowData) => {
    $setGlobalModel('sendingPOToQb', true);

    if(rowData.quickbooksInvoiceID) {
        await updatePurchaseLines(rowData)

        return
    }

    console.log('sending po to qb', rowData)
    let purchaseLines = $getGrid('purchaseLines')
    

    if(!rowData.vendor) {
        alert('Please assign a vendor to the purchase order!')

        return
    }


    // Get lines
    let lines = purchaseLines.filter(line => {
        return line.purchaseOrder == rowData.rowKey //&& !line.description?.includes('DEPOSIT')
    }).flatMap((l, idx) => {
        let taxCode = "3"; // Default tax code

        // E
        if (l.taxCategory === '-Np_Vpp_-cetPgx3oDMl') {
            taxCode = "3";
        }
        // G
        if (l.taxCategory === '-Np_VmqR7yJBF9EtTsJj') {
            taxCode = "2";
        }
        // No tax?
        if (l.taxCategory === '-Ndjjx0GJp7RBCfyNzc7' || !l.taxCategory) {
            taxCode = "NON";
        }

        let itemRef = {"name": 'Purchased Item - 5154 MaterialsCost of Goods', "value": "1010000021"}
        // Construct the primary line
        const primaryLine = {
            "Description": `${l.$part$display}${l.description ? '-' : ''}${l.description ? l.description : ''}`,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
                "TaxCodeRef": {"value": taxCode},
                "Qty": l.quantity,
                "UnitPrice": l.unitPrice,
                "ItemRef": itemRef,
                // "AccountRef": {
                //     "value": "456",
                // }
            },
            "LineNum": (idx * 2) + 1,
            "Amount": l.totalLinePrice
        };

        return [primaryLine];

    }).flat(); // Flatten the array of arrays into a single array

    console.log('lines are', lines);

    let payload = {
        name: rowData.name,
        date: moment(rowData.date).format('YYYY-MM-DD'),
        lines,
        vendorName: rowData.$vendor$display ? rowData.$vendor$display.trim() : '',
        terms: rowData.$terms$display || '',
        vendorEmail: rowData.$vendor?.email ? rowData.$vendor?.email : null,
        vendorPhone: rowData.$vendor?.phone ? rowData.$vendor?.phone : null,
        purchasingPhone: rowData.purchasingPhone ? rowData.purchasingPhone : null,
        purchasingAddress1: rowData.$vendor?.purchasingAddress1 ? rowData.$vendor?.purchasingAddress1.trim() : '',
        purchasingCity: rowData.$vendor?.purchasingCity ? rowData.$vendor?.purchasingCity.trim() : '',
        purchasingState: rowData.$vendor?.purchasingState ? rowData.$vendor?.purchasingState.trim() : '',
        purchasingZipCode: rowData.$vendor?.purchasingZipCode ? rowData.$vendor?.purchasingZipCode.trim() : '',
        shippingAddress1: rowData.$vendor?.shippingAddress1 ? rowData.$vendor?.shippingAddress1.trim() : '',
        shippingCity: rowData.$vendor?.shippingCity ? rowData.$vendor?.shippingCity.trim() : '',
        shippingState: rowData.$vendor?.shippingState ? rowData.$vendor?.shippingState.trim() : '',
        shippingZipCode: rowData.$vendor?.shippingZipCode ? rowData.$vendor?.shippingZipCode.trim() : '',
        shippingCountry: rowData.$vendor?.shippingCountry ? rowData.$vendor?.shippingCountry.trim() : ''
    };

    console.log(payload);

    let d = await this.$wfGetData('-OIFGKwssnd9NRLLmmaY', payload);

    console.log('result is, ', d);

    if (d.missingItems) {
        alert('Purchase Line Item Part not found. Please assign a line product to each line whose name matches a product in QuickBooks');
        $setGlobalModel('sendingPOToQb', false);

    } else if(d.vendorCreateError) {
        alert('Error finding / creating a vendor for the PO, see the console for more info.');
        $setGlobalModel('sendingPOToQb', false);
    }
     else if (d.vendorCreateError || d.apierrorpo || d.apierror || d.poCreateError || d.qberror) {
        alert('Error creating a purchase order, see the console for more info.');
        $setGlobalModel('sendingPOToQb', false);
    } else {
        let doc = d.apiresponsepo?.PurchaseOrder.Id;
        
        if(doc) {
            $dgSetRow('purchaseOrders', rowData.rowKey, {
                sentToQuickbooks:true,
                quickbooksID: doc
                })       

        }



        alert('Purchase Order Created in quickbooks ' + doc);
        $setGlobalModel('sendingPOToQb', false);

    }
}