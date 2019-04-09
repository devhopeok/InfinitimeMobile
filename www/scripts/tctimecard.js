var lRegHoursCount, lBreakHoursCount, lOTOneCount, lOTTwoCount, lOTThreeCount, lOTFourCount, lOTACount, ljobCount, ltaskCount, lScheduleCount, szReviewFilter;

function deleteAndLoadTimecard(tx) {
    if (ztsServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzts", null, processZTS, function errorDeleteZTS(tx, err) {
                displaySQLError("Delete From TCzts", err)
            });
        }
        catch (e) {

        }
    }
    else {
        checkZTSReviewdCount(tx)
    }
}

function processZTS(tx) {
    var TCztsRecord
    var currentResponse = ztsServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzts").each(function () {
        TCztsRecord = $(this)
        callAddZTS(tx, TCztsRecord)
    })
    ztsServiceResponse = ""
    if (fullUpdate == false) {
        checkZTSReviewdCount(tx)
    }
}

function callAddZTS(tx, TCztsRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzts(szDepartment,szJobDescription,szTaskDescription,szOtherActivityType,szExceptionDescription,szHolidayName,lDateAssociatedTo"
    sqlStatement += ",bIconForGrid,bAuditTrail,bExceptionsExist,bReviewed,lStartTimeDate,lStartTime,szStartTimeNote,szStartTimeException,lStopTimeDate,lStopTime"
    sqlStatement += ",szStopTimeNote,szStopTimeException,szType,bCalcOverride,nRegularHrs,nBreakHrs,nOTOne,bOTOneApproved,nOTTwo,bOTTwoApproved,nOTThree"
    sqlStatement += ",bOTThreeApproved,nOTFour,bOTFourApproved,nOtherHrsOrAmount,nHourlyWage,nOTOneHourlyWage,nOTTwoHourlyWage,nOTThreeHourlyWage,nOTFourHourlyWage"
    sqlStatement += ",nTotalWages,nOTOneTotalWages,nOTTwoTotalWages,nOTThreeTotalWages,nOTFourTotalWages,szAuditTrailNote,szNote,szEmployeeSchedule) Values('"
    sqlStatement += $(TCztsRecord).attr('szDepartment') + "','" + $(TCztsRecord).attr('szJobDescription') + "','" + $(TCztsRecord).attr('szTaskDescription') + "','"
    sqlStatement += $(TCztsRecord).attr('szOtherActivityType') + "','" + $(TCztsRecord).attr('szExceptionDescription') + "','" + $(TCztsRecord).attr('szHolidayName') + "',"
    sqlStatement += $(TCztsRecord).attr('lDateAssociatedTo') + "," + $(TCztsRecord).attr('bIconForGrid') + "," + $(TCztsRecord).attr('bAuditTrail') + ","
    sqlStatement += $(TCztsRecord).attr('bExceptionsExist') + "," + $(TCztsRecord).attr('bReviewed') + "," + $(TCztsRecord).attr('lStartTimeDate') + ","
    sqlStatement += $(TCztsRecord).attr('lStartTime') + ",'" + $(TCztsRecord).attr('szStartTimeNote') + "','" + $(TCztsRecord).attr('szStartTimeException') + "',"
    sqlStatement += $(TCztsRecord).attr('lStopTimeDate') + "," + $(TCztsRecord).attr('lStopTime') + ",'" + $(TCztsRecord).attr('szStopTimeNote') + "','"
    sqlStatement += $(TCztsRecord).attr('szStopTimeException') + "','" + $(TCztsRecord).attr('szType') + "'," + $(TCztsRecord).attr('bCalcOverride') + ","
    sqlStatement += $(TCztsRecord).attr('nRegularHrs') + "," + $(TCztsRecord).attr('nBreakHrs') + "," + $(TCztsRecord).attr('nOTOne') + ","
    sqlStatement += $(TCztsRecord).attr('bOTOneApproved') + "," + $(TCztsRecord).attr('nOTTwo') + "," + $(TCztsRecord).attr('bOTTwoApproved') + ","
    sqlStatement += $(TCztsRecord).attr('nOTThree') + "," + $(TCztsRecord).attr('bOTThreeApproved') + "," + $(TCztsRecord).attr('nOTFour') + ","
    sqlStatement += $(TCztsRecord).attr('bOTFourApproved') + "," + $(TCztsRecord).attr('nOtherHrsOrAmount') + "," + $(TCztsRecord).attr('nHourlyWage') + ","
    sqlStatement += $(TCztsRecord).attr('nOTOneHourlyWage') + "," + $(TCztsRecord).attr('nOTTwoHourlyWage') + "," + $(TCztsRecord).attr('nOTThreeHourlyWage') + ","
    sqlStatement += $(TCztsRecord).attr('nOTFourHourlyWage') + "," + $(TCztsRecord).attr('nTotalWages') + "," + $(TCztsRecord).attr('nOTThreeHourlyWage') + ","
    sqlStatement += $(TCztsRecord).attr('nOTTwoTotalWages') + "," + $(TCztsRecord).attr('nOTThreeTotalWages') + "," + $(TCztsRecord).attr('nOTFourTotalWages') + ",'"
    sqlStatement += $(TCztsRecord).attr('szAuditTrailNote') + "','" + $(TCztsRecord).attr('szNote') + "','" + $(TCztsRecord).attr('szEmployeeSchedule') + "')"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZTS(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function checkZTSReviewdCount(tx) {
    clearTimeout(loadPageDelay);
    szReviewFilter = ""
    if ($("#bDisableReview").val() == 0) {
        $("#timecardFilter").css('display', '')
        if ($("#szTimecardDateRange").val() == "Last And Current Pay Period") {
            $("#timecardRangdTd").css('display', '')
            switch ($("#szTimecardDateRangeFilter").val()) {
                case "Last And Current":
                    szReviewFilter = "lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                    break;
                case "Last":
                    szReviewFilter = "lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lPastPayPerToDate").val()
                    break;
                case "Current":
                    szReviewFilter = "lDateAssociatedTo between " + $("#lCurrentPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                    break;
                default:
                    szReviewFilter = "lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                    break;
            }
        }
        else {
            $("#timecardRangdTd").css('display', 'none')
            szReviewFilter = "lDateAssociatedTo > 0"
        }
        try {
            tx.executeSql("SELECT count(*) as myCount FROM TCzts where bReviewed <> 1 and " + szReviewFilter, null, ZTSNotReviewsCount, function errorSelectCount(tx, err) {
                displaySQLError("SELECT count(*) as myCount FROM TCzts where bReviewed <> 1 and " + szReviewFilter, err)
            })
        }
        catch (e) {

        }
    }
    else {
        $("#timecardFilter").css('display', 'none')
        szReviewFilter = "lDateAssociatedTo > 0"
        try {
            tx.executeSql("SELECT count(*) as myCount FROM TCzts where nRegularHrs <> 0 and " + szReviewFilter, null, ZTSRegHoursCount, function errorSelectCount(tx, err) {
                displaySQLError("SELECT count(*) as myCount FROM TCzts where nRegularHrs <> 0 and " + szReviewFilter, err)
            })
        }
        catch (e) {

        }

    }
}

function ZTSNotReviewsCount(tx, results) {
    if (results.rows.item(0).myCount == 0) {
        if ($("#szTimecardDateRange").val() == "Last And Current Pay Period") {
            $("#reviewButtonTd").css('display', 'none')
            $("#timecardFilter").css('display', '')
        }
        else {
            $("#timecardFilter").css('display', 'none')
            szReviewFilter = "lDateAssociatedTo > 0"
        }
    }
    else {
        $("#reviewButtonTd").css('display', '')
    }
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nRegularHrs <> 0 and " + szReviewFilter, null, ZTSRegHoursCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nRegularHrs <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }

}

function ZTSRegHoursCount(tx, results) {
    lRegHoursCount = 0
    lRegHoursCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nBreakHrs <> 0 and " + szReviewFilter, null, ZTSBreakHoursCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nBreakHrs <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSBreakHoursCount(tx, results) {
    lBreakHoursCount = 0
    lBreakHoursCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nOTOne <> 0 and " + szReviewFilter, null, ZTSOTOneCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nOTOne <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}


function ZTSOTOneCount(tx, results) {
    lOTOneCount = 0
    lOTOneCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nOTTwo <> 0 and " + szReviewFilter, null, ZTSOTTwoCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nOTTwo <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSOTTwoCount(tx, results) {
    lOTTwoCount = 0
    lOTTwoCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nOTThree <> 0 and " + szReviewFilter, null, ZTSOTThreeCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nOTThree <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSOTThreeCount(tx, results) {
    lOTThreeCount = 0
    lOTThreeCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where nOTFour <> 0 and " + szReviewFilter, null, ZTSOTFourCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where nOTFour <> 0 and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSOTFourCount(tx, results) {
    lOTFourCount = 0
    lOTFourCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where szOtherActivityType <> ' ' and " + szReviewFilter, null, ZTSOTACount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where szOtherActivityType <> ' ' and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSOTACount(tx, results) {
    lOTACount = 0
    lOTACount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where szJobDescription <> ' ' and " + szReviewFilter, null, ZTSjobCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where szJobDescription <> ' ' and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTSjobCount(tx, results) {
    ljobCount = 0
    ljobCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where szTaskDescription <> ' ' and " + szReviewFilter, null, ZTStaskCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where szTaskDescription <> ' ' and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}

function ZTStaskCount(tx, results) {
    ltaskCount = 0
    ltaskCount = results.rows.item(0).myCount
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzts where szEmployeeSchedule <> '' and " + szReviewFilter, null, ZTSScheduleCount, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzts where szEmployeeSchedule <> '' and " + szReviewFilter, err)
        })
    }
    catch (e) {

    }
}


function ZTSScheduleCount(tx, results) {
    var sqlStatement;
    lScheduleCount = 0
    lScheduleCount = results.rows.item(0).myCount
    sqlStatement = "SELECT  * FROM TCzts where " + szReviewFilter
    try {
        tx.executeSql(sqlStatement, null, buildZTSTable, function errorSelectZTS(tx, err) {
            displaySQLError("SELECT  * FROM TCzts where " + szReviewFilter, err)
        })
    }
    catch (e) {
        alert(e.message)
    }

}

function buildZTSTable(tx, results) {
    var tableHTML, I, rows, row, j = 0
    I = 1;
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="ztsTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '"></th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">In Date</th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '"></th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Out Date</th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '"></th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Type</th>'
    I += 1;
    tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Department</th>'
    I += 1;
    if (ljobCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Job</th>'
        I += 1;
    }
    if (ltaskCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Task</th>'
        I += 1;
    }
    if (lRegHoursCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Reg</th>'
        I += 1;
    }
    if (lBreakHoursCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Break</th>'
        I += 1;
    }
    if (lOTOneCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">OT One</th>'
        I += 1;
    }
    if (lOTTwoCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">OT Two</th>'
        I += 1;
    }
    if (lOTThreeCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">OT Three</th>'
        I += 1;
    }
    if (lOTFourCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">OT Four</th>'
        I += 1;
    }
    if (lOTACount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Other Amt</th>'
        I += 1;
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Other Activity Type</th>'
        I += 1;
    }
    if (lScheduleCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="' + I + '">Schedule</th>'
        I += 1;
    }
    tableHTML += '</tr></thead><tbody>'

    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        if (ljobCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        if (ltaskCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        if (lOTTwoCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        if (lOTThreeCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        if (lOTFourCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        if (lOTACount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
        if (lScheduleCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
    }
    else {
        rows = resultsToArray(results.rows);
        $.each(rows, function () {
            if (device.platform == 'android' || device.platform == 'Android') {
                row = rows.item(j);
            }
            else {
                row = rows[j]
            }
            tableHTML += '<tr nowrap class="mytr">'
            switch (row.bIconForGrid) {
                case 0:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridOne.gif"/></td>'
                        break;
                    }
                case 1:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridOne.gif"/></td>'
                        break;
                    }
                case 2:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridTwo.gif"/></td>'
                        break;
                    }
                case 3:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridThree.gif"/></td>'
                        break;
                    }
                case 4:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridFour.gif"/></td>'
                        break;
                    }
                case 5:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridFive.gif"/></td>'
                        break;
                    }
                case 6:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridSix.gif"/></td>'
                        break;
                    }
                case 7:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridSeven.gif"/></td>'
                        break;
                    }
                case 8:
                    {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><img src="images/ztsgrid/IconForTimeGridEight.gif"/></td>'
                        break;
                    }
            }
            if (row.lStartTimeDate > 0) {
                if (row.szExceptionDescription == ' ') {
                    tableHTML += '<td nowrap class="mytd" id=StartTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlDate(row.lStartTimeDate) + '</td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd" id=StartTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:red">' + toSqlDate(row.lStartTimeDate) + '</span></b></td>'
                }

            }
            else {
                if (row.szExceptionDescription == ' ') {
                    tableHTML += '<td nowrap class="mytd" id=StartTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd" id=StartTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b><span style="background-color:red"> </span></td>'
                }

            }
            if (row.lStartTime > 0) {
                if (row.szExceptionDescription == ' ' && row.szStartTimeException == '') {
                    tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStartTime) + '</td>'
                }
                else {
                    switch (row.szStartTimeException.split('|')[0]) {
                        case 'Tardy': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:fuchsia">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Early': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:lime">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Early Departure':
                            {
                                tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:lime">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                                break;
                            }
                        case 'Excessive Weekly Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#FF0033">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Late Departure': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:fuchsia">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Short Break': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:goldenrod">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Long Break': {
                            tableHTML += '<td  nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:chocolate">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Missed Punch': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:red">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Outside Schedule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:yellow">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Under Daily Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#FF9900">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#0099FF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Missing Break': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:"#9900FF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Off Duty': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Unapproved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        case 'Invalid Department': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStartTime) + '</span></b></td>'
                            break;
                        }
                        default:
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStartTime) + '</td>'
                            break;
                    }
                }
            }
            else {
                if (row.szExceptionDescription == ' ' && row.szStartTimeException == '') {
                    tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b> </td>'
                }
                else {
                    switch (row.szStartTimeException.split('|')[0]) {
                        case 'Tardy': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="fuchsia"><b class="ui-table-cell-label"></b><span style="background-color:fuchsia"> </span></td>'
                            break;
                        }
                        case 'Early': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="lime"><b class="ui-table-cell-label"></b><span style="background-color:lime"> </span></td>'
                            break;
                        }
                        case 'Early Departure':
                            {
                                tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="lime"><b class="ui-table-cell-label"></b><span style="background-color:lime"> </span></td>'
                                break;
                            }
                        case 'Excessive Weekly Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#FF0033"><b class="ui-table-cell-label"></b><span style="background-color:#FF0033"> </span></td>'
                            break;
                        }
                        case 'Late Departure': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="fuchsia"><b class="ui-table-cell-label"></b><span style="background-color:fuchsia"> </span></td>'
                            break;
                        }
                        case 'Short Break': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="goldenrod"><b class="ui-table-cell-label"></b><span style="background-color:goldenrod"> </span></td>'
                            break;
                        }
                        case 'Long Break': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="chocolate"><b class="ui-table-cell-label"></b><span style="background-color:chocolate"> </span></td>'
                            break;
                        }
                        case 'Missed Punch': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="red"><b class="ui-table-cell-label"></b><span style="background-color:red"> </span></td>'
                            break;
                        }
                        case 'Outside Schedule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="yellow"><b class="ui-table-cell-label"></b><span style="background-color:yellow"> </span></td>'
                            break;
                        }
                        case 'Under Daily Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#FF9900"><b class="ui-table-cell-label"></b><span style="background-color:#FF9900"> </span></td>'
                            break;
                        }
                        case 'Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Approaching Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#0099FF"><b class="ui-table-cell-label"></b><span style="background-color:#0099FF"> </span></td>'
                            break;
                        }
                        case 'Missing Break': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#9900FF"><b class="ui-table-cell-label"></b><span style="background-color:#0099FF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Off Duty': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Unapproved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Invalid Department': {
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        default:
                            tableHTML += '<td nowrap class="mytd" id=StartTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b> </td>'
                            break;
                    }
                }
            }
            if (row.lStopTimeDate > 0) {
                tableHTML += '<td nowrap class="mytd" id=StopTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlDate(row.lStopTimeDate) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd" id=StopTimeDate_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b></td>'
            }
            if (row.lStopTime > 0) {
                if (row.szExceptionDescription == ' ' && row.szStopTimeException == '') {
                    tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStopTime) + '</td>'
                }
                else {
                    switch (row.szStopTimeException.split('|')[0]) {
                        case 'Tardy': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:fuchsia">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Early': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:lime">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Early Departure':
                            {
                                tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:lime">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                                break;
                            }
                        case 'Excessive Weekly Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#FF0033">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Late Departure': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:fuchsia">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Short Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:goldenrod">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Long Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:chocolate">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Missed Punch': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:red">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Outside Schedule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:yellow">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Under Daily Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#FF9900">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#0099FF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Missing Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:"#9900FF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approaching DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Off Duty': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#00CCFF">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Approved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Unapproved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        case 'Invalid Department': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"><span style="color:#99FF66">' + toSqlTime(row.lStopTime) + '</span></b></td>'
                            break;
                        }
                        default:
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b>' + toSqlTime(row.lStopTime) + '</td>'
                            break;
                    }
                }
            }
            else {
                if (row.szExceptionDescription == ' ' && row.szStopTimeException == '') {
                    tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b> </td>'
                }
                else {
                    switch (row.szStopTimeException.split('|')[0]) {
                        case 'Tardy': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="fuchsia"><b class="ui-table-cell-label"></b><span style="background-color:fuchsia"> </span></td>'
                            break;
                        }
                        case 'Early': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="lime"><b class="ui-table-cell-label"></b><span style="background-color:lime"> </span></td>'
                            break;
                        }
                        case 'Early Departure':
                            {
                                tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="lime"><b class="ui-table-cell-label"></b><span style="background-color:lime"> </span></td>'
                                break;
                            }
                        case 'Excessive Weekly Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#FF0033"><b class="ui-table-cell-label"></b><span style="background-color:#FF0033"> </span></td>'
                            break;
                        }
                        case 'Late Departure': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="fuchsia"><b class="ui-table-cell-label"></b><span style="background-color:fuchsia"> </span></td>'
                            break;
                        }
                        case 'Short Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="goldenrod"><b class="ui-table-cell-label"></b><span style="background-color:goldenrod"> </span></td>'
                            break;
                        }
                        case 'Long Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="chocolate"><b class="ui-table-cell-label"></b><span style="background-color:chocolate"> </span></td>'
                            break;
                        }
                        case 'Missed Punch': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="red"><b class="ui-table-cell-label"></b><span style="background-color:red"> </span></td>'
                            break;
                        }
                        case 'Outside Schedule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="yellow"><b class="ui-table-cell-label"></b><span style="background-color:yellow"> </span></td>'
                            break;
                        }
                        case 'Under Daily Hours': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#FF9900"><b class="ui-table-cell-label"></b><span style="background-color:#FF9900"> </span></td>'
                            break;
                        }
                        case 'Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Approaching Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#0099FF"><b class="ui-table-cell-label"></b><span style="background-color:#0099FF"> </span></td>'
                            break;
                        }
                        case 'Missing Break': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#9900FF"><b class="ui-table-cell-label"></b><span style="background-color:#0099FF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approaching DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule One': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Consecutive Hours Rule Two': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Off Duty': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'DOT Seven Days Rule': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#00CCFF"><b class="ui-table-cell-label"></b><span style="background-color:#00CCFF"> </span></td>'
                            break;
                        }
                        case 'Approved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Unapproved Overtime': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label"></b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        case 'Invalid Department': {
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + ' bgcolor="#99FF66"><b class="ui-table-cell-label">Outs</b><span style="background-color:#99FF66"> </span></td>'
                            break;
                        }
                        default:
                            tableHTML += '<td nowrap class="mytd" id=StopTime_' + row.lZTS_SysId + '><b class="ui-table-cell-label"></b> </td>'
                            break;
                    }
                }
            }
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szType + '</td>'
            if (row.szExceptionDescription == ' ') {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szDepartment + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:#FF0000">' + row.szExceptionDescription + '</span></td>'
            }
            if (ljobCount > 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szJobDescription + '</td>'
            }
            if (ltaskCount > 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szTaskDescription + '</td>'
            }
            if (lRegHoursCount > 0) {
                if (row.nRegularHrs == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nRegularHrs.toFixed(2) + '</td>'
                }
            }
            if (lBreakHoursCount > 0) {
                if (row.nBreakHrs == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nBreakHrs.toFixed(2) + '</td>'
                }
            }
            if (lOTOneCount > 0) {
                if (row.nOTOne == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    if (row.bOTOneApproved == 2) {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:lime">' + row.nOTOne.toFixed(2) + '</span></td>'
                    }
                    else {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:red">' + row.nOTOne.toFixed(2) + '</span></td>'
                    }
                }
            }
            if (lOTTwoCount > 0) {
                if (row.nOTTwo == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    if (row.bOTTwoApproved == 2) {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:lime">' + row.nOTTwo.toFixed(2) + '</span></td>'
                    }
                    else {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:red">' + row.nOTTwo.toFixed(2) + '</span></td>'
                    }
                }
            }
            if (lOTThreeCount > 0) {
                if (row.nOTThree == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b></td>'
                }
                else {
                    if (row.bOTThreeApproved == 2) {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:lime">' + row.nOTThree.toFixed(2) + '</span></td>'
                    }
                    else {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:red">' + row.nOTThree.toFixed(2) + '</span></td>'
                    }
                }
            }
            if (lOTFourCount > 0) {
                if (row.nOTFour == 0) {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label">/b></td>'
                }
                else {
                    if (row.bOTFourApproved == 2) {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:lime">' + row.nOTFour.toFixed(2) + '</span></td>'
                    }
                    else {
                        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:red">' + row.nOTFour.toFixed(2) + '</span></td>'
                    }
                }
            }
            if (lOTACount > 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nOtherHrsOrAmount.toFixed(2) + '</td>'
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szOtherActivityType + '</td>'
            }
            if (lScheduleCount > 0) {
                tableHTML += '<td nowrap class="mytd">' + row.szEmployeeSchedule + '</td>'
            }
            tableHTML += '</tr>'
            j++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#timecardTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#timecardTable").css('height', 'auto')
    }
    else {
        $("#timecardTable").css('height', deviceHeight + 'px')
    }

    $('#timecardTable td').click(function () {
        if ($(this).attr("id")) {
            if ($(this).attr("id").split('_')[0] == "StopTimeDate" || $(this).attr("id").split('_')[0] == "StopTime") {
                retriveZTSStopExceptionById($(this).attr("id").split('_')[1])
            }
            else {
                retriveZTSStartExceptionById($(this).attr("id").split('_')[1])
            }
        }

    });
}

function retriveZTSStopExceptionById(pZTS_SysId) {
    db.transaction(function (tx) {
        tx.executeSql("Select * FROM TCzts WHERE lZTS_SysId = " + pZTS_SysId, null, displayStopException, function errorSelectZTS(tx, err) {
            displaySQLError("Select * FROM TCzts WHERE lZTS_SysId = " + pZTS_SysId, err)
        })
    })
}

function retriveZTSStartExceptionById(pZTS_SysId) {
    db.transaction(function (tx) {
        tx.executeSql("Select * FROM TCzts WHERE lZTS_SysId = " + pZTS_SysId, null, displayStartException, function errorSelectZTS(tx, err) {
            displaySQLError("Select * FROM TCzts WHERE lZTS_SysId = " + pZTS_SysId, err)
        })
    })
}

function displayStopException(tx, results) {
    if (results.rows.length > 0) {
        if (results.rows.item(0).szStopTimeException != "") {
            window.plugins.toast.showWithOptions({
                message: results.rows.item(0).szStopTimeException.split('|')[1],
                duration: "short",
                position: "bottom",
                addPixelsY: -100,
                styling: {
                    opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                    //backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                    cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                    horizontalPadding: 20, // iOS default 16, Android default 50
                    verticalPadding: 16 // iOS default 12, Android default 30
                }
            });
        }
    }
}

function displayStartException(tx, results) {
    if (results.rows.length > 0) {
        if (results.rows.item(0).szStartTimeException != "") {
            window.plugins.toast.showWithOptions({
                message: results.rows.item(0).szStartTimeException.split('|')[1],
                duration: "short",
                position: "bottom",
                addPixelsY: -100,
                styling: {
                    opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                    //backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                    cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                    horizontalPadding: 20, // iOS default 16, Android default 50
                    verticalPadding: 16 // iOS default 12, Android default 30
                }
            });
        }
    }
}

function revieTimecard() {
    var sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,lReviewDateFrom,lReviewDateTo,lDateSent,lTimeSent,bFailureCount)"
    sqlStatement += "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Review Timecard'," + authorizeCEM_SysId + ","
    var UpdateZTSSqlStatement = "Update TCzts Set bReviewed = 1, bIconForGrid = 6 where"
    if ($("#szTimecardDateRange").val() == "Last And Current Pay Period") {
        switch ($("#szTimecardDateRangeFilter").val()) {
            case "Last And Current":
                sqlStatement += $("#lPastPayPerFrmDate").val() + "," + $("#lCurrentPayPerToDate").val()
                UpdateZTSSqlStatement += " lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                break;
            case "Last":
                sqlStatement += $("#lPastPayPerFrmDate").val() + "," + $("#lPastPayPerToDate").val()
                UpdateZTSSqlStatement += " lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lPastPayPerToDate").val()
                break;
            case "Current":
                sqlStatement += $("#lCurrentPayPerFrmDate").val() + "," + $("#lCurrentPayPerToDate").val()
                UpdateZTSSqlStatement += " lDateAssociatedTo between " + $("#lCurrentPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                break;
            default:
                sqlStatement += $("#lPastPayPerFrmDate").val() + "," + $("#lCurrentPayPerToDate").val()
                UpdateZTSSqlStatement += " lDateAssociatedTo between " + $("#lPastPayPerFrmDate").val() + " and " + $("#lCurrentPayPerToDate").val()
                break;
        }
    }
    else {
        sqlStatement += "0,0"
        UpdateZTSSqlStatement += " lDateAssociatedTo > 0"
    }
    sqlStatement += ",0,0,0)"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(UpdateZTSSqlStatement, null, null, function errorUpdateZTS(tx, err) {
                displaySQLError(UpdateZTSSqlStatement, err)
            })
        });
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

function validateTimecardNote() {
    var sqlStatement
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#szTimecardNote").val())) {
        $("#dialogMessage").text("Note is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szTimecardNote"
        return false
    }
    var szLocalNote = $("#szTimecardNote").val().replace(/'/g, "''")

    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,szTimecardNote,lDateSent,lTimeSent,bFailureCount)"
    sqlStatement += "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Timecard Note'," + authorizeCEM_SysId + ",'"
    sqlStatement += szLocalNote + "',0,0,0)"
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
    $("#szTimecardNote").val("")
    return true
}

function cancelTimecardNoteClicked() {
    szDialogReturnTo = "#Home"
    callCancelDiaglog()
}