var ntimeBaseCount

function deleteAndLoadAccrual(tx) {
    if (zeaServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzea", null, processZEA, function errorDeleteZEA(tx, err) {
                displaySQLError("Delete From TCzea", err)
            });
        }
        catch (e) {
        }
    }
    else {
        checkTimeBaseCount(tx)
    }
}

function processZEA(tx) {
    var TCzeaRecord
    var currentResponse = zeaServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzea").each(function () {
        TCzeaRecord = $(this)
        callAddZEA(tx, TCzeaRecord)
    })
    zeaServiceResponse = ""
    if (fullUpdate == false) {
        checkTimeBaseCount(tx)
    }
}

function callAddZEA(tx, TCzeaRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzea(szAccrualType,lDate,lAccrueThruDate,nTimeBase,nTimeAccrued,nTimeUsed) Values('"
    sqlStatement += $(TCzeaRecord).attr('szAccrualType') + "'," + $(TCzeaRecord).attr('lDate') + "," + $(TCzeaRecord).attr('lAccrueThruDate') + ","
    sqlStatement += $(TCzeaRecord).attr('nTimeBase') + "," + $(TCzeaRecord).attr('nTimeAccrued') + "," + $(TCzeaRecord).attr('nTimeUsed') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZEA(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
    }
}

function checkTimeBaseCount(tx) {
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzea where nTimeBase <> '0'", null, function loadZEA(tx, results) {
            ntimeBaseCount = 0
            ntimeBaseCount = results.rows.item(0).myCount
            try {
                tx.executeSql("SELECT * FROM TCzea ", null, buildZEATable, errorSelectZEA)
            }
            catch (e) {

            }
        }, function errorSelectCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzea where nTimeBase <> '0'", err)
        })
    }
    catch (e) {

    }
}



function buildZEATable(tx, results) {
    var tableHTML, rows, row, i = 0
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zeaTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Type</th><th nowrap class="myth" data-colstart="2">Date</th><th nowrap class="myth" data-colstart="3">Thru Date</th>'
    if (ntimeBaseCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="4">Base Amount</th>'
    }
    tableHTML += '<th nowrap class="myth" data-colstart="5">Time Accrued</th><th nowrap class="myth" data-colstart="6">Time Accrued Plus Base</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="7">Time Used</th><th nowrap class="myth" data-colstart="8">Remaining Amount</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        if (ntimeBaseCount > 0) {
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b> </td>'
        }
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
            tableHTML += '<tr nowrap class="mytr">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szAccrualType + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDate) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lAccrueThruDate) + '</td>'
            if (ntimeBaseCount > 0) {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nTimeBase.toFixed(4) + '</td>'
            }
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nTimeAccrued.toFixed(4) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + parseFloat(parseFloat(row.nTimeAccrued) + parseFloat(row.nTimeBase)).toFixed(4) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.nTimeUsed.toFixed(4) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + parseFloat(parseFloat(row.nTimeAccrued) + parseFloat(row.nTimeBase) - parseFloat(row.nTimeUsed)).toFixed(4) + '</td>'
            tableHTML += '</tr>'
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#AccrualTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#AccrualTable").css('height', 'auto')
    }
    else {
        $("#AccrualTable").css('height', deviceHeight + 'px')
    }
}
