function deleteAndLoadMessages(tx) {
    if (zecServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzec", null, function sucessDeleteZEC(tx) {
                try {
                    tx.executeSql("Delete From TCzeo", null, processMessages, function errorDeleteZEO(tx, err) {
                        displaySQLError("Delete From TCzeo", err)
                    });
                }
                catch (e) { }

            }, function errorDeleteZEC(tx, err) {
                        displaySQLError("Delete From TCzec", err)
            });
        }
        catch (e) { }
    }
    else {
        loadMessages(tx)
    }
}

function processMessages(tx) {
    var TCzecRecord, TCzeoRecord
    var currentResponse = zecServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzec").each(function () {
        TCzecRecord = $(this)
        callAddZEC(tx, TCzecRecord)
    })
    $(myXML).find("TCzeo").each(function () {
        TCzeoRecord = $(this)
        callAddZEO(tx, TCzeoRecord)
    })
    zecServiceResponse = ""
    if (fullUpdate == false) {
        loadMessages(tx)
    }
}

function callAddZEC(tx, TCzecRecord) {
    var sqlStatement    
    sqlStatement = "Insert Into TCzec(lCEC_SysId,lCEM_SysId,szMessageFromEmployeeName,lDate,lTime,szMessageType,szMessageText,szMessageDescription,lDateRequestFrom,"
    sqlStatement += "lDateRequestTo,lTimeRequestFrom,lTimeRequestTo,lMessageID,bInternetRequired,szRequestStatus,szSwapWithEmployeeName,lSwapWithCEM_SysId) Values(" + TCzecRecord.text() + ","
    sqlStatement += $(TCzecRecord).attr('lCEM_SysId') + ",'" + $(TCzecRecord).attr('szMessageFromEmployeeName') + "'," + $(TCzecRecord).attr('lDate') + ","
    sqlStatement += $(TCzecRecord).attr('lTime') + ",'" + $(TCzecRecord).attr('szMessageType') + "','" + $(TCzecRecord).attr('szMessageText') + "','"
    sqlStatement += $(TCzecRecord).attr('szMessageDescription') + "'," + $(TCzecRecord).attr('lDateRequestFrom') + "," + $(TCzecRecord).attr('lDateRequestTo') + ","
    sqlStatement += $(TCzecRecord).attr('lTimeRequestFrom') + "," + $(TCzecRecord).attr('lTimeRequestTo') + "," + $(TCzecRecord).attr('lMessageID') + ","
    if ($(TCzecRecord).attr('bInternetRequired')) {
        sqlStatement += $(TCzecRecord).attr('bInternetRequired') + ",'"
    }
    else {
        sqlStatement +=  "0,'"
    }
    if ($(TCzecRecord).attr('szRequestStatus')) {
        sqlStatement += $(TCzecRecord).attr('szRequestStatus') + "','"
    }
    else {
        sqlStatement += " ','"
    }
    if ($(TCzecRecord).attr('szSwapWithEmployeeName')) {
        sqlStatement += $(TCzecRecord).attr('szSwapWithEmployeeName') + "',"
    }
    else {
        sqlStatement += " ',"
    }
    if ($(TCzecRecord).attr('lSwapWithCEM_SysId')) {
        sqlStatement += $(TCzecRecord).attr('lSwapWithCEM_SysId') + ")"
    }
    else {
        sqlStatement += "0)"
    }
    //sqlStatement += $(TCzecRecord).attr('bInternetRequired') + ",'" + $(TCzecRecord).attr('szRequestStatus') + "')"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZEC(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function callAddZEO(tx, TCzeoRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzeo(lCEC_SysId,lCEM_SysId,szMessageToEmployeeName,lDateRead,lTimeRead,szRequestApproved) Values("
    sqlStatement += $(TCzeoRecord).attr('lCEC_SysId') + "," + $(TCzeoRecord).attr('lCEM_SysId') + ",'" + $(TCzeoRecord).attr('szMessageToEmployeeName') + "',"
    sqlStatement += $(TCzeoRecord).attr('lDateRead') + "," + $(TCzeoRecord).attr('lTimeRead') + ",'" + $(TCzeoRecord).attr('szRequestApproved') + "')"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZEO(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function loadMessages(tx) {
    loadZEO(tx)
    loadZEC(tx)
}



function loadZEO(tx) {
    var sqlStatement
    sqlStatement = "SELECT zec.lCEC_SysId, zec.szMessageFromEmployeeName, zec.szMessageType, zec.szMessageDescription, zec.lDate, zec.lTime, zeo.lDateRead, zeo.lTimeRead, zec.szSwapWithEmployeeName, zec.lSwapWithCEM_SysId from TCzeo zeo"
    sqlStatement += " LEFT JOIN TCzec zec ON zec.lCEC_SysId = zeo.lCEC_SysId WHERE zeo.lCEM_SysId = " + authorizeCEM_SysId + " and zec.szMessageDescription <> '' ORDER BY zec.lDate DESC, zec.lTime DESC, zec.szMessageDescription"

    try {
        tx.executeSql(sqlStatement, null, buildIncomingTable, function errorLoadZEO(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function buildIncomingTable(tx, results) {
    var tableHTML, rows, row, i = 0
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table" id="zeoTablel">'
    tableHTML += '<thead><tr class="mytr">'
    tableHTML += '<th class="myth" data-colstart="1">'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length > 0) {
        rows = resultsToArray(results.rows);
        $.each(rows, function () {
            if (device.platform == 'android' || device.platform == 'Android') {
                row = rows.item(i);
            }
            else {
                row = rows[i]
            }
            tableHTML += '<tr class="mytr" id="' + row.lCEC_SysId + '">'
            if (row.lDateRead == 0) {
                tableHTML += '<td class="mytd"><b>' + row.szMessageDescription + '</b><br>'
            }
            else {
                tableHTML += '<td class="mytd">' + row.szMessageDescription + '<br>'
            }
            tableHTML += row.szMessageFromEmployeeName + '<br>'
            tableHTML += row.szMessageType
            tableHTML += ' ' + toSqlDate(row.lDate)
            tableHTML += ' ' + toSqlTime(row.lTime)
            tableHTML += '</td></tr>'
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#IncomingTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#IncomingTable").css('height', 'auto')
    }
    else {
        $("#IncomingTable").css('height', deviceHeight + 'px')
    }

    if (!szTabSelected || szTabSelected == '') {
        szTabSelected = 'Incoming'
        $("#OutgoingTab").removeClass("ui-btn-active")
        $("#IncomingTab").removeClass("ui-btn-active").addClass("ui-btn-active");
    }


    $('#zeoTablel tr').click(function () {
        if ($(this).attr("id")) {
            $(this).closest("tr").siblings().removeClass("highlight");
            $(this).toggleClass("highlight");
            viewMessage($(this).attr("id"))
        }

    });
}

function loadZEC(tx) {
    var sqlStatement
    sqlStatement = "SELECT zec.lCEC_SysId, zeo.szMessageToEmployeeName, zec.szMessageType, zec.szMessageDescription, zec.lDate, zec.lTime, zeo.lDateRead, zeo.lTimeRead, zec.szSwapWithEmployeeName, zec.lSwapWithCEM_SysId from TCzeo zeo"
    sqlStatement += " LEFT JOIN TCzec zec ON zec.lCEC_SysId = zeo.lCEC_SysId WHERE zec.lCEM_SysId = " + authorizeCEM_SysId + " and zec.szMessageDescription <> '' ORDER BY zec.lDate DESC, zec.lTime DESC, zec.szMessageDescription"
    try {
        tx.executeSql(sqlStatement, null, buildOutgoingTable, function errorLoadZEC(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function buildOutgoingTable(tx, results) {
    var tableHTML, rows, row, i = 0
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table" id="zecTablel">'
    tableHTML += '<thead><tr class="mytr">'
    tableHTML += '<th class="myth" data-colstart="1">'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length > 0) {
        rows = resultsToArray(results.rows);
        $.each(rows, function () {
            if (device.platform == 'android' || device.platform == 'Android') {
                row = rows.item(i);
            }
            else {
                row = rows[i]
            }
            tableHTML += '<tr class="mytr" id="' + row.lCEC_SysId + '">'
            if (row.lDateRead == 0) {
                tableHTML += '<td class="mytd"><b>' + row.szMessageDescription + '</b><br>'
            }
            else {
                tableHTML += '<td class="mytd">' + row.szMessageDescription + '<br>'
            }
            tableHTML += row.szMessageToEmployeeName + '<br>'
            tableHTML += row.szMessageType
            tableHTML += ' ' + toSqlDate(row.lDate)
            tableHTML += ' ' + toSqlTime(row.lTime)
            tableHTML += '</td></tr>'
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#OutgoingTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#OutgoingTable").css('height', 'auto')
    }
    else {
        $("#OutgoingTable").css('height', deviceHeight + 'px')
    }

    $('#zecTablel tr').click(function () {
        if ($(this).attr("id")) {
            $(this).closest("tr").siblings().removeClass("highlight");
            $(this).toggleClass("highlight");
            viewMessage($(this).attr("id"))
        }

    });

}

function setupOutgoingMessage() {
    if (szNewMessageType == 'View') {
        return
    }
    $("#replyOutgoingMessage").css('display', 'none')
    $("#closeOutgoingMessage").css('display', 'none')
    $("#approveOutgoingMessage").css('display', 'none')
    $("#declineOutgoingMessage").css('display', 'none')
    $("#saveOutgoingMessage").css('display', '')
    $("#cancelOutgoingMessage").css('display', '')

    $("#szMessageToEmployeeName").val('Supervisor')
    $("#szMessageDescription").val('')
    $("#szMessageText").val('')
    $("#lCEC_SysId").val(0)
    $("#lMessageID").val(0)
    $("#nDailyOTAHours").val('')

    $('#szMessageDescription').prop('readonly', false);
    $("#szMessageDescription").css('background-color', 'white')
    $("#lDateRequestFrom").prop("type", "date");
    $('#lDateRequestFrom').prop('readonly', false);
    $("#lDateRequestFrom").css('background-color', 'white')
    $("#lDateRequestTo").prop("type", "date");
    $('#lDateRequestTo').prop('readonly', false);
    $("#lDateRequestTo").css('background-color', 'white')
    $("#lTimeRequestFrom").prop("type", "time");
    $('#lTimeRequestFrom').prop('readonly', false);
    $("#lTimeRequestFrom").css('background-color', 'white')
    $("#lTimeRequestTo").prop("type", "time");
    $('#lTimeRequestTo').prop('readonly', false);
    $("#lTimeRequestTo").css('background-color', 'white')
    $("#nDailyOTAHours").prop("type", "number");
    $('#nDailyOTAHours').prop('readonly', false);
    $("#nDailyOTAHours").css('background-color', 'white')    
    $('#szMessageText').prop('readonly', false);
    $("#szMessageText").css('background-color', 'white')
    $("#szMessageType").val(szNewMessageType)
    $("#szSwapWithRow").css('display', 'none')
    $("#szSwapWithViewRow").css('display', 'none')
    $("#DateFrom").css('display', '')
    $("#DateTo").css('display', '')
    $("#TimeFrom").css('display', '')
    $("#TimeTo").css('display', '')
    $("#FromName").css('display', 'none')
    if (szNewMessageType == "Note") {
        $("#DateFrom").css('display', 'none')
        $("#DateTo").css('display', 'none')
        $("#TimeFrom").css('display', 'none')
        $("#TimeTo").css('display', 'none')
        $('#OTAHours').css('display', 'none')       
    }
    else {
        if ($("#szMessageType").val() == 'Schedule Swap Request') {
            $("#DateTo").css('display', 'none')
            $("#TimeFrom").css('display', 'none')
            $("#TimeTo").css('display', 'none')
            $("#OTAHours").css('display', 'none')
            $("#szSwapWithRow").css('display', '')
        }
        else if ($("#szMessageType").val() == 'Schedule Change Request') {
            $("#OTAHours").css('display', 'none')
        }
        else {
            $("#TimeFrom").css('display', 'none')
            $("#TimeTo").css('display', 'none')
            $("#OTAHours").css('display', '')
        }
    } 
    $("#szOutgoingMessageHeader").text('New ' + szNewMessageType)

}

function validateOutgoingMessage() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    switch (szNewMessageType) {
        case "Note":
            if (!$.trim($("#szMessageDescription").val())) {
                $("#dialogMessage").text("Message Description is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szMessageDescription"
                return false
            }
            if (!$.trim($("#szMessageText").val())) {
                $("#dialogMessage").text("Message is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szMessageText"
                return false
            }
            break;
        default:
            if (!$.trim($("#szMessageDescription").val())) {
                $("#dialogMessage").text("Message Description is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szMessageDescription"
                return false
            }
            if (!$.trim($("#szMessageText").val())) {
                $("#dialogMessage").text("Message is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szMessageText"
                return false
            }
            if (!toClarionDate($("#lDateRequestFrom").val())) {
                $("#dialogMessage").text("Date Request From is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "lDateRequestFrom"
                return false
            }
            if ($("#szMessageType").val() != 'Schedule Swap Request') {
                if (!toClarionDate($("#lDateRequestTo").val())) {
                    $("#dialogMessage").text("Date Request To is Required.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "lDateRequestTo"
                    return false
                }
            }
            if ($("#szMessageType").val() != 'Schedule Swap Request') {
                if ($("#szMessageType").val() == 'Schedule Change Request') {
                    if (!toClarionTime($("#lTimeRequestFrom").val())) {
                        $("#dialogMessage").text("Daily Time Request From is Required.")
                        $.mobile.changePage('#dialogPage', { transition: 'flip' });
                        szFocusField = "lTimeRequestFrom"
                        return false
                    }
                    if (!toClarionTime($("#lTimeRequestTo").val())) {
                        $("#dialogMessage").text("Daily Time Request To is Required.")
                        $.mobile.changePage('#dialogPage', { transition: 'flip' });
                        szFocusField = "lTimeRequestTo"
                        return false
                    }
                }
                else {
                    if (!$("#nDailyOTAHours").val()) {
                        $("#dialogMessage").text("Daily Hours Request is Required.")
                        $.mobile.changePage('#dialogPage', { transition: 'flip' });
                        szFocusField = "nDailyOTAHours"
                        return false
                    }
                }
            }
            if ($("#szMessageType").val() != 'Schedule Swap Request') {
                if (toClarionDate($("#lDateRequestFrom").val()) > toClarionDate($("#lDateRequestTo").val())) {
                    $("#dialogMessage").text("Date Request To Cannot be smaller than Date Request From.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "lDateRequestFrom"
                    return false
                }
            }
            if ($("#szMessageType").val() == 'Schedule Swap Request') {
                if (!$.trim($("#szSWPSelect").val())) {
                    $("#dialogMessage").text("Swap with Employee is Required.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szSWPSelect"
                    return false
                }
            }
            break;
    }
    var sqlStatement
    if (!$("#lCEC_SysId").val()) {
        $("#lCEC_SysId").val(0)
    }
    if (!$("#lMessageID").val()) {
        $("#lMessageID").val(0)
    }
    var szLocalMessageText = $("#szMessageText").val().replace(/'/g, "''")
    var szLocalszMessageDescription = $("#szMessageDescription").val().replace(/'/g, "''")
    if (szNewMessageType == "Note") {
        sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount)"
        sqlStatement += "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Message'," + authorizeCEM_SysId + ",'"
        sqlStatement += $("#szMessageType").val() + "','" + szLocalMessageText + "','" + szLocalszMessageDescription + "'," + $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
    }
    else {
        sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,lDateRequestFrom,lDateRequestTo,"
        sqlStatement += "lTimeRequestFrom,lTimeRequestTo,lCEM_SysId_SwapWith,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'"
        sqlStatement += $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Message'," + authorizeCEM_SysId + ",'" + $("#szMessageType").val() + "','"
        sqlStatement += szLocalMessageText + "','" + szLocalszMessageDescription + "'," + toClarionDate($("#lDateRequestFrom").val()) + ","
        if ($("#szMessageType").val() != 'Schedule Swap Request') {
            sqlStatement += toClarionDate($("#lDateRequestTo").val()) + ","
        }
        else {
            sqlStatement += toClarionDate($("#lDateRequestFrom").val()) + ","
        }
        if ($("#szMessageType").val() != 'Schedule Swap Request') {
            if ($("#szMessageType").val() == 'Schedule Change Request') {
                sqlStatement += toClarionTime($("#lTimeRequestFrom").val()) + "," + toClarionTime($("#lTimeRequestTo").val()) + ",0,"
            }
            else {
                var lTimeFrom = 2880001
                var lTimeTo = ($("#nDailyOTAHours").val() * 360000) + lTimeFrom
                sqlStatement += lTimeFrom + "," + lTimeTo + ",0,"
            }
        }
        else {
            sqlStatement += "0,0," + $("#szSWPSelect").val() + ","
        }
        sqlStatement += $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
    }
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, retriveMaxZTR,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
        })
    }
    catch (e) {
        alert(e.message)
    }
    return true
}

function viewMessage(plCEC_SysId) {
    var sqlStatement
    sqlStatement = "SELECT zec.szMessageFromEmployeeName, zec.lCEM_SysId, zec.szMessageType, zec.szMessageDescription, zec.szMessageText, zec.lDateRequestFrom, zec.lDateRequestTo, zec.lTimeRequestFrom, zec.lTimeRequestTo,"
    sqlStatement += "zeo.szMessageToEmployeeName, zeo.szRequestApproved, zeo.lDateRead, zeo.lTimeRead, zeo.lZEO_SysId, zec.lZEC_SysId, zec.lCEC_SysId, zec.lMessageID, zec.bInternetRequired, zec.szRequestStatus, zec.szSwapWithEmployeeName, zec.lSwapWithCEM_SysId from TCzeo zeo"
    sqlStatement += " LEFT JOIN TCzec zec ON zec.lCEC_SysId = zeo.lCEC_SysId WHERE zeo.lCEC_SysId = " + plCEC_SysId
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, SetupeViewMessage, function errorSelectZEC(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function SetupeViewMessage(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    if (!result.rows.item(0).lDateRead || result.rows.item(0).lDateRead == 0) {
        if (szTabSelected == 'Incoming') {
            $("#lDateRead").val(clarionToday())
            $("#lTimeRead").val(clarionClock)
            $("#lCEC_SysId").val(result.rows.item(0).lCEC_SysId)
            var sqlStatement = "UPDATE TCzeo set lDateRead = " + $("#lDateRead").val() + ", lTimeRead = " + $("#lTimeRead").val() + " WHERE lZEO_SysId = " + result.rows.item(0).lZEO_SysId
            try {
                tx.executeSql(sqlStatement, null, createMessageReadZTR, function errorUpdateZEO(tx, err) {
                    displaySQLError(sqlStatement, err)
                })
            }
            catch (e) {
                alert(e.message)
            }
        }
    }
    $("#szMessageType").val(result.rows.item(0).szMessageType)
    $('#szMessageType').prop('readonly', true);
    $("#szMessageType").css('background-color', 'silver')
    $("#szMessageFromEmployeeName").val(result.rows.item(0).szMessageFromEmployeeName)
    $('#szMessageFromEmployeeName').prop('readonly', true);
    $("#szMessageFromEmployeeName").css('background-color', 'silver')
    $("#szMessageToEmployeeName").val(result.rows.item(0).szMessageToEmployeeName)
    $('#szMessageToEmployeeName').prop('readonly', true);
    $("#szMessageToEmployeeName").css('background-color', 'silver')
    $("#szMessageDescription").val(result.rows.item(0).szMessageDescription)
    $('#szMessageDescription').prop('readonly', true);
    $("#szMessageDescription").css('background-color', 'silver')
    $("#lDateRequestFrom").prop("type", "text");
    if (result.rows.item(0).lDateRequestFrom > 0) {
        $("#lDateRequestFrom").val(toSqlDate(result.rows.item(0).lDateRequestFrom))
    }
    else {
        $("#lDateRequestFrom").val('')
    }
    $('#lDateRequestFrom').prop('readonly', true);
    $("#lDateRequestFrom").css('background-color', 'silver')
    $("#lDateRequestTo").prop("type", "text");
    if (result.rows.item(0).lDateRequestTo > 0) {

        $("#lDateRequestTo").val(toSqlDate(result.rows.item(0).lDateRequestTo))
    }
    else {
        $("#lDateRequestTo").val('')
    }
    $('#lDateRequestTo').prop('readonly', true);
    $("#lDateRequestTo").css('background-color', 'silver')
    $("#lTimeRequestFrom").prop("type", "text");
    if (result.rows.item(0).lTimeRequestFrom > 0) {
        $("#lTimeRequestFrom").val(toSqlTime(result.rows.item(0).lTimeRequestFrom))
    }
    else {
        $("#lTimeRequestFrom").val('')
    }
    $('#lTimeRequestFrom').prop('readonly', true);
    $("#lTimeRequestFrom").css('background-color', 'silver')
    $("#lTimeRequestTo").prop("type", "text");
    if (result.rows.item(0).lTimeRequestTo > 0) {
        $("#lTimeRequestTo").val(toSqlTime(result.rows.item(0).lTimeRequestTo))
    }
    else {
        $("#lTimeRequestTo").val('')
    }
    $('#lTimeRequestTo').prop('readonly', true);
    $("#lTimeRequestTo").css('background-color', 'silver')
    $("#szSwapWithEmployeeName").val(result.rows.item(0).szSwapWithEmployeeName)
    $('#szSwapWithEmployeeName').prop('readonly', true);
    $("#szSwapWithEmployeeName").css('background-color', 'silver')
    $("#szMessageText").val(result.rows.item(0).szMessageText)
    $('#szMessageText').prop('readonly', true);
    $("#szMessageText").css('background-color', 'silver')
    $("#szSwapWithRow").css('display', 'none')
    $("#szSwapWithViewRow").css('display', 'none')   
    $("#DateFrom").css('display', '')
    $("#DateTo").css('display', '')
    $("#TimeFrom").css('display', '')
    $("#TimeTo").css('display', '')
    if (result.rows.item(0).szMessageType == "Note") {
        $("#DateFrom").css('display', 'none')
        $("#DateTo").css('display', 'none')
        $("#TimeFrom").css('display', 'none')
        $("#TimeTo").css('display', 'none')
    }
    else {
        if ($("#szMessageType").val() == 'Schedule Swap Request') {
            $("#DateTo").css('display', 'none')
            $("#TimeFrom").css('display', 'none')
            $("#TimeTo").css('display', 'none')
            $("#OTAHours").css('display', 'none')
            $("#szSwapWithViewRow").css('display', '')
        }
        else if ($("#szMessageType").val() == 'Schedule Change Request') {
            $("#OTAHours").css('display', 'none')
        }
        else {
            $("#TimeFrom").css('display', 'none')
            $("#TimeTo").css('display', 'none')
            $("#OTAHours").css('display', '')
        }
    }

    if (result.rows.item(0).lCEC_SysId > 0) {
        $("#lCEC_SysId").val(result.rows.item(0).lCEC_SysId)
    }
    else {
        $("#lCEC_SysId").val(0)
    }
    if (result.rows.item(0).lMessageID > 0) {
        $("#lMessageID").val(result.rows.item(0).lMessageID)
    }
    else {
        $("#lMessageID").val(0)
    }
    if (result.rows.item(0).lCEM_SysId > 0) {
        $("#lReplyToCEM_SysId").val(result.rows.item(0).lCEM_SysId)
    }
    else {
        $("#lReplyToCEM_SysId").val(0)
    }
    if (result.rows.item(0).lSwapWithCEM_SysId > 0) {
        $("#lSwapWithCEM_SysId").val(result.rows.item(0).lSwapWithCEM_SysId)
    }
    else {
        $("#lSwapWithCEM_SysId").val(0)
    }
    $("#szRequestApproved").val(result.rows.item(0).szRequestApproved)
    $("#bInternetRequired").val(result.rows.item(0).bInternetRequired)
    $("#szRequestStatus").val(result.rows.item(0).szRequestStatus)
    szNewMessageType = "View"
    $(":mobile-pagecontainer").pagecontainer("change", "#OutgoingMessage")

}

function setupApproveMessageOTA() {
    szOTASelectControl = "#szApproveMessageOTASelect"
    if (otaApproveMessagetListitems != "") {
        setSelectControl(otaApproveMessagetListitems, "#szApproveMessageOTASelect")
    }
    else {
        loadZOAFromDB()
    }
}

function createMessageReadZTR(tx, result) {
    var sqlStatement
    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,lCEC_SysId,lDateRead,lTimeRead,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'"
    sqlStatement += $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Message Read'," + authorizeCEM_SysId + "," + $("#lCEC_SysId").val() + "," + $("#lDateRead").val() + "," + $("#lTimeRead").val() + ",0,0,0)"
    try {
        tx.executeSql(sqlStatement, null, retriveMaxZTR, function errorInsertZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }

}


function validateDeclineMessage() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#szDeclineMessageText").val())) {
        $("#dialogMessage").text("Message is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szDeclineMessageText"
        return false
    }
    var sqlStatement
    var szLocalDeclineMessageText = $("#szDeclineMessageText").val().replace(/'/g, "''")
    var szLocalMessageDescription = $("#szMessageDescription").val().replace(/'/g, "''")

    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,szRequestApproved,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount)"
    sqlStatement += "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Message Declined'," + authorizeCEM_SysId + ",'Note','"
    sqlStatement += szLocalDeclineMessageText + "','" + szLocalMessageDescription + " **Declined**','Declined'," + $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, retriveMaxZTR,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
        })
    }
    catch (e) {
        alert(e.message)
    }

    return true
}

function validateReplyMessage() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#szReplyMessageDescription").val())) {
        $("#dialogMessage").text("Message Description is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szReplyMessageDescription"
        return false
    }
    if (!$.trim($("#szReplyMessageText").val())) {
        $("#dialogMessage").text("Message is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szReplyMessageText"
        return false
    }
    var sqlStatement
    var szLocalReplyMessageText = $("#szReplyMessageText").val().replace(/'/g, "''")
    var szLocalReplyMessageDescription = $("#szReplyMessageDescription").val().replace(/'/g, "''")

    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount)"
    sqlStatement += "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Reply Message'," + $("#lReplyToCEM_SysId").val() + ",'"
    sqlStatement += $("#szMessageType").val() + "','" + szLocalReplyMessageText + "','" + szLocalReplyMessageDescription + "'," + $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, retriveMaxZTR,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
        })
    }
    catch (e) {
        alert(e.message)
    }

    return true
}

function validateApproveMessage() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if ($("#szMessageType").val() == "Schedule Change Request" || $("#szMessageType").val() == 'Schedule Swap Request') {
        if (!$.trim($("#szApproveMessageText").val())) {
            $("#dialogMessage").text("Message is Required.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szApproveMessageText"
            return false
        }
        var bWeekday, bNoHoliday
        if ($("#bInternetRequired").val() == 0) {
            if ($("#bWeekDayOnly").is(":checked") == true) {
                bWeekday = 1
            }
            else {
                bWeekday = 0
            }
            if ($("#bNoHoliday").is(":checked") == true) {
                bNoHoliday = 1
            }
            else {
                bNoHoliday = 0
            }
            var sqlStatement
            var szLocalApproveMessageText = $("#szApproveMessageText").val().replace(/'/g, "''")
            var szLocalMessageDescription = $("#szMessageDescription").val().replace(/'/g, "''")

            sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,szRequestApproved,bWeekDayOnly,"
            sqlStatement += "bNoHoliday,lCEM_SysId_SwapWith,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val()
            sqlStatement += "','" + $("#szEmployeeName").val() + "','Message Approved'," + authorizeCEM_SysId + ",'Note','" + szLocalApproveMessageText + "','"
            sqlStatement += szLocalMessageDescription + " **Approved**','Approved'," + bWeekday + "," + bNoHoliday + ","
            if ($("#szMessageType").val() == 'Schedule Swap Request') {
                sqlStatement += $("#lSwapWithCEM_SysId").val() + ","
            }
            else {
                sqlStatement += "0,"
            }
            sqlStatement += $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            try {
                db.transaction(function (tx) {
                    tx.executeSql(sqlStatement, null, retriveMaxZTR,
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
        else {
            var szXMLString = makeSoapHeader("MobileMustApproveMessage", "AtlasClockService/")
            szXMLString += createElementNumber("plCEM_SysId", authorizeCEM_SysId)
            szXMLString += createElementNumber("plCEC_SysId", $("#lCEC_SysId").val())
            szXMLString += makeSoapFooter("MobileMustApproveMessage")
            var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
            szXMLString = encodeURIComponent(szXMLString2)
            var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/MobileMustApproveMessage"
            callWebService(szXMLString, szURL)
            if (ServiceResponse == "false") {
                $("#dialogMessage").text("The Schedule Change Request cannot be approved at this time. Internet Connection is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szApproveMessageText"
                return false
            }
            else {

                var bWeekday, bNoHoliday
                if ($("#bWeekDayOnly").is(":checked") == true) {
                    bWeekday = 1
                }
                else {
                    bWeekday = 0
                }
                if ($("#bNoHoliday").is(":checked") == true) {
                    bNoHoliday = 1
                }
                else {
                    bNoHoliday = 0
                }
                var sqlStatement
                var szLocalApproveMessageText = $("#szApproveMessageText").val().replace(/'/g, "''")
                var szLocalMessageDescription = $("#szMessageDescription").val().replace(/'/g, "''")

                sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,szRequestApproved,bWeekDayOnly,"
                sqlStatement += "bNoHoliday,lCEC_SysId,lMessageID,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val()
                sqlStatement += "','" + $("#szEmployeeName").val() + "','Message Approved'," + authorizeCEM_SysId + ",'Note','" + szLocalApproveMessageText + "','"
                sqlStatement += szLocalMessageDescription + " **Approved**','Approved'," + bWeekday + "," + bNoHoliday + "," + $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ",0,0,0)"
                if (!db) {
                    db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
                }
                try {
                    db.transaction(function (tx) {
                        tx.executeSql(sqlStatement, null, retriveMaxZTR,
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
        }
    }
    else {
        if (!$.trim($("#szApproveMessageText").val())) {
            $("#dialogMessage").text("Message is Required.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szApproveMessageText"
            return false
        }
        if (!$.trim($("#szApproveMessageOTASelect").val())) {
            $("#dialogMessage").text("Other Activity is Required.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szApproveMessageOTASelect"
            return false
        }
        if ($("#bInternetRequired").val() == 0) {
            var sqlStatement = 'SELECT * FROM TCzoa WHERE lZOA_SysId = ' + $("#szApproveMessageOTASelect").val()
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            try {
                db.transaction(function (tx) {
                    tx.executeSql(sqlStatement, null, loadOTAMessageTransaction, function errorSelectZOA(tx, err) {
                        displaySQLError(sqlStatement, err)
                    })
                })
            }
            catch (e) {

            }
        }
        else {
            var nHours = 0
            if (toClarionTime($("#lTimeRequestFrom").val()) > toClarionTime($("#lTimeRequestTo").val())) {
                nHours = ((toClarionTime($("#lTimeRequestTo").val()) + 8640000 - toClarionTime($("#lTimeRequestFrom").val())) / 360000) * (toClarionDate($("#lDateRequestTo").val()) - toClarionDate($("#lDateRequestFrom").val()) + 1)
            }
            else {
                nHours = ((toClarionTime($("#lTimeRequestTo").val()) - toClarionTime($("#lTimeRequestFrom").val())) / 360000) * (toClarionDate($("#lDateRequestTo").val()) - toClarionDate($("#lDateRequestFrom").val()) + 1)
            }
            var szXMLString = makeSoapHeader("MobileWillCauseNegative", "AtlasClockService/")
            szXMLString += createElementNumber("plCEM_SysId", $("#lReplyToCEM_SysId").val())
            szXMLString += createElementNumber("plOTA_SysId", $("#szApproveMessageOTASelect").val())
            szXMLString += createElementNumber("plDateFrom", toClarionDate($("#lDateRequestFrom").val()))
            szXMLString += createElementNumber("pnHours", nHours)
            szXMLString += makeSoapFooter("MobileWillCauseNegative")
            var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
            szXMLString = encodeURIComponent(szXMLString2)
            var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/MobileWillCauseNegative"
            callWebService(szXMLString, szURL)
            if (ServiceResponse == "false") {
                $("#dialogMessage").text("The Time Off Request cannot be approved at this time. Internet Connection is Required.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                szFocusField = "szApproveMessageOTASelect"
                return false
            }
            else {
                var lWillCauseNegative = $(ServiceResponse).find("WillCauseNegativeResult").text();
                if (lWillCauseNegative > 0) {
                    $("#dialogMessage").text("The Time Off Request cannot be approved because it was denied by the Accrual Settings.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szApproveMessageOTASelect"
                    return false
                }
                else {
                    var sqlStatement = 'SELECT * FROM TCzoa WHERE lZOA_SysId = ' + $("#szApproveMessageOTASelect").val()
                    if (!db) {
                        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
                    }
                    try {
                        db.transaction(function (tx) {
                            tx.executeSql(sqlStatement, null, loadOTAMessageTransaction, function errorSelectZOA(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        })
                    }
                    catch (e) {

                    }
                }
            }
        }
    }
    return true
}


function loadOTAMessageTransaction(tx, result) {
    var sqlStatement
    var bWeekday, bNoHoliday
    if ($("#bWeekDayOnly").is(":checked") == true) {
        bWeekday = 1
    }
    else {
        bWeekday = 0
    }
    if ($("#bNoHoliday").is(":checked") == true) {
        bNoHoliday = 1
    }
    else {
        bNoHoliday = 0
    }
    var szLocalApproveMessageText = $("#szApproveMessageText").val().replace(/'/g, "''")
    var szLocalMessageDescription = $("#szMessageDescription").val().replace(/'/g, "''")

    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,szRequestApproved,bWeekDayOnly,bNoHoliday"
    sqlStatement += ",lCEC_SysId,lMessageID,lOTA_SysId,lCodeNumber,szOtherActivityType,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'"
    sqlStatement += $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Message Approved'," + authorizeCEM_SysId + ",'Note','" + szLocalApproveMessageText + "','"
    sqlStatement += szLocalMessageDescription + " **Approved**','Approved'," + bWeekday + "," + bNoHoliday + "," + $("#lCEC_SysId").val() + "," + $("#lMessageID").val() + ","
    sqlStatement += result.rows.item(0).lZOA_SysId + "," + result.rows.item(0).lCodeNumber + ",'" + result.rows.item(0).szOtherActivityType + "'" + ",0,0,0)"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, retriveMaxZTR,
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