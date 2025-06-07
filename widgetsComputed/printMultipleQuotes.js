return async function () {
  $setGlobalModel('printingQuotes', true);

  // Retrieve quotes that are in edit mode
  let selectedQuotes = Object.keys(this.$store.state.dgRowInEditMode)
    .filter((item) => item.startsWith('quotes.'))
    .map((item) => item.split('.')[1]);

  if (selectedQuotes.length < 1) {
    alert('Please select at least one quote to print.');
    $setGlobalModel('printingQuotes', false);
    return;
  }

  let rowData = {};
  let filteredSelectedQuotes = $getGrid('quotes').filter((quote) =>
    selectedQuotes.includes(quote.rowKey)
  );

  console.log('Selected Quotes:', filteredSelectedQuotes);

  // Retrieve the related quote lines for each quote
  for (let quote of filteredSelectedQuotes) {
    let quoteLines = $getGrid('quoteLines').filter(
      (line) => line.quote === quote.rowKey
    );
    console.log('quoteLines: ', quoteLines);
    quote.quoteLines = quoteLines;
  }

  rowData.quotes = filteredSelectedQuotes; // Pass all formatted quotes in rowData
  console.log('Formatted Data for Printing:', rowData);
  rowData.logs = selectedQuotes;

  try {
    // Print the document
    await $printDocument(
      {
        workspaceId: this.currentDash, // Use the current workspace ID
        gridId: 'quoteTemplate', // Replace with the actual template grid ID
        rowKey: '-NoBwm488M1E8xtM3f1W', // Replace with the actual template rowKey
        cellKey: 'template', // The name of the template field
      },
      `Quotes`, // Name of the printed/downloaded file
      rowData,
      true,
      'printedDocuments', // Name of the table where the printed documents will be stored
      {
        name: 'Quotes',
        rowKey: rowData.rowKey,
      },
      true // Save the file in a designated table with metadata
    );

    alert('Quotes printed successfully!');
  } catch (error) {
    console.error('There was an error in $printDocument:', error);
    alert('An error occurred while printing quotes.');
  } finally {
    $setGlobalModel('printingQuotes', false);
  }
};

