function deleteAndLoadAvailability(tx) {
    if (zavServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzav", null, processZAV, function errorDeleteZAV(tx, err) {
                displaySQLError("Delete From TCzav", err)
            });
        }
        catch (e) {

        }
    }
    else {
        loadAvailability(tx) 
    }
}

function processZAV(tx) {
    var TCzavRecord
    var currentResponse = zavServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzav").each(function () {
        TCzavRecord = $(this)
        callAddZAV(tx, TCzavRecord)
    })
    zavServiceResponse = ""
    if (fullUpdate == false) {
        loadAvailability(tx) 
    }
}

function callAddZAV(tx, TCzavRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzav(lCEM_SysId,szDayOfWeek,bDayOfWeekNumber,lStartTimeOne,lStopTimeOne,lStartTimeTwo,lStopTimeTwo,lStartTimeThree,lStopTimeThree"
    sqlStatement += ",lValidDateRangeFrom,lValidDateRangeTo) Values("
    sqlStatement += $(TCzavRecord).attr('lCEM_SysId') + ",'" + $(TCzavRecord).attr('szDayOfWeek') + "'," + $(TCzavRecord).attr('bDayOfWeekNumber') + "," + $(TCzavRecord).attr('lStartTimeOne')
    sqlStatement += "," + $(TCzavRecord).attr('lStopTimeOne') + "," + $(TCzavRecord).attr('lStartTimeTwo') + "," + $(TCzavRecord).attr('lStopTimeTwo')
    sqlStatement += "," + $(TCzavRecord).attr('lStartTimeThree') + "," + $(TCzavRecord).attr('lStopTimeThree') + "," + $(TCzavRecord).attr('lValidDateRangeFrom')
    sqlStatement += "," + $(TCzavRecord).attr('lValidDateRangeTo') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZAV(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function loadAvailability(tx) {
    tx.executeSql('SELECT * FROM TCzav', null, buildZAVTable, function errorSelectZAV(tx, err) {
        displaySQLError('SELECT * FROM TCzav', err)
    })

}

function buildZAVTable(tx, results) {
    var tableHTML, rows, row, i = 0
    lZAV_SysId = 0
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zavTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Day Of Week</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="2">Start Time One</th><th nowrap class="myth" data-colstart="3">Stop Time One</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="4">Start Time Two</th><th nowrap class="myth" data-colstart="5">Stop Time Two</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="6">Start Time Three</th><th nowrap class="myth" data-colstart="7">Stop Time Three</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="8">Valid Date From</th><th nowrap class="myth" data-colstart="9">Valid Date To</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
    }
    else {
        rows = resultsToArray(results.rows);
        $.each(rows, function () {
            if (device.platform == 'android' || device.platform == 'Android') {
                row = rows.item(i);
            }
            else {
                row = rows[i]
            }
            tableHTML += '<tr nowrap class="mytr" id="' + row.lZAV_SysId + '">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szDayOfWeek + '</td>'
            if (row.lStartTimeOne != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStartTimeOne) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lStopTimeOne != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStopTimeOne) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lStartTimeTwo != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStartTimeTwo) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lStopTimeTwo != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStopTimeTwo) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lStartTimeThree != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStartTimeThree) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lStopTimeThree != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStopTimeThree) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lValidDateRangeFrom != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lValidDateRangeFrom) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            if (row.lValidDateRangeTo != 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lValidDateRangeTo) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            }
            tableHTML += '</tr>'
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#availabilityTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#availabilityTable").css('height', 'auto')
    }
    else {
        $("#availabilityTable").css('height', deviceHeight + 'px')
    }

    $('#zavTablel tr').click(function () {
        if ($(this).attr("id")) {
            $(this).closest("tr").siblings().removeClass("highlight");
            $(this).toggleClass("highlight");
            viewAvailability($(this).attr("id"))
        }
    });
}

function viewAvailability(plZAV_SysId) {
    var sqlStatement
    sqlStatement = "SELECT * From TCzav WHERE lZAV_SysId = " + plZAV_SysId
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, SetupAvailability, function errorSelectZAV(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function SetupAvailability(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#szDayOfWeek").val(result.rows.item(0).szDayOfWeek)
    $('#szDayOfWeek').prop('readonly', true);
    $("#szDayOfWeek").css('background-color', 'silver')
    if (result.rows.item(0).lStartTimeOne > 0) {
        $("#lStartTimeOne").val(toSqlTimeValue(result.rows.item(0).lStartTimeOne))
    }
    else {
        $("#lStartTimeOne").val('')
    }
    if (result.rows.item(0).lStopTimeOne > 0) {
        $("#lStopTimeOne").val(toSqlTimeValue(result.rows.item(0).lStopTimeOne))
    }
    else {
        $("#lStopTimeOne").val('')
    }
    if (result.rows.item(0).lStartTimeTwo> 0) {
        $("#lStartTimeTwo").val(toSqlTimeValue(result.rows.item(0).lStartTimeTwo))
    }
    else {
        $("#lStartTimeTwo").val('')
    }
    if (result.rows.item(0).lStopTimeTwo > 0) {
        $("#lStopTimeTwo").val(toSqlTimeValue(result.rows.item(0).lStopTimeTwo))
    }
    else {
        $("#lStopTimeTwo").val('')
    }
    if (result.rows.item(0).lStartTimeThree > 0) {
        $("#lStartTimeThree").val(toSqlTimeValue(result.rows.item(0).lStartTimeThree))
    }
    else {
        $("#lStartTimeThree").val('')
    }
    if (result.rows.item(0).lStopTimeThree > 0) {
        $("#lStopTimeThree").val(toSqlTimeValue(result.rows.item(0).lStopTimeThree))
    }
    else {
        $("#lStopTimeThree").val('')
    }
    if (result.rows.item(0).lValidDateRangeFrom > 0) {
        $("#lValidDateRangeFrom").val(toSqlDateValue(result.rows.item(0).lValidDateRangeFrom))          
    }
    else {
        $("#lValidDateRangeFrom").val('')
    }
    if (result.rows.item(0).lValidDateRangeTo > 0) {        
        $("#lValidDateRangeTo").val(toSqlDateValue(result.rows.item(0).lValidDateRangeTo))              
    }
    else {
        $("#lValidDateRangeTo").val('')
    }
    $("#bDayOfWeekNumber").val(result.rows.item(0).bDayOfWeekNumber)
    $("#lCEM_SysIdAvailability").val(result.rows.item(0).lCEM_SysId)
    $(":mobile-pagecontainer").pagecontainer("change", "#AvailabilityForm")
}

function cancelAvailabilityClicked() {
    szDialogReturnTo = "#Availability"
    callCancelDiaglog()
}


function validateAvailability() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (($.trim($("#lStartTimeOne").val()) && !$.trim($("#lStopTimeOne").val())) || (!$.trim($("#lStartTimeOne").val()) && $.trim($("#lStopTimeOne").val()))) {
        if ($.trim($("#lStopTimeOne").val())) {
            $("#dialogMessage").text("Start Time One Cannot be Blank.")
            szFocusField = "lStartTimeOne"
        }
        else {
            $("#dialogMessage").text("Stop Time One Cannot be Blank.")
            szFocusField = "lStopTimeOne"
        }       
        $.mobile.changePage('#dialogPage', { transition: 'flip' });        
        return false
    }
    if (($.trim($("#lStartTimeTwo").val()) && !$.trim($("#lStopTimeTwo").val())) || (!$.trim($("#lStartTimeTwo").val()) && $.trim($("#lStopTimeTwo").val()))) {
        if ($.trim($("#lStopTimeTwo").val())) {
            $("#dialogMessage").text("Start Time Two Cannot be Blank.")
            szFocusField = "lStartTimeTwo"
        }
        else {
            $("#dialogMessage").text("Stop Time Two Cannot be Blank.")
            szFocusField = "lStopTimTwo"
        }
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        return false
    }
    if (($.trim($("#lStartTimeThree").val()) && !$.trim($("#lStopTimeThree").val())) || (!$.trim($("#lStartTimeThree").val()) && $.trim($("#lStopTimeThree").val()))) {
        if ($.trim($("#lStopTimeThree").val())) {
            $("#dialogMessage").text("Start Time Three Cannot be Blank.")
            szFocusField = "lStartTimeThree"
        }
        else {
            $("#dialogMessage").text("Stop Time Three Cannot be Blank.")
            szFocusField = "lStopTimThree"
        }
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        return false
    }
    var sqlStatement
    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szType,lCEM_SysId,szDayOfWeek,bDayOfWeekNumber,lStartTimeOne,lStopTimeOne,lStartTimeTwo,lStopTimeTwo,"
    sqlStatement += "lStartTimeThree,lStopTimeTHree,lValidDateRangeFrom,lValidDateRangeTo,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "',"
    sqlStatement += "'Update Availability'," + authorizeCEM_SysId + ",'" + $("#szDayOfWeek").val() + "'," + $("#bDayOfWeekNumber").val() + ","
    if ($.trim($("#lStartTimeOne").val())) {
        sqlStatement += toClarionTime($("#lStartTimeOne").val()) + "," + toClarionTime($("#lStopTimeOne").val()) + ","
    }
    else {
        sqlStatement += "0,0,"
    }
    if ($.trim($("#lStartTimeTwo").val())) {
        sqlStatement += toClarionTime($("#lStartTimeTwo").val()) + "," + toClarionTime($("#lStopTimeTwo").val()) + ","
    }
    else {
        sqlStatement += "0,0,"
    }
    if ($.trim($("#lStartTimeThree").val())) {
        sqlStatement += toClarionTime($("#lStartTimeThree").val()) + "," + toClarionTime($("#lStopTimeThree").val()) + ","
    }
    else {
        sqlStatement += "0,0,"
    }
    if ($.trim($("#lValidDateRangeFrom").val())) {
        sqlStatement += toClarionDate($("#lValidDateRangeFrom").val()) + ","
    }
    else {
        sqlStatement += "0,"
    }
    if ($.trim($("#lValidDateRangeTo").val())) {
        sqlStatement += toClarionDate($("#lValidDateRangeTo").val()) + ","
    }
    else {
        sqlStatement += "0,"
    }
    sqlStatement += "0,0,0)"
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