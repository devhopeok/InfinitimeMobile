function loadTransactions(tx) {
    loadPendingTransactions(tx)
    loadFailedTransactions(tx)
    loadSentTransactions(tx)
}

function loadPendingTransactions(tx) {
    ztrToDeletedId = 0
    var sqlStatement = "SELECT * From TCZTR WHERE bFailureCount = 0 and lDateSent = 0 and lTimeSent = 0 ORDER BY lDate, lTime"
    try {
        tx.executeSql(sqlStatement, null, buildPendingransactions, function errorSelectZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function loadFailedTransactions(tx) {
    ztrToDeletedId = 0
    var sqlStatement = "SELECT * From TCZTR WHERE bFailureCount > 0 and lDateSent = 0 and lTimeSent = 0 ORDER BY lDate, lTime"
    try {
        tx.executeSql(sqlStatement, null, buildFailedTransactionsTable, function errorSelectZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function loadSentTransactions(tx) {
    var sqlStatement = "SELECT * From TCZTR WHERE bFailureCount = 0 and lDateSent > 0 and lTimeSent > 0  ORDER BY lDate, lTime"
    try {
        tx.executeSql(sqlStatement, null, buildSentTransactionsTable, function errorSelectZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function buildPendingransactions(tx, results) {
    var tableHTML
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="ztrPendingTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Date</th><th nowrap class="myth" data-colstart="2">Time</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="3">Type</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
    }
    else {
        for (var i = 0; i < results.rows.length; i++) {
            var row = results.rows.item(i);
            tableHTML += '<tr nowrap class="mytr">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDate) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTime) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' +row.szType + '</td>'
            tableHTML += '</tr>'
        }
    }
    tableHTML += '</tbody></table>'
    $("#PendingTransactionsTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#PendingTransactionsTable").css('height', 'auto')
    }
    else {
        $("#PendingTransactionsTable").css('height', deviceHeight + 'px')
    }

    if (!szTabSelected || szTabSelected == '' || szTabSelected == 'Incoming' || szTabSelected == 'Outgoing') {
        szTabSelected = 'PendingTransactions'
        $("#SentTab").removeClass("ui-btn-active")
        $("#FailedTab").removeClass("ui-btn-active")
        $("#PendingTab").removeClass("ui-btn-active").addClass("ui-btn-active");
    }
}



function buildFailedTransactionsTable(tx, results) {
    var tableHTML
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="ztrFailedTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Date</th><th nowrap class="myth" data-colstart="2">Time</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="3">Type</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
    }
    else {
        for (var i = 0; i < results.rows.length; i++) {
            var row = results.rows.item(i);
            tableHTML += '<tr nowrap class="mytr" id="' + row.lZTR_SysId + '">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDate) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTime) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szType + '</td>'
            tableHTML += '</tr>'
        }
    }
    tableHTML += '</tbody></table>'
    $("#FailedTransactionsTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#FailedTransactionsTable").css('height', 'auto')
    }
    else {
        $("#FailedTransactionsTable").css('height', deviceHeight + 'px')
    }

    $('#ztrFailedTablel tr').click(function () {
        if ($(this).attr("id")) {
            $(this).closest("tr").siblings().removeClass("highlight");
            $(this).toggleClass("highlight");
            ztrToDeletedId = $(this).attr("id")
            szTabSelected = 'FailedTransactions'
            szDialogReturnTo = "#DeleteTransactions"
            $("#dialogHeader").text("Delete Failed Transaction")
            $("#YesNoblock").css("display", "")
            $("#Closeblock").css("display", "none")
            $("#dialogMessage").text("Are You Sure You Want To Delete Highlighted Failed Transactions?")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
        }
    });
}

function deleteTCztr() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM TCztr WHERE lZTR_SysId = " + ztrToDeletedId, null, loadFailedTransactions, function errorDeleteZTR(tx, err) {
            displaySQLError("DELETE FROM TCztr WHERE lZTR_SysId = " + ztrToDeletedId, err)
        })
    })
}

function buildSentTransactionsTable(tx, results) {
    var tableHTML
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zshTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Date</th><th nowrap class="myth" data-colstart="2">Time</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="3">Type</th><th nowrap class="myth" data-colstart="4">Date Sent</th><th nowrap class="myth" data-colstart="5">Time Sent</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
    }
    else {
        for (var i = 0; i < results.rows.length; i++) {
            var row = results.rows.item(i);
            tableHTML += '<tr nowrap class="mytr">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDate) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTime) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szType + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDateSent) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTimeSent) + '</td>'
            tableHTML += '</tr>'
        }
    }
    tableHTML += '</tbody></table>'
    $("#SentTransactionsTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#SentTransactionsTable").css('height', 'auto')
    }
    else {
        $("#SentTransactionsTable").css('height', deviceHeight + 'px')
    }
}


function resendFailedTransactions() {
    var sqlStatement = "UPDATE TCZTR SET bFailureCount = 0 WHERE bFailureCount > 0 and lDateSent = 0 and lTimeSent = 0"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) { tx.executeSql(sqlStatement, null, loadFailedTransactions,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
        })
    }
    catch (e) {
        alert(e.message)
    }
}