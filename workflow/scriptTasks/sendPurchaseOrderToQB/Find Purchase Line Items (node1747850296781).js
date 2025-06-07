if (context.err) return;

if (context.payload.lines && context.payload.lines.length) {
    let lines = context.payload.lines;

    for (let i = 0; i < lines.length; i++) {
        try {
            if (!lines[i].ItemBasedExpenseLineDetail?.ItemRef) continue;

            if (!context.missingItems) {
                // Encode FullyQualifiedName to avoid special character issues
                let encodedItemName = encodeURIComponent(lines[i].ItemBasedExpenseLineDetail.ItemRef.name);

                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `https://quickbooks.api.intuit.com/v3/company/${context.companyId}/query?query=${encodeURIComponent(`SELECT * FROM Item WHERE Name = '${lines[i].ItemBasedExpenseLineDetail.ItemRef.name}'`)}`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json', 
                        'Authorization': `Bearer ${context.refreshed.access_token}`
                    }
                };

                let response = await axios(config);
                response = response.data;

                if (response?.QueryResponse?.Item && response.QueryResponse.Item.length > 0) {
                    let item = response.QueryResponse.Item[0];
                    lines[i].ItemBasedExpenseLineDetail.ItemRef["value"] = item.Id;
                } else {
                    context.missingItems = true;
                    context.data.missingItems = true;
                }
            }
        } catch (err) {
            context.data.apierror = err.message;
        }
    }

    context.data.linesModified = lines;
}