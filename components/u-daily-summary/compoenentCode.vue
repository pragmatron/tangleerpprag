<template>
    <div class="box-daily">
      <div class="info-and-timing-section">
        <div class="personal-info-section">
          <div class="photo-user">
            <div :src="fbUser?.photoURL" class="avatar" alt="Avatar"></div>
          </div>
          <div class="personal-contact">
            <p class="username-heading">{{ fbUser.displayName }}</p>
            <p class="user-email">{{ fbUser.email }}</p>
          </div>
        </div>
        <div class="timing-section">
          <div class="start-time">
            <p class="timing-header">Started:</p>
            <h5 class="timing-number">
              {{startTime ? startTime : 'Not started'}}
            </h5>
          </div>
          <b-button
          class="start-btn"
          title="Start Day"
          variant="success"
          @click="startDay"
          >
          Start Day
          </b-button>
  
          <b-button
          class="stop-btn"
          title="Stop Day"
          v-if="$getUser('card')"
          variant="danger"
          @click="dayStopped"
          >
          End Day
          </b-button>
        </div>
        <div class="summary-bar">
          <div class="summary-status-containers running-dot">
            <i class="fas fa-stopwatch"></i>
            <p class="summary-header" style="margin-bottom: 0 !important">
              {{ $getGrid('workOrderOperations').filter((operation => operation.started != null && operation.activeUser === fbUser.uid)).length}}
              Running
            </p>
          </div>
          <div class="summary-status-containers completed-dot">
            <i class="fa fa-check"></i>
            <p class="summary-header" style="margin-bottom: 0 !important">
              {{ $getGrid('workOrderOperations').filter((operation => operation.completed && operation.activeUser === fbUser.uid)).length }}
              Completed
            </p>
          </div>
        </div>
      </div>
      <hr class="full-keyline" />
      <div class="table-section" v-if="getCurrentWorkOrders">
        <div
          v-for="workOrder in getCurrentWorkOrders"
          :key="workOrder.id"
          class="table-rows"
        >
          <div class="table-section_left">
            <p
              :class="{'section-left_title items item-completed': workOrder?.completed, 'section-left_title items item-running': !workOrder?.completed }"
            >
              {{workOrder?.name}}
            </p>
            <p class="section-left_text">Started:</p>
            <p class="section-left_date">{{workOrder?.$started$display}}</p>
          </div>
          <div class="table-section_md">
            <p class="items">{{workOrder?.$workOrder$display}}</p>
            <p class="items subtitle">GMSP-83H</p>
          </div>
          <div class="table-section_right">
            <div
              style="cursor: pointer"
              @click="$dgShowEditRowModal('workOrderOperations', workOrder?.rowKey, {formLayout:'-Ne8cXE6Zf5-_3EQIdzP'})"
              class="status-boxes open"
            >
              <p class="status-text">Open</p>
            </div>
            <div :class="getCircleClass(workOrder?.completed)">
              <i
                :class="getIconsClass(workOrder?.completed)"
                style="font-size: 16px; padding: 0.5em"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  module.exports = {
    props: [],
    data() {
      return {
        items: [],
        startTime: '--:--',
        workOrders: null,
        fbUser,
      }
    },
  
    created() {
      this.time();
    },
    computed: {
      getCurrentWorkOrders: () => {
        return $getGrid('workOrderOperations').filter(operation => operation.activeUser === fbUser.uid);

      },
      $getUser() {
        return this.$helpers.$getUser
      },
      $getGrid() {
        return this.$helpers.$getGrid
      },
    },
    methods: {
      time() {
        const timeCard = $getGrid('timeCards').filter((card) => card.user === fbUser.uid).filter((c) => new Date(c.$started$Date).toLocaleDateString() === new Date().toLocaleDateString())
        if(timeCard) {
          const timeFromCard = timeCard[0]?.$started$display.slice(-5)
          return this.startTime = timeFromCard
        } else {
          console.log('no time cards for today')
        }
  
      },
  
      // getCurrentWorkOrders() {
      //   this.workOrders = $getGrid('workOrderOperations').filter(operation => operation.activeUser === fbUser.uid);
      // },
  
      startDay() {
        window.dayStarted()
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log('formatted time: ', formattedTime)
        this.startTime = formattedTime
      },
  
      calculateStartTime() {
        const now = new Date();
  
        let year = now.getFullYear();
        let month = (1 + now.getMonth()).toString().padStart(2, '0');
        let day = now.getDate().toString().padStart(2, '0');
        const formattedDate = month + '/' + day + '/' + year
  
          const startingTime = $getGrid('timeCards').filter((card) => {
          return card.$started$Date == formattedDate && fbUser.uid === card.user
          })
  
        if(startingTime.length > 0) {
          const dateTimeString = startingTime[0]?.$started$display.split(', ');
          this.startTime = dateTimeString[1]
        } else {
          this.startTime = '--:--';
        }
  
      },
      
      async waitForShopOpsFunction() {
          while (typeof window.getShopOps !== 'function') {
              await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
          }
      },
  
      dayStopped() {
        window.dayStopped()
      },
  
      getIconsClass(completed){
          return completed ? ' fa fa-check' : 'fa fa-stopwatch';
      },
  
      getCircleClass(completed){
          return completed ? 'completed-dot circle-icon' : 'running-dot circle-icon'
      }
    },
  }
  </script>
  
  <style scoped>
  .box-daily {
    background: white;
    height: 100%;
    border-radius: 10px;
    padding: 1em 0em;
    border: 1px solid #D3D3D3 !important;
   }
  
  .info-and-timing-section {
    display: flex;
    flex-direction: column;
    padding: 0.5em;
  }
  
  .status-boxes {
    display: flex;
    width: 60px;
    font-family: "Noto Sans", sans-serif !important;
  }
  
  .status-boxes:hover {
    background-color: #28a745;
  }
  
  .btns-box {
      margin-left: 10px;
    width: 40%;
  }
  
  .start-time {
    max-width: 75%;
    min-width: 40%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e7e8ea;
    border-radius: 10px;
    height: 40px;
  }
  
  .summary-header {
    position: relative;
    left: -3px;
    padding: 0.5em;
    font-weight: 400;
    font-size: 12px;
  }
  
  .table-headings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid rgba(205, 204, 205, 0.8);
  }
  
  .table-section {
      display: flex;
      justify-content: center;
      flex-direction: column;
    align-items: center;
  }
  
  .table-section_left {
    display: flex;
    flex-direction: column;
    justify-content: start;
    width: 45%;
  }
  
  .section-left_title {
    font-weight: 600;
    font-size: 14px;
    margin-left: 0px;
  }
  
  .section-left_text {
    margin-left: 0px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 0;
    color: #11142d;
  }
  
  .section-left_date {
    font-size: 12px;
    font-weight: 400;
    color: #11142d;
  }
  
  .table-section_md {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
  }
  
  .table-section_right {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  }
  
  .table-rows {
    width: 91%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 16px 0 0;
    overflow: scroll;
    border-bottom: 1px solid rgba(205, 204, 205, 0.8);
    box-shadow: 0px 1px 0px 0px #11142d0a;
  }
  
  .items {
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 600;
    color: #11142d;
  }
  
  @media only screen and (max-width: 1240px) {
    .start-btn {
      font-size: 10px;
      display: grid !important;
      justify-self: center !important;
      align-self: center !important;
      background-color: #2bbf4b !important;
    }
  
    .stop-btn {
      display: grid !important;
      font-size: 10px;
      justify-self: center !important;
      align-self: center !important;
    }
  
    .timing-number {
      padding-top: 2px !important;
      padding-bottom: 2px !important;
      margin-bottom: 2px !important;
      color: #585b6c !important;
      font-size: 14px !important;
    }
  
    .items {
      font-size: 5px;
    }
  
    .table-titles {
      font-size: 10px;
      font-weight: 600;
      padding-left: 2px;
      padding-top: 5px;
    }
  
    .personal-info-section {
      display: flex;
      flex-direction: column;
    }
  
    .avatar {
      width: 80px !important;
      height: 80px !important;
      margin: 0 5px 0 5px !important;
      padding: 0 !important;
    }
  
    .username-heading {
      font-size: 10px !important;
      padding-right: 0px !important;
    }
  
    .user-email {
      font-size: 10px !important;
      text-align: center;
    }
  
    .timing-header {
      margin-left: 5px !important;
      margin-bottom: 0 !important;
      font-size: 14px !important;
      padding: 0 !important;
      color: #8d8e9a !important;
    }
  
    .timing-number {
      margin-left: 5px !important;
      font-size: 12px !important;
      padding-left: 0 !important;
      color: #585b6c !important;
    }
  
    .summary-header {
      font-size: 12px;
      font-weight: 400;
    }
  }
  
  .username-heading {
    font-size: 20px !important;
    font-weight: 600 !important;
    line-height: 28px;
    text-align: center;
    margin-bottom: 0;
  }
  
  .user-email {
    font-family: Noto Sans;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    text-align: center;
    margin-top: 10px;
    color: #585b6c;
  }
  
  .personal-info-section {
    display: flex;
    flex-direction: column;
  }
  
  .personal-contact {
    align-self: center;
  }
  
  .photo-user {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 100%;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .timing-section {
    display: flex;
    padding: 0.6em;
    width: 100%;
    justify-content: center;
    align-items: center !important;
  }
  
  .timing-header {
    font-weight: 400;
    font-size: 14px;
    margin-left: 2px;
    margin-bottom: 0 !important;
    padding-left: 10px;
    color: #8d8e9a !important;
  }
  
  .timing-number {
    margin-left: 5px;
    color: #585b6c;
    padding: 0px !important;
  }
  
  .start-btn {
    height: 40px;
    font-size: 12px !important;
    border: none;
  }
  
  .start-btn,
  .stop-btn {
    margin-left: 10px;
  }
  
  .stop-btn {
    max-height: 40px !important;
    font-size: 12px !important;
  }
  
  .summary-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 0.5em;
  }
  
  .summary-status-containers {
    min-width: 100px;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 25px;
  }
  
  .running-dot {
    background-color: rgba(82, 151, 255, 0.1);
    color: #5297ff;
  }
  
  .running-dot i {
    color: #5297ff;
    font-size: 14px;
    padding: 0.5em;
  }
  
  .paused-dot {
    background: #735eff1a;
    color: #735eff;
  }
  
  .paused-dot i {
    color: #735eff;
    font-size: 14px;
    padding: 0.5em;
  }
  
  .completed-dot {
    background-color: rgba(43, 191, 75, 0.1);
    color: #2bbf4b;
  }
  
  .completed-dot i {
    color: #2bbf4b;
    font-size: 14px;
    padding: 0.5em;
  }
  
  .items {
    width: 100%;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 0.3em;
  }
  
  .subtitle {
      color: #585B6C
  }
  
  .circle-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
  }
  
  .box_circle-icon {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 15%;
  }
  
  .icon {
    color: #fff;
    font-size: 14px;
    padding: 0.5em;
  }
  
  h5 {
    padding: 0px !important;
    margin: 0px !important;
    margin-right: 10px !important;
    font-size: 14px !important;
    font-weight: 400 !important;
  }
  
  .full-keyline {
    border-bottom: 1px solid #e7e8ea;
    margin: 10px 0 0;
  }
  </style>
  