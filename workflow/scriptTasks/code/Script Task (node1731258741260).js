
let key = context.webhookdata.wfQuery.key

const data = (await tablesRef.child('code/' + key).once('value')).val()

//$log.debug(context.webhookdata.wfQuery.key)
context.data = JSON.parse(data.data)




