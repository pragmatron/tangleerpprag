let methodMaterials, methodOperations
try {
    methodMaterials = await tablesRef.child('methodMaterials').orderByChild("parentPart").equalTo(context.payload.part).once('value')
} catch(err) {
    $log(err)
}

try {
    methodOperations = await tablesRef.child('methodOperations').orderByChild("parentPart").equalTo(context.payload.part).once('value')
} catch(err) {
    $log(err)
}

if(methodMaterials.val()){
    methodMaterials = Object.values(methodMaterials.val())
    context.data.methodMaterials = methodMaterials
} else {
    context.data.methodMaterials = []
}

if(methodOperations.val()){
    methodOperations = Object.values(methodOperations.val())
    context.data.methodOperations = methodOperations
} else {
    context.data.methodOperations = []
}


