if (!window.tangleEventListeners) {
    window.tangleEventListeners = {}
}

if (!window.tangleEventListeners.onRecordComment) {
    window.tangleEventListeners.onRecordComment = (payload) => {
        const { comment, mentions } = payload

        if (!mentions.length) return

        for (let uid of mentions) {
            $dgAddRow('notifications', {
                name: `You mentioned in record`,
                commentGridId: comment.gridId,
                commentRowKey: comment.record,
                owner: uid,
                notes: comment.text,
            })
        }
    }

    $vm.$bus.$on('onRecordComment', window.tangleEventListeners.onRecordComment)
}