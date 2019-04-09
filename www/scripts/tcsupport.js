function loadDepJobAsk() {
    if (zdpListitems != "") {
        setSelectControl(zdpListitems, "#szZDPSelect")
    }
    else {
        loadZDPFromDB()
    }
    if (zajListitems != "") {
        setSelectControl(zajListitems, "#szZAJSelect")
    }
    else {
        loadZAJFromDB()
    }
    if (zatListitems != "") {
        setSelectControl(zatListitems, "#szZATSelect")
    }
    else {
        loadZATFromDB()
    }
    if (szPunchType != "GroupPunch") {
        punchCheckLockout()
    }
    else {
        loadZGPFromDB()
        setupGroupPunch()
    }
}

function loadDepJobAskOTA() {
    if ($("#bOTANoDepSwtch").val() != '1') {
        if (zdpListitems != "") {
            setSelectControl(zdpListitems, "#szZDPSelect")
        }
        else {
            loadZDPFromDB()
        }
        $("#otaZDPRow").css('display', '')
    }
    else {
        $("#otaZDPRow").css('display', 'none')
    }
    if ($("#bOTANoJobSwtch").val() != '1') {
        if (zajListitems != "") {
            setSelectControl(zajListitems, "#szZAJSelect")
        }
        else {
            loadZAJFromDB()
        }
        $("#otaZAJRow").css('display', '')
    }
    else {
        $("#otaZAJRow").css('display', 'none')
    }
    if ($("#bOTANoTaskSwtch").val() != '1') {
        if (zatListitems != "") {
            setSelectControl(zatListitems, "#szZATSelect")
        }
        else {
            loadZATFromDB()
        }
        $("#otaZATRow").css('display', '')
    }
    else {
        $("#otaZATRow").css('display', 'none')
    }
}

function loadSWP() {
    if (swpSelectListitems != "") {
        setSelectControl(swpSelectListitems, "#szSWPSelect")
    }
    else {
        loadSWPFromDB()
    }
}

function processZDP(tx) {
    var sqlStatement, sqlStatement1
    var currentResponse = zdpServiceResponse
    sqlStatement = "Select * from TCzdr where szControl = 'szZDPSelect'"
    try {
        tx.executeSql(sqlStatement, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    zdpListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
    sqlStatement1 = "UPDATE TCzdp SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement1, null, function successUpdate(tx) {
            $('#zdp_lCount').val($(currentResponse).find("TCzdp").length)
            if ($('#zdp_lCount').val() == 0) {
                deleteRecords("TCzdp", tx)
                zdpListitems = ""
                updateZDR("szZDPSelect", zdpListitems, tx);
            }
            else {
                processLargeDataZDP(currentResponse, tx)
            }
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement1, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZDP(currentResponse, tx) {
    var i = 0;
    var TCzdpRecord
    var bprocessDelete = false
    var listitems = ""
    var totalCount = $(currentResponse).find("TCzdp").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzdp").each(function () {
        TCzdpRecord = $(this)
        listitems += '<option value="' + TCzdpRecord.text() + '">' + $(TCzdpRecord).attr('szDepartment') + '</option>'
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateZDP(tx, TCzdpRecord, TCzdpRecord.text(), bprocessDelete)
        ++i
    })
    zdpServiceResponse = ""
    zdpListitems = listitems;
    updateZDR("szZDPSelect", zdpListitems, tx);
}

function callAddOrUpdateZDP(tx, TCzdpRecord, lZDP_SysId, bprocessDelete) {

    var sqlStatement = 'SELECT * FROM TCzdp WHERE lZDP_SysId = ' + lZDP_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzdp SET szDepartment ='" + $(TCzdpRecord).attr('szDepartment') + "', lDepartmentNumber = " + $(TCzdpRecord).attr('lDepartmentNumber')
                        sqlStatement += ", bRetainRecord = 1 WHERE lZDP_SysId = " + lZDP_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZDP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzdp", tx)
                                }
                            }, function errorUpdateZDP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzdp(lZDP_SysId,szDepartment,lDepartmentNumber,bRetainRecord) Values(" + lZDP_SysId + ",'"
                        sqlStatement += $(TCzdpRecord).attr('szDepartment') + "'," + $(TCzdpRecord).attr('lDepartmentNumber') + ",1)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZDP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzdp", tx)
                                }
                            }, function errorInsertZDP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(tx, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function loadZDPFromDB() {
    var listitems = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzdp ORDER BY szDepartment', null,
                function successloadZDPFromDB(tx, result) {
                    var rows, row, i = 0
                    $('#zdp_lCount').val(result.rows.length)
                    if ($('#zdp_lCount').val() == 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer")) {
                        $('#zdp_lDepartmentNumber').val(result.rows.item(0).lDepartmentNumber)
                    }
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            listitems += '<option value="' + row.lZDP_SysId + '">' + row.szDepartment + '</option>'
                            i++;
                        })
                    }
                    setSelectControl(listitems, "#szZDPSelect")
                },
                function errorloadZDPFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}

function processZAJ(tx) {
    var sqlStatement, sqlStatement1
    var currentResponse = zajServiceResponse
    sqlStatement = "Select * from TCzdr where szControl = 'szZAJSelect'"
    try {
        tx.executeSql(sqlStatement, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    zajListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
    sqlStatement1 = "UPDATE TCzaj SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement1, null, function successUpdate(tx) {
            $('#zaj_lCount').val($(currentResponse).find("TCzaj").length)
            if ($('#zaj_lCount').val() == 0) {
                deleteRecords("TCzaj", tx)
                zajListitems = ""
                updateZDR("szZAJSelect", zajListitems, tx);
            }
            else {
                processLargeDataZAJ(currentResponse, tx)
            }
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement1, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZAJ(currentResponse, tx) {
    var i = 0;
    var TCzajRecord
    var bprocessDelete = false
    var listitems = ""
    var totalCount = $(currentResponse).find("TCzaj").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzaj").each(function () {
        TCzajRecord = $(this)
        listitems += '<option value="' + TCzajRecord.text() + '">' + $(TCzajRecord).attr('szJobDescription') + '</option>'
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateZAJ(tx, TCzajRecord, TCzajRecord.text(), bprocessDelete)
        ++i
    })
    zajServiceResponse = ""
    zajListitems = listitems;
    updateZDR("szZAJSelect", zajListitems, tx);

}

function callAddOrUpdateZAJ(tx, TCzajRecord, lZAJ_SysId, bprocessDelete) {
    var sqlStatement = 'SELECT * FROM TCzaj WHERE lZAJ_SysId = ' + lZAJ_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzaj SET szJobDescription = '" + $(TCzajRecord).attr('szJobDescription') + "', lJobNumber = " + $(TCzajRecord).attr('lJobNumber')
                        sqlStatement += ", bRetainRecord = 1 WHERE lZAJ_SysId = " + lZAJ_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZAJ(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzaj", tx)
                                }
                            }, function errorUpdateZAJ(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzaj(lZAJ_SysId,szJobDescription,lJobNumber,bRetainRecord) Values(" + lZAJ_SysId + ",'"
                        sqlStatement += $(TCzajRecord).attr('szJobDescription') + "'," + $(TCzajRecord).attr('lJobNumber') + ",1)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZAJ(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzaj", tx)
                                }
                            }, function errorInsertZAJ(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(ex, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function loadZAJFromDB() {
    var listitems = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzaj ORDER BY szJobDescription', null,
                function successloadZAJFromDB(tx, result) {
                    var rows, row, i = 0
                    $('#zaj_lCount').val(result.rows.length)
                    if ($('#zaj_lCount').val() == 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer")) {
                        $('#zaj_lJobNumber').val(result.rows.item(0).lJobNumber)
                    }
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            listitems += '<option value="' + row.lZAJ_SysId + '">' + row.szJobDescription + '</option>'
                            i++;
                        })
                    }
                    setSelectControl(listitems, "#szZAJSelect")
                },
                function errorloadZAJFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}


function processZAT(tx) {
    var sqlStatement, sqlStatement1
    var currentResponse = zatServiceResponse
    sqlStatement = "Select * from TCzdr where szControl = 'szZATSelect'"
    try {
        tx.executeSql(sqlStatement, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    zatListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
    sqlStatement1 = "UPDATE TCzat SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement1, null, function successUpdate(tx) {
            $('#zat_lCount').val($(currentResponse).find("TCzat").length)
            if ($('#zat_lCount').val() == 0) {
                deleteRecords("TCzat", tx)
                zatListitems = ""
                updateZDR("szZATSelect", zatListitems, tx);
            }
            else {
                processLargeDataZAT(currentResponse, tx)
            }
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement1, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZAT(currentResponse, tx) {
    var i = 0;
    var TCzatRecord
    var bprocessDelete = false
    var listitems = ""
    var totalCount = $(currentResponse).find("TCzat").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzat").each(function () {
        TCzatRecord = $(this)
        listitems += '<option value="' + TCzatRecord.text() + '">' + $(TCzatRecord).attr('szTaskDescription') + '</option>'
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateZAT(tx, TCzatRecord, TCzatRecord.text(), bprocessDelete)
        ++i
    })
    zatServiceResponse = ""
    zatListitems = listitems;
    updateZDR("szZATSelect", zatListitems, tx);
}


function callAddOrUpdateZAT(tx, TCzatRecord, lZAT_SysId, bprocessDelete) {
    var sqlStatement = 'SELECT * FROM TCzat WHERE lZAT_SysId = ' + lZAT_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzat SET szTaskDescription ='" + $(TCzatRecord).attr('szTaskDescription') + "', lTaskNumber = " + $(TCzatRecord).attr('lTaskNumber')
                        sqlStatement += ", bRetainRecord = 1 WHERE lZAT_SysId = " + lZAT_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZAT(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzat", tx)
                                }
                            }, function errorUpdateZAT(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzat(lZAT_SysId,szTaskDescription,lTaskNumber,bRetainRecord) Values(" + lZAT_SysId + ",'"
                        sqlStatement += $(TCzatRecord).attr('szTaskDescription') + "'," + $(TCzatRecord).attr('lTaskNumber') + ",1)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZAT(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzat", tx)
                                }
                            }, function errorInsertZAT(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(ex, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}


function loadZATFromDB() {
    var listitems = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzat ORDER BY szTaskDescription', null,
                function successloadZATFromDB(tx, result) {
                    var rows, row, i = 0
                    $('#zat_lCount').val(result.rows.length)
                    if ($('#zat_lCount').val() == 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer")) {
                        $('#zat_lTaskNumber').val(result.rows.item(0).lTaskNumber)
                    }
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            listitems += '<option value="' + row.lZAT_SysId + '">' + row.szTaskDescription + '</option>'
                            i++;
                        })
                    }
                    setSelectControl(listitems, "#szZATSelect")
                },
                function errorloadZATFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}

function processZOA(tx) {
    var TCzoaRecord
    var sqlStatement, sqlStatement1, sqlStatement2
    var bprocessDelete = false
    var currentResponse = zoaServiceResponse
    sqlStatement = "Select * from TCzdr where szControl = 'szOTASelect'"
    try {
        tx.executeSql(sqlStatement, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    otaSelectListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
    sqlStatement1 = "Select * from TCzdr where szControl = 'szApproveMessageOTASelect'"
    try {
        tx.executeSql(sqlStatement1, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    otaApproveMessagetListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement1, err)
        })
    }
    catch (e) {

    }
    sqlStatement2 = "UPDATE TCzoa SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement2, null, function successUpdate(tx) {
            processLargeDataZOA(currentResponse, tx)
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement2, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZOA(currentResponse, tx) {
    var i = 0;
    var TCzoaRecord
    var bprocessDelete = false
    var listitems = ""
    var listitems1 = ""
    var totalCount = $(currentResponse).find("TCzoa").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzoa").each(function () {
        TCzoaRecord = $(this)
        if ($(TCzoaRecord).attr('bUsedForOtherButton') == 1) {
            listitems += '<option value="' + TCzoaRecord.text() + '">' + $(TCzoaRecord).attr('szOtherActivityType') + '</option>'
        }
        listitems1 += '<option value="' + TCzoaRecord.text() + '">' + $(TCzoaRecord).attr('szOtherActivityType') + '</option>'
        if (i == totalCount - 1) {
            bprocessDelete = true
        }

        callAddOrUpdateZOA(tx, TCzoaRecord, TCzoaRecord.text(), bprocessDelete)
        ++i
    })
    zoaServiceResponse = ""
    otaSelectListitems = listitems;
    updateZDR("szOTASelect", otaSelectListitems, tx);
    otaApproveMessagetListitems = listitems1;
    updateZDR("szApproveMessageOTASelect", otaApproveMessagetListitems, tx);
}


function callAddOrUpdateZOA(tx, TCzoaRecord, lZOA_SysId, bprocessDelete) {
    var sqlStatement = 'SELECT * FROM TCzoa WHERE lZOA_SysId = ' + lZOA_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzoa SET szOtherActivityType ='" + $(TCzoaRecord).attr('szOtherActivityType') + "', lCodeNumber = " + $(TCzoaRecord).attr('lCodeNumber')
                        sqlStatement += ", szType = '" + $(TCzoaRecord).attr('szType') + "', bUsedForOtherButton = " + $(TCzoaRecord).attr('bUsedForOtherButton')
                        sqlStatement += ", bRetainRecord = 1 WHERE lZOA_SysId = " + lZOA_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZOA(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzoa", tx)
                                }
                            }, function errorUpdateZOA(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzoa(lZOA_SysId,szOtherActivityType,lCodeNumber,szType,bUsedForOtherButton,bRetainRecord) Values(" + lZOA_SysId + ",'"
                        sqlStatement += $(TCzoaRecord).attr('szOtherActivityType') + "'," + $(TCzoaRecord).attr('lCodeNumber') + ",'" + $(TCzoaRecord).attr('szType') + "',"
                        sqlStatement += $(TCzoaRecord).attr('bUsedForOtherButton') + ",1)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZOA(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzoa", tx)
                                }
                            }, function errorInsertZOA(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(ex, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function loadZOAFromDB() {
    var listitems = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzoa ORDER BY szOtherActivityType', null,
                function successloadZOAFromDB(tx, result) {
                    var rows, row, i = 0
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            if ((szOTASelectControl == "#szOTASelect" && row.bUsedForOtherButton == 1) || szOTASelectControl == "#szApproveMessageOTASelect") {
                                listitems += '<option value="' + row.lZOA_SysId + '">' + row.szOtherActivityType + '</option>'
                            }
                            i++;
                        })
                    }
                    switch (szOTASelectControl) {
                        case "#szApproveMessageOTASelect":
                            setSelectControl(listitems, "#szApproveMessageOTASelect")
                            //szOTASelectControl = ''
                            break;
                        case "#szOTASelect":
                            setSelectControl(listitems, "#szOTASelect")
                            //szOTASelectControl = ''
                            break;
                    }
                },
                function errorloadZOAFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}


function deleteAndLoadValidLocation(tx) {
    if ($("#szGeofenceBase").val() != "" && $("#szGeofenceBase").val() != "Schedule") {
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
    try {
        tx.executeSql("Delete From TCzvl", null, processZVL, function errorDeleteZVL(tx, err) {
            displaySQLError("Delete From TCzvl", err)
        });
    }
    catch (e) { }
}

function processZVL(tx) {
    var i = 0
    var TCzvlRecord
    var currentResponse = zvlServiceResponse
    var bloadZVL = false
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzvl").each(function () {
        TCzvlRecord = $(this)
        //if (i < 100){
        if ($("#szGeofenceBase").val() != "" && $("#szGeofenceBase").val() != "Schedule") {
            BuildZVLRowGeofence($(TCzvlRecord).attr('szLocationId'), $(TCzvlRecord).attr('nLatitude'), $(TCzvlRecord).attr('nLongitude'))
        }
        //}
        callAddZVL(tx, TCzvlRecord)
        i++;
    })
    zvlServiceResponse = ""

}

function callAddZVL(tx, TCzvlRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzvl(szLocationId,nLatitude,nLongitude) Values('"
    sqlStatement += $(TCzvlRecord).attr('szLocationId') + "'," + $(TCzvlRecord).attr('nLatitude') + "," + $(TCzvlRecord).attr('nLongitude') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZVL(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
}

function loadZVLFromDB(tx, result) {
    if (result.rows.length > 0) {
        for (var i = 0; i < result.rows.length; i++) {
            if ($("#szGeofenceBase").val() != "" && $("#szGeofenceBase").val() != "Schedule") {
                BuildZVLRowGeofence(result.rows.item(i).szLocationId, result.rows.item(i).nLatitude, result.rows.item(i).nLongitude)
            }
        }
    }
}

function processZLG(tx) {
    var sqlStatement
    var currentResponse = zlgServiceResponse
    sqlStatement = "UPDATE TCzlg SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement, null, function successUpdate(tx) {
            processLargeDataZLG(currentResponse, tx)
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZLG(currentResponse, tx) {
    var i = 0;
    var TCzlgRecord
    var bprocessDelete = false
    var totalCount = $(currentResponse).find("TCzlg").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzlg").each(function () {
        TCzlgRecord = $(this)
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateZLG(tx, TCzlgRecord, TCzlgRecord.text(), bprocessDelete)
        ++i
    })
    zlgServiceResponse = ""
    fullUpdate = false
}


function callAddOrUpdateZLG(tx, TCzlgRecord, lZLG_SysId, bprocessDelete) {
    var sqlStatement = 'SELECT * FROM TCzlg WHERE lCEM_SysId = ' + lZLG_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        if ($(TCzlgRecord).attr('lSUP_SysId')) {
                            sqlStatement = "UPDATE TCzlg SET lSUP_SysId =" + $(TCzlgRecord).attr('lSUP_SysId') + ", szEmployeeName = '" + $(TCzlgRecord).attr('szEmployeeName') + "'"
                            sqlStatement += ", szClockId = '" + $(TCzlgRecord).attr('szClockId') + "', szClockPassword = '" + $(TCzlgRecord).attr('szClockPassword') + "'"
                            sqlStatement += ", lLastPunchDate =" + $(TCzlgRecord).attr('lLastPunchDate') + ", lLastPunchTime = " + $(TCzlgRecord).attr('lLastPunchTime')
                            sqlStatement += ", szLastPunchType = '" + $(TCzlgRecord).attr('szLastPunchType') + "', szLastPunchDepartment = '" + $(TCzlgRecord).attr('szLastPunchDepartment') + "'"
                            sqlStatement += ", szLastPunchJob = '" + $(TCzlgRecord).attr('szLastPunchJob') + "', szLastPunchTask = '" + $(TCzlgRecord).attr('szLastPunchTask') + "'"
                            sqlStatement += ", nHoursForDay = " + $(TCzlgRecord).attr('nHoursForDay') + ", nHoursForWeek = " + $(TCzlgRecord).attr('nHoursForWeek')
                            sqlStatement += ", nHoursForPayPeriod = " + $(TCzlgRecord).attr('nHoursForPayPeriod') + ", lLastInPunchDate = " + $(TCzlgRecord).attr('lLastInPunchDate')
                            sqlStatement += ", lLastInPunchTime = " + $(TCzlgRecord).attr('lLastInPunchTime') + ", bDisableClockOut = " + $(TCzlgRecord).attr('bDisableClockOut')
                            sqlStatement += ", lCDP_SysId = " + $(TCzlgRecord).attr('lCDP_SysId') + ", szDepartment = '" + $(TCzlgRecord).attr('szDepartment') + "'"
                            sqlStatement += ", lDepartmentNumber = " + $(TCzlgRecord).attr('lDepartmentNumber') + ", lJOB_SysId = " + $(TCzlgRecord).attr('lJOB_SysId')
                            sqlStatement += ", szJobDescription = '" + $(TCzlgRecord).attr('szJobDescription') + "', lJobNumber = " + $(TCzlgRecord).attr('lJobNumber')
                            sqlStatement += ", lASK_SysId = " + $(TCzlgRecord).attr('lASK_SysId') + ", szTaskDescription = '" + $(TCzlgRecord).attr('szTaskDescription') + "'"
                            sqlStatement += ", lTaskNumber = " + $(TCzlgRecord).attr('lTaskNumber') + ", bRetainRecord = 1 WHERE lCEM_SysId = " + lZLG_SysId
                        }
                        else {
                            sqlStatement = "UPDATE TCzlg SET szClockId ='" + $(TCzlgRecord).attr('szClockId') + "', szClockPassword = '" + $(TCzlgRecord).attr('szClockPassword')
                            sqlStatement += "', bRetainRecord = 1 WHERE lCEM_SysId = " + lZLG_SysId
                        }
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZOA(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzlg", tx)
                                }
                            }, function errorUpdateZLG(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        if ($(TCzlgRecord).attr('lSUP_SysId')) {
                            sqlStatement = "Insert Into TCzlg(lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,szLastPunchDepartment,"
                            sqlStatement += "szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForWeek,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,bDisableClockOut,lCDP_SysId,"
                            sqlStatement += "szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber,bRetainRecord) Values("
                            sqlStatement += lZLG_SysId + "," + $(TCzlgRecord).attr('lSUP_SysId') + ",'" + $(TCzlgRecord).attr('szEmployeeName') + "','"
                            sqlStatement += $(TCzlgRecord).attr('szClockId') + "','" + $(TCzlgRecord).attr('szClockPassword') + "'," + $(TCzlgRecord).attr('lLastPunchDate') + ","
                            sqlStatement += $(TCzlgRecord).attr('lLastPunchTime') + ",'" + $(TCzlgRecord).attr('szLastPunchType') + "','" + $(TCzlgRecord).attr('szLastPunchDepartment') + "','"
                            sqlStatement += $(TCzlgRecord).attr('szLastPunchJob') + "','" + $(TCzlgRecord).attr('szLastPunchTask') + "'," + $(TCzlgRecord).attr('nHoursForDay') + ","
                            sqlStatement += $(TCzlgRecord).attr('nHoursForWeek') + "," + $(TCzlgRecord).attr('nHoursForPayPeriod') + "," + $(TCzlgRecord).attr('lLastInPunchDate') + ","
                            sqlStatement += $(TCzlgRecord).attr('lLastInPunchTime') + "," + $(TCzlgRecord).attr('bDisableClockOut') + "," + $(TCzlgRecord).attr('lCDP_SysId') + ",'"
                            sqlStatement += $(TCzlgRecord).attr('szDepartment') + "'," + $(TCzlgRecord).attr('lDepartmentNumber') + "," + $(TCzlgRecord).attr('lJOB_SysId') + ",'"
                            sqlStatement += $(TCzlgRecord).attr('szJobDescription') + "'," + $(TCzlgRecord).attr('lJobNumber') + "," + $(TCzlgRecord).attr('lASK_SysId') + ",'"
                            sqlStatement += $(TCzlgRecord).attr('szTaskDescription') + "'," + $(TCzlgRecord).attr('lTaskNumber') + ",1)"

                        }
                        else {
                            sqlStatement = "Insert Into TCzlg(szClockId,szClockPassword,lCEM_SysId,bRetainRecord) Values('"
                            sqlStatement += $(TCzlgRecord).attr('szClockId') + "','" + $(TCzlgRecord).attr('szClockPassword') + "'," + lZLG_SysId + ",1)"
                        }
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZOA(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzlg", tx)
                                }
                            }, function errorInsertZLG(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(ex, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function processSWP(tx) {
    var sqlStatement, sqlStatement1
    var currentResponse = swpServiceResponse
    sqlStatement = "Select * from TCzdr where szControl = 'szSWPSelect'"
    try {
        tx.executeSql(sqlStatement, null, function successSelect(tx, result) {
            if (result) {
                if (result.rows.length > 0) {
                    swpSelectListitems = result.rows.item(0).szListItems
                }
            }
        }, function errorSelectZDR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }
    sqlStatement1 = "UPDATE TCswp SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement1, null, function successUpdate(tx) {
            $('#swp_lCount').val($(currentResponse).find("TCswp").length)
            if ($('#swp_lCount').val() == 0) {
                deleteRecords("TCswp", tx)
                swpSelectListitems = ""
                updateZDR("szSWPSelect", swpSelectListitems, tx);
            }
            else {
                processLargeDataSWP(currentResponse, tx)
            }
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement1, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataSWP(currentResponse, tx) {
    var i = 0;
    var TCswpRecord
    var bprocessDelete = false
    var listitems = ""
    var totalCount = $(currentResponse).find("TCswp").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCswp").each(function () {
        TCswpRecord = $(this)
        if (TCswpRecord.text() != authorizeCEM_SysId) {
            listitems += '<option value="' + TCswpRecord.text() + '">' + $(TCswpRecord).attr('szEmployeeName') + '</option>'
        }
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateSWP(tx, TCswpRecord, TCswpRecord.text(), bprocessDelete)
        ++i
    })
    swpServiceResponse = ""
    swpSelectListitems = listitems;
    updateZDR("szSWPSelect", swpSelectListitems, tx);
}

function callAddOrUpdateSWP(tx, TCswpRecord, lSWP_SysId, bprocessDelete) {

    var sqlStatement = 'SELECT * FROM TCswp WHERE lCEM_SysId = ' + lSWP_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCswp SET szEmployeeName ='" + $(TCswpRecord).attr('szEmployeeName') + "'"
                        sqlStatement += ", bRetainRecord = 1 WHERE lCEM_SysId = " + lSWP_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateSWP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCswp", tx)
                                }
                            }, function errorUpdateSWP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCswp(lCEM_SysId,szEmployeeName,bRetainRecord) Values(" + lSWP_SysId + ",'"
                        sqlStatement += $(TCswpRecord).attr('szEmployeeName') + "',1)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertSWP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCswp", tx)
                                }
                            }, function errorInsertSWP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(tx, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function loadSWPFromDB() {
    var listitems = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCswp ORDER BY szEmployeeName', null,
                function successloadSWPFromDB(tx, result) {
                    var rows, row, i = 0
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            if (row.lCEM_SysId != authorizeCEM_SysId) {
                                listitems += '<option value="' + row.lCEM_SysId + '">' + row.szEmployeeName + '</option>'
                            }
                            i++;
                        })
                    }
                    setSelectControl(listitems, "#szSWPSelect")
                },
                function errorloadSWPFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}

function processZGP(tx) {
    var sqlStatement, sqlStatement1
    var currentResponse = zgpServiceResponse
    sqlStatement1 = "UPDATE TCzgp SET bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement1, null, function successUpdate(tx) {
            $('#zgp_lCount').val($(currentResponse).find("TCzgp").length)
            if ($('#zgp_lCount').val() == 0) {
                deleteRecords("TCzgp", tx)
            }
            else {
                processLargeDataZGP(currentResponse, tx)
            }
        },
            function errorUpdate(tx, err) {
                displaySQLError(sqlStatement1, err)
            }
                )
    }
    catch (e) {

    }
}

function processLargeDataZGP(currentResponse, tx) {
    var i = 0;
    var TCzgpRecord
    var bprocessDelete = false
    var listitems = ""
    var totalCount = $(currentResponse).find("TCzgp").length
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzgp").each(function () {
        TCzgpRecord = $(this)
        if (i == totalCount - 1) {
            bprocessDelete = true
        }
        callAddOrUpdateZGP(tx, TCzgpRecord, TCzgpRecord.text(), bprocessDelete)
        ++i
    })
    zgpServiceResponse = ""
}

function callAddOrUpdateZGP(tx, TCzgpRecord, lCEM_SysId, bprocessDelete) {

    var sqlStatement = 'SELECT * FROM TCzgp WHERE lCEM_SysId = ' + lCEM_SysId
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzgp SET bRetainRecord = 1, bSelected=0, szEmployeeName='" + $(TCzgpRecord).attr('szEmployeeName') + "', szClockId = '"                         
                        sqlStatement += $(TCzgpRecord).attr('szClockId') + "' WHERE lCEM_SysId = " + lCEM_SysId
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessUpdateZGP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzgp", tx)
                                }
                            }, function errorUpdateZGP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzgp(lCEM_SysId,szEmployeeName,szClockId,bRetainRecord,bSelected) Values(" + lCEM_SysId + ",'"
                        sqlStatement += $(TCzgpRecord).attr('szEmployeeName') + "','" + $(TCzgpRecord).attr('szClockId') + "',1,0)"
                        try {
                            tx.executeSql(sqlStatement, null, function SuccessInsertZGP(tx) {
                                if (bprocessDelete == true) {
                                    deleteRecords("TCzgp", tx)
                                }
                            }, function errorInsertZGP(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(tx, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function loadZGPFromDB() {
    var tableHTML = ''
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzgp ORDER BY szEmployeeName', null,
                function successloadZGPFromDB(tx, result) {
                    var rows, row, i = 0
                    $('#zgp_lCount').val(result.rows.length)
                    tableHTML = '<table data-role="table" class="ui-responsive ui-shadow ui-table " id="zgpTablel">'
                    tableHTML += '<thead><tr nowrap>'
                    tableHTML += '<th nowrap class="myth" data-colstart="1">Name</th>'
                    tableHTML += '</tr></thead><tbody>'

                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            tableHTML += '<tr nowrap class="mytr" id="' + row.lCEM_SysId + '">'
                            tableHTML += '<td nowrap class="mytd"><input type="checkbox"'
                            if (row.bSelected == 1) {
                                tableHTML += ' checked> ' + row.szEmployeeName + '</td>'
                            }
                            else {
                                tableHTML += '"> ' + row.szEmployeeName + '</td>'
                            }
                            tableHTML += '</tr>'
                            i++;
                        })
                    }
                    tableHTML += '</tbody></table>'
                    $("#GrouPunchTable").html(tableHTML)
                    var deviceHeight = effectiveDeviceHeight()
                    if (deviceHeight == 'auto') {
                        $("#GrouPunchTable").css('height', 'auto')
                    }
                    else {
                        $("#GrouPunchTable").css('height', deviceHeight + 'px')
                    }

                    $('#zgpTablel tr').click(function () {
                        if ($(this).attr("id")) {
                            var $chkbox = $(this).find('input[type="checkbox"]');
                            var status = $chkbox.prop('checked');
                            $(this).closest("tr").siblings().removeClass("highlight");
                            $(this).toggleClass("highlight");
                            groupPunchFlipTag($(this).attr("id"), status)
                        }

                    });

                },
                function errorloadZGPFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }
}

function groupPunchFlipTag(plCEM_SysId, pStatus) {
    var sqlStatement = ""
    var zgpCount = 0
    if (pStatus == true) {
        sqlStatement = "update TCzgp set bSelected = 1 where lCEM_SysId = " + plCEM_SysId
        zgpCount = $('#zgp_lSelectedCount').val() + 1        
    }
    else {
        sqlStatement = "update TCzgp set bSelected = 0 where lCEM_SysId = " + plCEM_SysId
        zgpCount = $('#zgp_lSelectedCount').val() - 1
        if (zgpCount < 0){
            zgpCount = 0
        }        
    }
    $('#zgp_lSelectedCount').val(zgpCount)
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null,null,
                function errorloadZGPFromDB(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                )
        })
    }
    catch (e) {

    }

}

function groupPunchTagAll() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('Update TCzgp Set bSelected = 1', null,
                function successUpdateTCzgp(tx, result) {
                    $('#zgp_lSelectedCount').val($('#zgp_lCount').val())
                    loadZGPFromDB()
                },
                function errorloadZGPFromDB(tx, err) {
                    displaySQLError('Update TCzgp Set bSelected = 1', err)
                }
                )
        })
    }
    catch (e) {

    }
}

function grouPunchUntagAll() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('Update TCzgp Set bSelected = 0', null,
                function successUpdateTCzgp(tx, result) {
                    $('#zgp_lSelectedCount').val(0)
                    loadZGPFromDB()
                },
                function errorloadZGPFromDB(tx, err) {
                    displaySQLError('Update TCzgp Set bSelected = 0', err)
                }
                )
        })
    }
    catch (e) {

    }
}

function deleteRecords(szTable, tx) {

    var sqlStatement = "DELETE FROM " + szTable + " WHERE bRetainRecord = 0"
    try {
        tx.executeSql(sqlStatement, null, null,
            function errorDelete(tx, err) {
                displaySQLError(sqlStatement, err)
            }
                )
    }
    catch (e) {

    }
}

function setSelectControl(plistItems, pType) {
    var selectControl
    switch (pType) {
        case "#szZDPSelect":
            if (szPunchType != "OTA") {
                $('#szZDPSelect').find('option').remove()
                $('#szZDPSelect').append(plistItems)
                $("#szZDPSelect").append($("#szZDPSelect option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#zdp_lCount').val() > 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer" || szPunchType == "GroupPunch")) {
                    $("#szZDPSelect").prepend("<option value=''>Default Department</option>");
                }
                var selectControl = $("#szZDPSelect");
                selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                selectControl.selectmenu();
                selectControl.selectmenu("refresh", true);
                if (szPunchType != "GroupPunch") {
                    if ($("#zem_szLastPunchType").val().toUpperCase() == "CLOCK IN") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szLastPunchDepartment').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setDepartmentNumber();
                                }
                            }
                        }
                    }
                    else {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szDepartment').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setDepartmentNumber();
                                }
                            }
                        }
                    }
                }
                if ($("#bGeoDefaults").val() == 1) {
                    if (geoFenceId.indexOf("-") >= 0) {
                        if (geoFenceId.split('-')[0] == "CDP") {
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].value == geoFenceId.split('-')[1]) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setDepartmentNumber();
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (szPunchType != "GroupPunch") {
                            if (geoFenceId != "") {
                                retreiveGeoSceduleDefault(geoFenceId, 'CDP')
                            }
                        }
                    }
                }
            }
            else {
                $('#szZDPSelectOTA').find('option').remove()
                $('#szZDPSelectOTA').append(plistItems)
                $("#szZDPSelectOTA").append($("#szZDPSelectOTA option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#szZDPSelectOTA').children('option').length > 1) {
                    $("#szZDPSelectOTA").prepend("<option value=''>Default Department</option>");
                    var selectControl = $("#szZDPSelectOTA");
                    selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                    selectControl.selectmenu();
                    selectControl.selectmenu("refresh", true);
                    if ($('#zem_lCDP_SysId').val() != "" && $('#zem_lCDP_SysId').val() != "0") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].value == $('#zem_lCDP_SysId').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setDepartmentNumber();
                                }
                            }
                        }
                    }
                }
                else {
                    $("#otaZDPRow").css('display', 'none')
                }
            }
            break;
        case "#szZAJSelect":
            if (szPunchType != "OTA") {
                $('#szZAJSelect').find('option').remove()
                $('#szZAJSelect').append(plistItems)
                $("#szZAJSelect").append($("#szZAJSelect option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#zaj_lCount').val() > 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer" || szPunchType == "GroupPunch")) {
                    $("#szZAJSelect").prepend("<option value=''>Default Job</option>");
                }
                var selectControl = $("#szZAJSelect");
                selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                selectControl.selectmenu();
                selectControl.selectmenu("refresh", true);
                if (szPunchType != "GroupPunch") {
                    if ($("#zem_szLastPunchType").val().toUpperCase() == "CLOCK IN") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szLastPunchJob').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setJobNumber()
                                }
                            }
                        }
                    }
                    else {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szJobDescription').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setJobNumber()
                                }
                            }
                        }
                    }
                }
                if ($("#bGeoDefaults").val() == 1) {
                    if (geoFenceId.indexOf("-") >= 0) {
                        if (geoFenceId.split('-')[0] == "JOB") {
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].value == geoFenceId.split('-')[1]) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setJobNumber();
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (szPunchType != "GroupPunch") {
                            if (geoFenceId != "") {
                                retreiveGeoSceduleDefault(geoFenceId, 'JOB')
                            }
                        }
                    }
                }
            }
            else {
                $('#szZAJSelectOTA').find('option').remove()
                $('#szZAJSelectOTA').append(plistItems)
                $("#szZAJSelectOTA").append($("#szZAJSelectOTA option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#szZAJSelectOTA').children('option').length > 1) {
                    $("#szZAJSelectOTA").prepend("<option value=''>Default Job</option>");
                    var selectControl = $("#szZAJSelectOTA");
                    selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                    selectControl.selectmenu();
                    selectControl.selectmenu("refresh", true);
                    if ($('#zem_lJOB_SysId').val() != "" && $('#zem_lJOB_SysId').val() != "0") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].value == $('#zem_lJOB_SysId').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setJobNumber();
                                }
                            }
                        }
                    }
                }
                else {
                    $("#otaZAJRow").css('display', 'none')
                }
            }
            break;
        case "#szZATSelect":
            if (szPunchType != "OTA") {
                $('#szZATSelect').find('option').remove()
                $('#szZATSelect').append(plistItems)
                $("#szZATSelect").append($("#szZATSelect option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#zat_lCount').val() > 1 && ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer" || szPunchType == "GroupPunch")) {
                    $("#szZATSelect").prepend("<option value=''>Default Task</option>");
                }
                var selectControl = $("#szZATSelect");
                selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                selectControl.selectmenu();
                selectControl.selectmenu("refresh", true);
                if (szPunchType != "GroupPunch") {
                    if ($("#zem_szLastPunchType").val().toUpperCase() == "CLOCK IN") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szLastPunchTask').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setTaskNumber()
                                }
                            }
                        }
                    }
                    else {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].text == $('#zem_szTaskDescription').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setTaskNumber()
                                }
                            }
                        }
                    }
                }
                if ($("#bGeoDefaults").val() == 1) {
                    if (geoFenceId.indexOf("-") >= 0) {
                        if (geoFenceId.split('-')[0] == "ASK") {
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].value == geoFenceId.split('-')[1]) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setTaskNumber();
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (szPunchType != "GroupPunch") {
                            if (geoFenceId != "") {
                                retreiveGeoSceduleDefault(geoFenceId, 'ASK')
                            }
                        }
                    }
                }
            }
            else {
                $('#szZATSelectOTA').find('option').remove()
                $('#szZATSelectOTA').append(plistItems)
                $("#szZATSelectOTA").append($("#szZATSelectOTA option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
                if ($('#szZATSelectOTA').children('option').length > 1) {
                    $("#szZATSelectOTA").prepend("<option value=''>Default Task</option>");
                    var selectControl = $("#szZATSelectOTA");
                    selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
                    selectControl.selectmenu();
                    selectControl.selectmenu("refresh", true);
                    if ($('#zem_lASK_SysId').val() != "" && $('#zem_lASK_SysId').val() != "0") {
                        if (selectControl.children('option').length > 2) {
                            for (var i = 0; i < selectControl.children('option').length; i++) {
                                if (selectControl.children('option')[i].value == $('#zem_lASK_SysId').val()) {
                                    selectControl.val(selectControl.children('option')[i].value)
                                    selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                    setTaskNumber();
                                }
                            }
                        }
                    }
                }
                else {
                    $("#otaZATRow").css('display', 'none')
                }
            }
            break;
        case "#szApproveMessageOTASelect":
            $('#szApproveMessageOTASelect').find('option').remove()
            $('#szApproveMessageOTASelect').append(plistItems)
            $("#szApproveMessageOTASelect").append($("#szApproveMessageOTASelect option").remove().sort(function (a, b) {
                var at = $(a).text(), bt = $(b).text();
                return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
            }));
            $("#szApproveMessageOTASelect").prepend('<option value="" data-placeholder="true">Select Other Activity</option>');
            var selectControl = $("#szApproveMessageOTASelect");
            selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
            selectControl.selectmenu();
            selectControl.selectmenu("refresh", true);
            //$(":mobile-pagecontainer").pagecontainer("change", "#ApproveMessage")
            bReloadPage = false
            break;
        case "#szOTASelect":
            $('#szOTASelect').find('option').remove()
            $('#szOTASelect').append(plistItems)
            $("#szOTASelect").append($("#szOTASelect option").remove().sort(function (a, b) {
                var at = $(a).text(), bt = $(b).text();
                return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
            }));
            $("#szOTASelect").prepend('<option value="">Select Other Activity</option>');
            var selectControl = $("#szOTASelect");
            selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
            selectControl.selectmenu();
            selectControl.selectmenu("refresh", true);
            bReloadPage = false
            break;
        case "#szSWPSelect":
            $('#szSWPSelect').find('option').remove()
            $('#szSWPSelect').append(plistItems)
            $("#szSWPSelect").append($("#szSWPSelect option").remove().sort(function (a, b) {
                var at = $(a).text(), bt = $(b).text();
                return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
            }));
            $("#szSWPSelect").prepend('<option value="">Select Employee</option>');
            var selectControl = $("#szSWPSelect");
            selectControl.val("").attr('selected', true).siblings('option').removeAttr('selected');
            selectControl.selectmenu();
            selectControl.selectmenu("refresh", true);
            bReloadPage = false
            break;
    }

}

function updateZDR(szControl, szListItems, tx) {
    var sqlStatement = "Select lZDR_SysId from TCzdr where szControl = '" + szControl + "'"
    try {
        tx.executeSql(sqlStatement, null,
            function successSelect(tx, result) {
                if (result) {
                    if (result.rows.length > 0) {
                        sqlStatement = "UPDATE TCzdr SET szControl ='" + szControl + "', szListItems = '" + szListItems + "' WHERE lZDR_SysId = " + result.rows.item(0).lZDR_SysId
                        try {
                            tx.executeSql(sqlStatement, null, null, function errorUpdateZDR(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                    else {
                        sqlStatement = "Insert Into TCzdr(szControl,szListItems) Values('" + szControl + "','" + szListItems + "')"
                        try {
                            tx.executeSql(sqlStatement, null, null, function errorInsertZDR(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        }
                        catch (e) {

                        }
                    }
                }
            },
            function errorSelect(tx, err) {
                displaySQLError(sqlStatement, err)
            }
            )
    }
    catch (e) {

    }
}

function BuildZVLRowGeofence(pszLocationId, pnLatitude, pnLongitude) {
    var geoFenceObject
    geoFenceObject = {
        identifier: pszLocationId,
        radius: 100,
        notifyOnEntry: true,
        notifyOnExit: true,
        notifyOnDwell: false,
        loiteringDelay: 30000   // <-- 30 seconds
    }
    if (pnLatitude != 0 && pnLongitude != 0) {
        geoFenceObject.latitude = pnLatitude
        geoFenceObject.longitude = pnLongitude
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
            alert('error Adding Valid Location Geo fence')
        }
    }

}

function retreiveGeoSceduleDefault(pGeoFenceId, szType) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzsh WHERE lZSH_SysId = " + pGeoFenceId, null, function successSelectZSH(tx, result) {
                if (result.rows.length > 0) {
                    switch (szType) {
                        case "CDP":
                            var selectControl = $("#szZDPSelect");
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].text == result.rows.item(0).szDepartment) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setDepartmentNumber();
                                    }
                                }
                            }
                            break;
                        case "JOB":
                            var selectControl = $("#szZAJSelect");
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].text == result.rows.item(0).szJobDescription) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setJobNumber();
                                    }
                                }
                            }
                            break;
                        case "ASK":
                            var selectControl = $("#szZATSelect");
                            if (selectControl.children('option').length > 2) {
                                for (var i = 0; i < selectControl.children('option').length; i++) {
                                    if (selectControl.children('option')[i].text == result.rows.item(0).szTaskDescription) {
                                        selectControl.val(selectControl.children('option')[i].value)
                                        selectControl.val(selectControl.children('option')[i].value).selectmenu('refresh', true)
                                        setTaskNumber();
                                    }
                                }
                            }
                            break;
                    }
                }

            }, function errorSelectZSH(tx, err) {
                displaySQLError("SELECT * FROM TCzsh WHERE lZSH_SysId = " + pGeoFenceId, err)
            })
        })
    }
    catch (e) {

    }

}

function refreshGeofence() {
    if ($("#szGeofenceBase").val() != "" && $("#szGeofenceBase").val() != "Schedule") {
        hideMenuItems()
        $.mobile.loading('show', {
            text: $.mobile.loader.prototype.options.text,
            textVisible: $.mobile.loader.prototype.options.textVisible,
            theme: $.mobile.loader.prototype.options.theme,
            textonly: false,
            html: ""
        })
        if (!db) {
            db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
        }
        try {
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM TCzvl', null,
                    function successloadZVLFromDB(tx, result) {
                        var rows, row, i = 0
                        if (result.rows.length > 0) {
                            rows = resultsToArray(result.rows);
                            $.each(rows, function () {
                                if (device.platform == 'android' || device.platform == 'Android') {
                                    row = rows.item(i);
                                }
                                else {
                                    row = rows[i]
                                }
                                BuildZVLRowGeofence(row.szLocationId, row.nLatitude, row.nLongitude)
                                i++;
                            })
                            $.mobile.loading("hide");
                            setupMenuRetreiveTCzcn()
                        }
                    },
                    function errorDeleteZSH(tx, err) {
                        displaySQLError("Delete From TCzvl", err)
                        $.mobile.loading("hide");
                        setupMenuRetreiveTCzcn()
                    })
            })
        }
        catch (e) {

        }
    }
    else {
        if ($("#szGeofenceBase").val() != "" && $("#szGeofenceBase").val() == "Schedule") {
            hideMenuItems()
            $.mobile.loading('show', {
                text: $.mobile.loader.prototype.options.text,
                textVisible: $.mobile.loader.prototype.options.textVisible,
                theme: $.mobile.loader.prototype.options.theme,
                textonly: false,
                html: ""
            })
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            try {
                db.transaction(function (tx) {
                    tx.executeSql('SELECT * FROM TCzsh', null,
                        function successloadZVLFromDB(tx, result) {
                            var rows, row, i = 0
                            if (result.rows.length > 0) {
                                rows = resultsToArray(result.rows);
                                $.each(rows, function () {
                                    if (device.platform == 'android' || device.platform == 'Android') {
                                        row = rows.item(i);
                                    }
                                    else {
                                        row = rows[i]
                                    }
                                    if (row.lDate == clarionToday() && row.lEndTime >= clarionClock()) {
                                        BuildZSHRowGeofence(row)
                                    }
                                    i++;
                                })
                                $.mobile.loading("hide");
                                setupMenuRetreiveTCzcn()
                            }
                        },
                        function errorDeleteZSH(tx, err) {
                            displaySQLError("SELECT * FROM TCzsh", err)
                            $.mobile.loading("hide");
                            setupMenuRetreiveTCzcn()
                        })
                })
            }
            catch (e) {

            }

        }
    }
}