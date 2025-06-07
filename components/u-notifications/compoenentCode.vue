<template>
 <!-- Notification Toggle Button -->
<div>
<b-button @click="toggleNotificationsMenu" style="position: absolute; top: -65px; left:35%; z-index: 100000;">
<!-- Dynamic Icon Class Based on Notification State -->
<i class="fas" :class="[showNotifications ? 'fa-times' : 'fa-bell']"></i>
<!-- Notification Badge Showing Count -->
<span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
</b-button>
</div>
</template>

<script>
module.exports = {
  data() {
    return {
      showNotifications: false, // State to track notification menu display
      activeToasts: [], // Array to keep track of active toast IDs
    };
  },
  methods: {
    toggleNotificationsMenu() {
      this.showNotifications = !this.showNotifications;
      
      if (!this.showNotifications) {
        // Hide all active toasts
        this.activeToasts.forEach(toastId => {
          this.$bvToast.hide(toastId);
        });
        this.activeToasts = []; // Clear the tracked toasts
      } else {
        this.notifications.forEach(notification => {
          const id = `notification-${notification.rowKey}`; // Use rowKey for consistent ID
          this.activeToasts.push(id); // Track the toast ID
          
          const createElement = this.$createElement;
          const previewButton = createElement(
            'button',
            {
              class: ['btn', 'btn-primary', 'btn-sm'],
              on: {
                click: () => {
                  // $dgShowEditRowModal('opportunity', notification.rowKey);
                  $dgShowEditRowModal(
                    notification.commentGridId,
                    notification.commentRowKey,
                  )
                  // this.toggleNotificationsMenu();
                }
              }
            },
            'Open Record'
          );
          
          const vNodesMsg = createElement(
            'p',
            { class: ['text-center', 'mb-0'] },
            [
              createElement('div', `Ready to send: ${notification.$displayName}`),
              previewButton
            ]
          );
          
          const vNodesTitle = createElement(
            'div',
            { class: ['d-flex', 'flex-grow-1', 'align-items-baseline', 'mr-2'] },
            [
              createElement('strong', { class: 'mr-2' }, `${notification.name || ''}`),
              createElement('small', { class: 'ml-auto text-italics' }, `${notification.$createdDate$display || ''}`)
            ]
          );
          
          this.$bvToast.toast([vNodesMsg], {
            title: [vNodesTitle],
            id: id,
            solid: true,
            toaster: 'b-toaster-top-left',
            noAutoHide: true,
            customClass: 'toastBodyStyle'
          });
          $dgSetRowVals('notifications', notification.rowKey, {
            read: true
          })
        });
      }
    }
  },
  computed: {
    notificationCount() {
      return $getGrid('notifications')
        .filter((f) => !f.read)
        .filter((f) => f.owner === fbUser.uid)
        .length;
    },
    notifications() {
      return $getGrid('notifications')
        .filter((f) => !f.read)
        .filter((f) => f.owner === fbUser.uid)
        .sort((a, b) => b.createdDate - a.createdDate);
    }
  }
}
</script>

<style>
.notification-badge {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px !important;
  font-size: 12px;
  position: absolute;
  top: -5px;
  right: -5px;
}

.notification-container {
  max-height: 300px;
  overflow-y: auto;
}

.toast {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 5px;
  background-color: #f7f7f7;
}
</style>