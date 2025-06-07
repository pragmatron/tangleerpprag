const status = (rowData.status || "").trim().toLowerCase();
switch (status) {
    case "quoted":
        return { title: "Quoted", color: "blue" };
    case "contracted":
        return { title: "Contracted", color: "orange" };
    case "closed won":
        return { title: "Closed Won", color: "green" };
    case "closed lost":
        return { title: "Closed Lost", color: "red" };
    default:
        return { title: "Unknown Status", color: "gray" };
}




