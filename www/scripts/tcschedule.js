var ljobCount, ltaskCount, lZSH_SysId, lSHC_SysId, lCEM_SysId_SHC

function deleteAndLoadSchedule(tx) {
    if (zshServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzsh", null, processZSH, function errorDeleteZSH(tx, err) {
                displaySQLError("Delete From TCzsh", err)
            });
        }
        catch (e) {

        }
    }
    else {
       checkZSHJobCount(tx)
    }
}

function processZSH(tx) {
    var TCzshRecord
    var currentResponse = zshServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzsh").each(function () {
        TCzshRecord = $(this)
        callAddZSH(tx, TCzshRecord)
    })
    zshServiceResponse = ""
    if (fullUpdate == false) {
        checkZSHJobCount(tx)
    }
}

function callAddZSH(tx, TCzshRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzsh(lBeginTime,lEndTime,szType,lDate,szDepartment,nDepartmentLatitude,nDepartmentLongitude,szJobDescription,nJobLatitude,nJobLongitude"
    sqlStatement += ",szTaskDescription,nTaskLatitude,nTaskLongitude) Values("
    sqlStatement += $(TCzshRecord).attr('lBeginTime') + "," + $(TCzshRecord).attr('lEndTime') + ",'" + $(TCzshRecord).attr('szType') + "'," + $(TCzshRecord).attr('lDate')
    sqlStatement += ",'" + $(TCzshRecord).attr('szDepartment') + "'," + $(TCzshRecord).attr('nDepartmentLatitude') + "," + $(TCzshRecord).attr('nDepartmentLongitude')
    sqlStatement += ",'" + $(TCzshRecord).attr('szJobDescription') + "'," + $(TCzshRecord).attr('nJobLatitude') + "," + $(TCzshRecord).attr('nJobLongitude')
    sqlStatement += ",'" + $(TCzshRecord).attr('szTaskDescription') + "'," + $(TCzshRecord).attr('nTaskLatitude') + "," + $(TCzshRecord).attr('nTaskLongitude') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZSH(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function checkZSHJobCount(tx) {
    ljobCount = 0
    ltaskCount = 0
    try {
        tx.executeSql("SELECT count(*) as myCount FROM TCzsh where szJobDescription <> ' '", null, function ZSHjobCount(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    ljobCount = result.rows.item(0).myCount
                }
            }
            try {
                tx.executeSql("SELECT count(*) as myCount FROM TCzsh where szTaskDescription <> ' '", null, function ZSHtaskCount(tx, result) {
                    if (result) {
                        if (result.rows.length > 0) {
                            ltaskCount = result.rows.item(0).myCount
                        }
                    }
                    try{
                        tx.executeSql('SELECT * FROM TCzsh', null, buildZSHTable, function errorSelectZSH(tx, err) {
                            displaySQLError('SELECT * FROM TCzsh', err)
                        })
                    }
                    catch (e) { }

                }, function errorSelectZSHTaskCount(tx, err) {
                    displaySQLError("SELECT count(*) as myCount FROM TCzsh where szTaskDescription <> ' '", err)
                })

            }
            catch (e) { }

        }, function errorSelectZSHJobCount(tx, err) {
            displaySQLError("SELECT count(*) as myCount FROM TCzsh where szJobDescription <> ' '", err)
        })
    }
    catch (e) { }

}

function buildZSHTable(tx, results) {
    var tableHTML, rows, row, i=0
    lZSH_SysId = 0
    if ($("#szGeofenceBase").val() == "" || $("#szGeofenceBase").val() == "Schedule") {
        lgeofenceCount = 0
        if (bgGeo) {
            // clearDatabase is not working,  I have to maually remove geofences
            bgGeo.getGeofences(function (geofences) {
                for (var n = 0, len = geofences.length; n < len; n++) {
                    bgGeo.removeGeofence(geofences[n].identifier, function () {
                    }, function (error) {
                    });
                }
            }, function (error) {
            });
        }
    }
    if ($('#bDisableSHC').val() == 0) {
        $("#RequestScheduleCoverTable").css('display', 'none')
    }
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zshTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Day of Week</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="2">Type</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="3">Date</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="4">Begin Time</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="5">End Time</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="6">Department</th>'
    if (ljobCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="7">Job</th>'
    }
    if (ltaskCount > 0) {
        tableHTML += '<th nowrap class="myth" data-colstart="8">Task</th>'
    }
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
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
            tableHTML += '<tr nowrap class="mytr" id="' + row.lZSH_SysId + '">'

            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var dayName = days[(new Date(toSqlDate(row.lDate))).getDay()];

            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + dayName + '</td>'
            if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szType + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + row.szType + '</span></td>'
            }
            if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDate) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + toSqlDate(row.lDate) + '</span></td>'
            }
            if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lBeginTime) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + toSqlTime(row.lBeginTime) + '</span></td>'
            }
            if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lEndTime) + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + toSqlTime(row.lEndTime) + '</span></td>'
            }
            if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szDepartment + '</td>'
            }
            else {
                tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + row.szDepartment + '</span></td>'
            }
            if (ljobCount > 0) {
                if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szJobDescription + '</td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + row.szJobDescription + '</span></td>'
                }
            }
            if (ltaskCount > 0) {
                if (row.szType == "Working" || row.szType == "Paid Break" || row.szType == "Unpaid Break") {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szTaskDescription + '</td>'
                }
                else {
                    tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b><span style="color:Red">' + row.szTaskDescription + '</span></td>'
                }
            }
            tableHTML += '</tr>'
            if ($("#szGeofenceBase").val() == "" || $("#szGeofenceBase").val() == "Schedule") {
                if (row.lDate == clarionToday() && row.lEndTime >= clarionClock()) {
                    //if (device.platform == 'android' || device.platform == 'Android') {
                      //  if (lgeofenceCount <= 100) {
                            BuildZSHRowGeofence(row)
                        //}
                    //}
                    //else {
                    //    if (lgeofenceCount <= 20) {
                    //        BuildZSHRowGeofence(row)
                    //    }
                    //}
                }
            }
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#scheduleTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#scheduleTable").css('height', 'auto')
    }
    else {
        $("#scheduleTable").css('height', deviceHeight + 'px')
    }
    if ($('#bDisableSHC').val() == 0) {        
        $('#scheduleTable tr').click(function () {
            if ($(this).attr("id")) {
                $(this).closest("tr").siblings().removeClass("highlight");
                $(this).toggleClass("highlight");
                lZSH_SysId = $(this).attr("id")
                $("#RequestScheduleCoverTable").css('display', '')
                //viewMessage($(this).attr("id"))
            }

        });
    }
    else {
        $("#RequestScheduleCoverTable").css('display', 'none')
    }

}

function BuildZSHRowGeofence(row) {
    var geoFenceObject
    geoFenceObject = {
        identifier: row.lZSH_SysId,
        radius: 100,
        notifyOnEntry: true,
        notifyOnExit: true,
        notifyOnDwell: false,
        loiteringDelay: 30000   // <-- 30 seconds
    }
    if (row.nTaskLatitude != 0 && row.nTaskLongitude != 0) {
        geoFenceObject.latitude = row.nTaskLatitude
        geoFenceObject.longitude = row.nTaskLongitude
    }
    else if (row.nJobLatitude != 0 && row.nJobLongitude != 0) {
        geoFenceObject.latitude = row.nJobLatitude
        geoFenceObject.longitude = row.nJobLongitude
    }
    else if (row.nDepartmentLatitude != 0 && row.nDepartmentLongitude != 0) {
        geoFenceObject.latitude = row.nDepartmentLatitude
        geoFenceObject.longitude = row.nDepartmentLongitude
    }
    else {
        geoFenceObject.latitude = 0
        geoFenceObject.longitude = 0
    }
    if (bgGeo) {
        try {
            if (geoFenceObject.latitude != 0 && geoFenceObject.longitude != 0) {
                bgGeo.getGeofences(function (geofences) {
                    var geofenceFound = false
                    for (var n = 0, len = geofences.length; n < len; n++) {
                        if (geoFenceObject.latitude == geofences[n].latitude && geoFenceObject.longitude == geofences[n].longitude) {
                            geofenceFound = true
                            break
                        }
                    }
                    if (geofenceFound == false) {
                        lgeofenceCount += 1
                        bgGeo.addGeofence(geoFenceObject, null, errorAddGeoFence);
                        //geoFenceStatus = 'EXIT'
                        bgGeo.getCurrentPosition({
                            timeout: 30,    // 30 second timeout to fetch location
                            maximumAge: 3000, // Accept the last-known-location if not older than 5000 ms.
                            desiredAccuracy: 10
                        }, null, null)
                    }
                }, function (error) {
                });
            }
        }
        catch (e) {
            alert('error Adding Geo fence')
        }
    }

}

function retreiveSchedulInformation() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    if (lZSH_SysId != 0) {
        try {
            db.transaction(function (tx) {
                tx.executeSql("Select * From TCzsh where lZSH_SysId = " + lZSH_SysId, null, setupCoverRequest,
                    function sqlError(tx, err) {
                        displaySQLError("Select * From TCzsh where lZSH_SysId = " + lZSH_SysId, err)
                    }
                )
            })
        }
        catch (e) {
            alert(e.message)
        }
    }
    else {
        $("#dialogHeader").text("Error Message")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        if (!$.trim($("#szCoverDescription").val())) {
            $("#dialogMessage").text("No Schedule Is Selected To Cover.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = ""
            return false
        }
    }
}
function setupCoverRequest(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#szCoverDescription").val('')
    $("#szCoverText").val('')
    $("#lCoverDateRequested").prop("type", "text");
    $("#lCoverDateRequested").val(toSqlDate(result.rows.item(0).lDate))
    $("#lCoverTimeRequestFrom").val(toSqlTimeValue(result.rows.item(0).lBeginTime))
    $("#lCoverTimeRequestTo").val(toSqlTimeValue(result.rows.item(0).lEndTime))
    $("#lOrigCoverTimeRequestFrom").val(result.rows.item(0).lBeginTime)
    $("#lOrigCoverTimeRequestTo").val(result.rows.item(0).lEndTime)
    $("#szCoverDepartment").val(result.rows.item(0).szDepartment)
    $("#szCoverJobDescription").val(result.rows.item(0).szJobDescription)
    $("#szCoverTaskDescription").val(result.rows.item(0).szTaskDescription)
    $(":mobile-pagecontainer").pagecontainer("change", "#ScheduleCoverRequest")
}


function validateScheduleCover() {
    var lOrigTimeScheduledFrom = parseInt($("#lOrigCoverTimeRequestFrom").val())
    var lOrigTimeScheduledTo = parseInt($("#lOrigCoverTimeRequestTo").val())
    var lCoverTimeRequestFrom = parseInt(toClarionTime($("#lCoverTimeRequestFrom").val()))
    var lCoverTimeRequestTo = parseInt(toClarionTime($("#lCoverTimeRequestTo").val()))
    if (lOrigTimeScheduledTo < lOrigTimeScheduledFrom) {
        lOrigTimeScheduledTo = parseInt(lOrigTimeScheduledTo) + (24 * 60 * 60 * 100)
    }
    if (lCoverTimeRequestTo < lCoverTimeRequestFrom) {
        lCoverTimeRequestTo = parseInt(lCoverTimeRequestTo) + (24 * 60 * 60 * 100)
    }
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#szCoverDescription").val())) {
        $("#dialogMessage").text("Schedule Cover Description is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szCoverDescription"
        return false
    }
    if (!$.trim($("#szCoverText").val())) {
        $("#dialogMessage").text("Shcedule Cover Message is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szCoverText"
        return false
    }
    if (!toClarionTime($("#lCoverTimeRequestFrom").val())) {
        $("#dialogMessage").text("Schedule Cover Time Request From is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "lCoverTimeRequestFrom"
        return false
    }
    if (!toClarionTime($("#lCoverTimeRequestTo").val())) {
        $("#dialogMessage").text("Schedule Cover Time Request To is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "lCoverTimeRequestTo"
        return false
    }
    if (lCoverTimeRequestFrom < lOrigTimeScheduledFrom || lCoverTimeRequestFrom > lOrigTimeScheduledTo || lCoverTimeRequestTo < lOrigTimeScheduledFrom || lCoverTimeRequestTo > lOrigTimeScheduledTo)
    {
        $("#dialogMessage").text("Requested Time is Outside Your Scheduled Time.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "lCoverTimeRequestFrom"
        return false
    }    
    var sqlStatement
    var szLocalCoverDescription = $("#szCoverDescription").val().replace(/'/g, "''")
    var szLocalCoverText = $("#szCoverText").val().replace(/'/g, "''")
    sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szType,lCEM_SysId,szMessageType,szMessageText,szMessageDescription,lDateRequestFrom,lTimeRequestFrom,lTimeRequestTo,"
    sqlStatement += "szDepartment,szJobDescription,szTaskDescription,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "',"  
    sqlStatement += "'Request Schedule Cover'," + authorizeCEM_SysId + ",'Employee Schedule Cover Request','" + szLocalCoverText + "','" + szLocalCoverDescription + "',"
    sqlStatement += toClarionDate($("#lCoverDateRequested").val()) + "," + toClarionTime($("#lCoverTimeRequestFrom").val()) + "," + toClarionTime($("#lCoverTimeRequestTo").val()) + ",'"
    sqlStatement += $("#szCoverDepartment").val() + "','" + $("#szCoverJobDescription").val() + "','" + $("#szCoverTaskDescription").val() + "',0,0,0)"
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

function cancelScheduleCoverClicked() {
    szDialogReturnTo = "#Schedule"
    callCancelDiaglog()
}


function deleteAndLoadScheduleCover(tx) {
    if (zscServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzsc", null, processZSC, function errorDeleteZSC(tx, err) {
                displaySQLError("Delete From TCzsc", err)
            });
        }
        catch (e) {

        }
    }
    else {
        loadZSC(tx)
    }
}

function processZSC(tx) {
    var TCzscRecord
    var currentResponse = zscServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzsc").each(function () {
        TCzscRecord = $(this)
        callAddZSC(tx, TCzscRecord)
    })
    zscServiceResponse = ""
    if (fullUpdate == false) {
        loadZSC(tx)
    }
}

function callAddZSC(tx, TCzscRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzsc(lSHC_SysId,lCEM_SysId,szEmployeeName,szMessageType,lDateRequested,lTimeRequestFrom,lTimeRequestTo) Values("
    sqlStatement += TCzscRecord.text() + "," + $(TCzscRecord).attr('lCEM_SysId') + ",'" + $(TCzscRecord).attr('szEmployeeName') + "','" + $(TCzscRecord).attr('szMessageType')
    sqlStatement += "'," + $(TCzscRecord).attr('lDateRequested') + "," + $(TCzscRecord).attr('lTimeRequestFrom') + "," + $(TCzscRecord).attr('lTimeRequestTo') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZSC(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function loadZSC(tx) {
    try {
        tx.executeSql("select * From TCzsc order by lDateRequested, lTimeRequestFrom", null, buildZSCTable, function errorLoadZSC(tx, err) {
            displaySQLError("select * From TCszc order by lDateRequested, lTimeRequestFrom", err)
        })
    }
    catch (e) {
        alert(e.message)
    }

}

function buildZSCTable(tx, results) {
    var tableHTML, rows, row, i = 0
    lSHC_SysId = 0
    lCEM_SysId_SHC = 0
    $("#CoverSchedule").css('display', 'none')
    $("#DeleteCoverSchedule").css('display', 'none')
    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zshTablel">'
    tableHTML += '<thead><tr nowrap>'
    tableHTML += '<th nowrap class="myth" data-colstart="1">Requested By</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="2">Message Type</th><th nowrap class="myth" data-colstart="3">Date Requested</th>'
    tableHTML += '<th nowrap class="myth" data-colstart="4">Time Request From</th><th nowrap class="myth" data-colstart="5">Time Request To</th>'
    tableHTML += '</tr></thead><tbody>'
    if (results.rows.length <= 0) {
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
            tableHTML += '<tr nowrap class="mytr" id="' + row.lSHC_SysId + "|" + row.lCEM_SysId + '">'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szEmployeeName + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + row.szMessageType + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlDate(row.lDateRequested) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTimeRequestFrom) + '</td>'
            tableHTML += '<td nowrap class="mytd"><b class="ui-table-cell-label"></b>' + toSqlTime(row.lTimeRequestTo) + '</td>'
            tableHTML += '</tr>'
            i++;
        })
    }
    tableHTML += '</tbody></table>'
    $("#scheduleCoverTable").html(tableHTML)
    var deviceHeight = effectiveDeviceHeight()
    if (deviceHeight == 'auto') {
        $("#scheduleCoverTable").css('height', 'auto')
    }
    else {
        $("#scheduleCoverTable").css('height', deviceHeight + 'px')
    }

    $('#scheduleCoverTable tr').click(function () {
        if ($(this).attr("id")) {
            $(this).closest("tr").siblings().removeClass("highlight");
            $(this).toggleClass("highlight");
            lSHC_SysId = $(this).attr("id").split("|")[0]
            lCEM_SysId_SHC = $(this).attr("id").split("|")[1]
            if (lCEM_SysId_SHC == authorizeCEM_SysId) {
                $("#CoverSchedule").css('display', 'none')
                $("#DeleteCoverSchedule").css('display', '')
            }
            else {
                $("#CoverSchedule").css('display', '')
                $("#DeleteCoverSchedule").css('display', 'none')
            }
        }
    });
}

function CoverSchedule() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    if (lSHC_SysId != 0) {
        var sqlStatement
        sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szType,lCEM_SysId,lSHC_SysId,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" 
        sqlStatement += $("#szClockId").val() + "','Cover Schedule'," + authorizeCEM_SysId + "," + lSHC_SysId + ",0,0,0)"
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
        $(":mobile-pagecontainer").pagecontainer("change", "#Home")
    }
    else {
        $("#dialogHeader").text("Error Message")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        if (!$.trim($("#szCoverDescription").val())) {
            $("#dialogMessage").text("No Cover Request Is Selected To Cover.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = ""
            return false
        }
    }
}

function DeleteCoverSchedule() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    if (lSHC_SysId != 0) {
        var sqlStatement
        sqlStatement = "INSERT INTO TCztr(lDate,lTime,szClockId,szType,lCEM_SysId,lSHC_SysId,lDateSent,lTimeSent,bFailureCount) VALUES(" + clarionToday() + "," + clarionClock() + ",'" 
        sqlStatement += $("#szClockId").val() + "','Delete Schedule Cover'," + authorizeCEM_SysId + "," + lSHC_SysId + ",0,0,0)"
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
        $(":mobile-pagecontainer").pagecontainer("change", "#Home")
    }
    else {
        $("#dialogHeader").text("Error Message")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        if (!$.trim($("#szCoverDescription").val())) {
            $("#dialogMessage").text("No Cover Request Is Selected To Cover.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = ""
            return false
        }
    }
}
