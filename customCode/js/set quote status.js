async function setQuoteStatus(rowKey) {
  await $setDataGridVal('quotes', `${rowKey}.status`, '-OLEPHkPJX51qpAbhVk8');
 
}


window.setQuoteStatus = setQuoteStatus


