function setupOTAwindow() {
    szOTASelectControl = "#szOTASelect"
    if (otaSelectListitems != "") {
        setSelectControl(otaSelectListitems, "#szOTASelect")
    }
    else {
        loadZOAFromDB()
    }
}

function setOTAPrompt() {
    var sqlStatement = 'SELECT * FROM TCzoa WHERE lZOA_SysId = ' + $("#szOTASelect").val()
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try{
        db.transaction(function (tx) { tx.executeSql(sqlStatement, null, loadOTAPrompt, errorZOA) })
    }
    catch (e) {

    }
}

function loadOTAPrompt(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#OTAType").text(result.rows.item(0).szType + ":")
    $("#nOtherAmount").val("")
}

function cancelOTAClicked() {
    szDialogReturnTo = "#Home"
    callCancelDiaglog()
}

function validateOTA() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    szDialogReturnTo = "#OTA"
    if (!$.trim($("#nOtherAmount").val()) || $("#nOtherAmount").val() == 0 || $("#nOtherAmount").val() == "") {
        $("#dialogMessage").text($("#OTAType").text() + " is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "nOtherAmount"
        return false
    }
    if (!$.trim($("#szOTASelect").val())) {
        $("#dialogMessage").text("Other Activity is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szOTASelect"
        return false
    }
    var sqlStatement = 'SELECT * FROM TCzoa WHERE lZOA_SysId = ' + $("#szOTASelect").val()
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try{
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, createOTATransaction, function errorSelectZOA(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {

    }
    return true
}

function createOTATransaction(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    var sqlInsertTo, sqlValues, sqlStatement
    sqlInsertTo = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId,lOTA_SysId,lCodeNumber,szOtherActivityType,nOtherAmount,lDateSent,lTimeSent,bFailureCount"
    sqlValues = "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Other Activity'," + authorizeCEM_SysId + ","
    sqlValues+= result.rows.item(0).lZOA_SysId + "," + result.rows.item(0).lCodeNumber + ",'" + result.rows.item(0).szOtherActivityType + "'," + $("#nOtherAmount").val() + ",0,0,0"
    if ($("#szZDPSelectOTA").val() != "" && $("#szZDPSelectOTA").val() > 0) {
        sqlInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
        sqlValues += "," + $("#szZDPSelectOTA").val() + "," + $('#zdp_lDepartmentNumber').val() + ",'" + $("#szZDPSelectOTA").find(":selected").text() + "'"
    }
    else {
        if ($("#zem_lCDP_SysId").val() != "" && $("#zem_lCDP_SysId").val() > 0) {
            sqlInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
            sqlValues += "," + $("#zem_lCDP_SysId").val() + "," + $('#zem_lDepartmentNumber').val() + ",'" + $("#zem_szDepartment").val() + "'"
        }
    }
    if ($("#szZAJSelectOTA").val() != "" && $("#szZAJSelectOTA").val() > 0) {
        sqlInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
        sqlValues += "," + $("#szZAJSelectOTA").val() + "," + $('#zaj_lJobNumber').val() + ",'" + $("#szZAJSelectOTA").find(":selected").text() + "'"
    }
    else {
        if ($("#zem_lJOB_SysId").val() != "" && $("#zem_lJOB_SysId").val() > 0) {
            sqlInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
            sqlValues += "," + $("#zem_lJOB_SysId").val() + "," + $('#zem_lJobNumber').val() + ",'" + $("#zem_szJobDescription").val() + "'"
        }
    }
    if ($("#szZATSelectOTA").val() != "" && $("#szZATSelectOTA").val() > 0) {
        sqlInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
        sqlValues += "," + $("#szZATSelectOTA").val() + "," + $('#zat_lTaskNumber').val() + ",'" + $("#szZATSelectOTA").find(":selected").text() + "'"
    }
    else{
        if ($("#zem_lASK_SysId").val() != "" && $("#zem_lASK_SysId").val() > 0) {
            sqlInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
            sqlValues += "," + $("#zem_lASK_SysId").val() + "," + $('#zem_lTaskNumber').val() + ",'" + $("#zem_szTaskDescription").value + "'"
        }
    }
    sqlInsertTo += ")"
    sqlValues += ")"
    sqlStatement = sqlInsertTo + " " + sqlValues
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) { tx.executeSql(sqlStatement, null, retriveMaxZTR,
                function sqlError(tx, err) {
                    displaySQLError(sqlStatement, err)
                }
                    )
        })
    }
    catch (e) {
        alert(e.message)
    }
    if (checkInternet() == true) {
        $("#nOtherAmount").val("")
        $("#dialogHeader").text("Other Activity Successful")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        szDialogReturnTo = "#Home"
        $("#dialogMessage").text("Your other activity was successful")
        $(":mobile-pagecontainer").pagecontainer("change", "#dialogPage")
    }

}

function setDepartmentNumber() {
    if (szPunchType != "OTA") {
        var sqlStatement = 'SELECT * FROM TCzdp WHERE lZDP_SysId = ' + $("#szZDPSelect").val()
    }
    else {
        var sqlStatement = 'SELECT * FROM TCzdp WHERE lZDP_SysId = ' + $("#szZDPSelectOTA").val()
    }
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, loadDepartmentNumber, function errorSelectZDP(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {

    }
}

function loadDepartmentNumber(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#zdp_lDepartmentNumber").val(result.rows.item(0).lDepartmentNumber)
}

function setJobNumber() {
    if (szPunchType != "OTA") {
        var sqlStatement = 'SELECT * FROM TCzaj WHERE lZAJ_SysId = ' + $("#szZAJSelect").val()
    }
    else {
        var sqlStatement = 'SELECT * FROM TCzaj WHERE lZAJ_SysId = ' + $("#szZAJSelectOTA").val()
    }
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, loadJobNumber, function errorSelectZAJ(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {

    }
}

function loadJobNumber(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#zaj_lJobNumber").val(result.rows.item(0).lJobNumber)
}

function setTaskNumber() {
    if (szPunchType != "OTA") {
        var sqlStatement = 'SELECT * FROM TCzat WHERE lZAT_SysId = ' + $("#szZATSelect").val()
    }
    else {
        var sqlStatement = 'SELECT * FROM TCzat WHERE lZAT_SysId = ' + $("#szZATSelectOTA").val()
    }
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, loadTaskNumber, function errorSelectZAT(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
    catch (e) {

    }
}

function loadTaskNumber(tx, result) {
    if (result.rows.length <= 0) {
        return
    }
    $("#zat_lTaskNumber").val(result.rows.item(0).lTaskNumber)
}

function PunchRetreiveTCzcn() {
    //zcnServiceResponse = ""
    //var heartBeatHeader = createHeartBeatHeader("DATA UPDATE CONFIGURATION")
    //punchWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE CONFIGURATION")
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM TCzcn', null, loadZCNFromDB, function errorSelectZCN(tx, err) {
                    displaySQLError('SELECT * FROM TCzcn', err)
                })
            })
}


function loadZCNFromDB(tx, result) {
    if (result.rows.length > 0) {
        $('#zcn_bMinOutDuration').val(result.rows.item(0).bMinOutDuration)
        $('#bForceTransfer').val(result.rows.item(0).bForceTransfer)
        $("#zcn_bDepRequired").val(result.rows.item(0).bDepRequired)
        $('#zcn_bJobRequired').val(result.rows.item(0).bJobRequired)
        $('#zcn_bTaskRequired').val(result.rows.item(0).bTaskRequired)
        $('#zcn_bNoGeoPunch').val(result.rows.item(0).bNoGeoPunch)
        $('#zcn_bGeofenceLockout').val(result.rows.item(0).bGeofenceLockout)
    }
    else {
        $('#zcn_bMinOutDuration').val(0)
        $('#bForceTransfer').val(0)
        $("#zcn_bDepRequired").val(0)
        $('#zcn_bJobRequired').val(0)
        $('#zcn_bTaskRequired').val(0)
        $('#zcn_bNoGeoPunch').val(0)
        $('#zcn_bGeofenceLockout').val(0)
    }
    if (szPunchType != "GroupPunch") {
        PunchRetreiveTCzem()
    }
    else {
        loadDepJobAsk()
    }
    
}

function PunchRetreiveTCzem() {
    if (loginPunchClicked == true) {
        zemServiceResponse = ""
        var heartBeatHeader = createHeartBeatHeader("DATA UPDATE USER")
        punchWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE USER")
    }
    else {
        if (!db) {
            db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
        }
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzem', null, loadZEMFromDB, function errorSelectZEM(tx, err) {
                displaySQLError('SELECT * FROM TCzem', err)
            })
        })
    }
}

function loadZEMFromDB(tx, result) {
    if (result.rows.length > 0) {
        $('#zem_bDisableClockOut').val(result.rows.item(0).bDisableClockOut)
        $('#zem_szLastPunchType').val(result.rows.item(0).szLastPunchType)
        $('#zem_lLastPunchDate').val(result.rows.item(0).lLastPunchDate)
        $('#zem_lLastPunchTime').val(result.rows.item(0).lLastPunchTime)
        $('#zem_szLastPunchDepartment').val(result.rows.item(0).szLastPunchDepartment)
        $('#zem_szLastPunchJob').val(result.rows.item(0).szLastPunchJob)
        $('#zem_szLastPunchTask').val(result.rows.item(0).szLastPunchTask)
        $('zem_szDepartment').val(result.rows.item(0).zem_szDepartment)
        $('zem_szJobDescription').val(result.rows.item(0).zem_szJobDescription)
        $('zem_szTaskDescription').val(result.rows.item(0).zem_szTaskDescription)
    }
    else {
        $('#zem_bDisableClockOut').val(0)
        $('#zem_szLastPunchType').val("")
        $('#zem_lLastPunchDate').val(0)
        $('#zem_lLastPunchTime').val(0)
        $('#zem_szLastPunchDepartment').val("")
        $('#zem_szLastPunchJob').val("")
        $('#zem_szLastPunchTask').val("")
        $('#zem_szDepartment').val("")
        $('#zem_szJobDescription').val("")
        $('#zem_szTaskDescription').val("")

    }
    if ($('#zcn_bNoGeoPunch').val() == 0) {
        if (szPunchType != "Transfer" && $('#bForceTransfer').val() != 1) {
            punchRetreiveGeo()
        }
        else {
            loadDepJobAsk()
        }
    }
    else {
        if (szPunchType == "Transfer" || $('#bForceTransfer').val() == 1) {
            loadDepJobAsk()
        }
        else {
            punchCheckLockout()
        }
    }
}

function punchRetreiveGeo() {
        navigator.geolocation.getCurrentPosition(setGeoParm1, errorGeoParm1, { maximumAge: 3000, timeout: 30000, enableHighAccuracy: true });
}

function setGeoParm1(position) {
    $('#nLatitude').val(position.coords.latitude)
    $('#nLongitude').val(position.coords.longitude)
    if (($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) || ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0)) {
        if (szPunchType == "Transfer" || $('#bForceTransfer').val() == 1) {
            createPunchTransaction()
        }
        else {
            punchCheckLockout()
        }
    }
    else {
        if (bgGeo) {
            bgGeo.getCurrentPosition({
                timeout: 30,    // 30 second timeout to fetch location
                maximumAge: 3000 // Accept the last-known-location if not older than 5000 ms.
            }, setGeoParm, errorGeoParm)
        }
        else {
            $("#dialogHeader").text("Location Tracking Error")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            szDialogReturnTo = "#Home"
            $("#dialogMessage").text("Location Tracking Is Required Due To Server Configuration.  Please Enable Location Tracking And Try Again.  GeoLocation Returned Blank Position And Plugin Is Not Initialized.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
        }
    }
}

function errorGeoParm1(error) {
    if (bgGeo) {
        bgGeo.getCurrentPosition({
            timeout: 30,    // 30 second timeout to fetch location
            maximumAge: 3000 // Accept the last-known-location if not older than 5000 ms.
        }, setGeoParm, errorGeoParm)
    }
    else {
        $("#dialogHeader").text("Location Tracking Error")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        szDialogReturnTo = "#Home"
        $("#dialogMessage").text("Location Tracking Is Required Due To Server Configuration.  Please Enable Location Tracking And Try Again.  GeoLocation Returned Error " + error.message + " And Plugin Is Not Initialized.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
    }
}

function setGeoParm(location, taskId) {
    $('#nLatitude').val(location.coords.latitude)
    $('#nLongitude').val(location.coords.longitude)
    if (($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) || ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0)) {
        if (szPunchType == "Transfer" || $('#bForceTransfer').val() == 1) {
            createPunchTransaction()
        }
        else {
            punchCheckLockout()
        }
    }
    else {
        $("#dialogHeader").text("Location Tracking Error")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        szDialogReturnTo = "#Home"
        $("#dialogMessage").text("Location Tracking Is Required Due To Server Configuration.  Please Enable Location Tracking And Try Again.  Plugin Returned Blank Position.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
    }
}

function errorGeoParm(errorCode) {
    var errorMessage
    switch (errorCode) {
        case 0:
            errorMessage = "Location unknown"
            break;
        case 1:
            errorMessage = "Location permission denied"
            break;
        case 2:
            errorMessage = "Network error"
            break;
        case 3:
            errorMessage = "Heading Failure"
            break;
        case 4:
            errorMessage = "Region Monitoring Denied"
            break;
        case 5:
            errorMessage = "Region Monitoring Failure"
            break;
        case 6:
            errorMessage = "Region Monitoring Setup Delayed"
            break;
        case 7:
            errorMessage = "Region Monitoring Response Delayed"
            break;
        case 11:
            errorMessage = "Error Deferred Failed"
            break;
        case 12:
            errorMessage = "Deferred Not Updating Location"
            break;
        case 13:
            errorMessage = "Deferred Accuracy Too Low"
            break;
        case 14:
            errorMessage = "Deferred Distance Filtered"
            break;
        case 15:
            errorMessage = "Deferred Canceled"
            break;
        case 100:
            errorMessage = "Failed to fetch a location of desired minimumAccuracy"
            break;
        case 408:
            errorMessage = "Location timeout"
            break;
        default:
            errorMessage = "Error unknown"
            break;
    }
    $("#dialogHeader").text("Location Tracking Error")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    szDialogReturnTo = "#Home"
    $("#dialogMessage").text("Location Tracking Error: " + errorMessage)
    $.mobile.changePage('#dialogPage', { transition: 'flip' });
}

function punchCheckLockout() {
    if ($('#zcn_bMinOutDuration').val() > 0) {
        if ($('#zem_lLastPunchDate').val() > 0 && $('#zem_lLastPunchTime').val() > 0) {
            if (clarionToday() == $('#zem_lLastPunchDate').val()) {
                if (($('#zcn_bMinOutDuration').val() * 6000) + ($('#zem_lLastPunchTime').val() * 1) > clarionClock()) {
                    $('#zlc_szStatus').val("true")
                }
                else {
                    $('#zlc_szStatus').val("false")
                }
            }
            else {
                if (clarionToday() == ($('#zem_lLastPunchDate').val() * 1) + 1 && (($('#zcn_bMinOutDuration').val() * 6000) + ($('#zem_lLastPunchTime').val() * 1)) > 24 * 60 * 6000) {
                    if ((($('#zcn_bMinOutDuration').val() * 6000) + ($('#zem_lLastPunchTime').val() * 1) - (24 * 60 * 6000)) > clarionClock()) {
                        $('#zlc_szStatus').val("true")
                    }
                    else {
                        $('#zlc_szStatus').val("false")
                    }
                }
                else {
                    $('#zlc_szStatus').val("false")
                }
            }
        }
        else {
            $('#zlc_szStatus').val("false")
        }
        if ($('#zlc_szStatus').val() == "true") {
            setupPunchWindow(1)
        }
        else {
            PunchRetreiveTCzlc()
        }        
    }
    else {
        PunchRetreiveTCzlc()
    }
}

function PunchRetreiveTCzlc() {
    if (loginPunchClicked == true) {
        zlcServiceResponse = ""
        var heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE LOCKOUT")
        punchWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE LOCKOUT")
    }
    else {
        var sqlStatement = 'SELECT * FROM TCzlc where lDate = ' + clarionToday()
        if (!db) {
            db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
        }
        db.transaction(function (tx) {
            tx.executeSql(sqlStatement, null, loadZLCFromDB, function errorSelectZLC(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        })
    }
}

function loadZLCFromDB(tx, result) {
    if (result.rows.length > 0) {
        $('#zlc_szStatus').val("true")
        for (var i = 0; i < result.rows.length; i++) {
            if (clarionClock() >= result.rows.item(i).lBeginTime && clarionClock() <= result.rows.item(i).lEndTime) {
                $('#zlc_szStatus').val("false")
                break;
            }
        }
    }
    else {
        $('#zlc_szStatus').val("false")
    }
    setupPunchWindow(2)
}


function setupPunchWindow(pCalledFrom) {
    if ($('#zlc_szStatus').val() == "true") {
        //if ($('#zcn_bMinOutDuration').val() > 0 && $("#szLastPunchType").val() == "Clock Out") {
        if (pCalledFrom == 1) {
           $('#lockoutReason').text('Minimum Duration Lockout.  Click override for supervisor override or click cancel to not punch.')
        }
        else {
            $('#lockoutReason').text('Policy Lockout.  Click override for supervisor override or click cancel to not punch.')
        }
        $(":mobile-pagecontainer").pagecontainer("change", "#LockoutOverrideRequest")
    }
    else if ($('#zcn_bGeofenceLockout').val() == 1 && geoFenceStatus == 'EXIT') {
        $('#lockoutReason').text('Geo Fencing Lockout.  Click override for supervisor override or click cancel to not punch.')
        $(":mobile-pagecontainer").pagecontainer("change", "#LockoutOverrideRequest")
    }
    else {
        setupPunchType()
    }
}

function callLockoutOverride() {
    $('#sup_szClockId').val('')
    $('#sup_szClockPassword').val('')
    $(":mobile-pagecontainer").pagecontainer("change", "#LockoutOverride")
}

function cancelLockoutOverride() {
    if (loginPunchClicked == true) {
        szDialogReturnTo = "#Login"
    }
    else {
        szDialogReturnTo = "#Home"
    }    
    callCancelDiaglog()
}

function validateLockoutOverride() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#sup_szClockId").val())) {
        $("#dialogMessage").text("Supervisor Clock Id is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "sup_szClockId"
        return false
    }
    if (!$.trim($("#sup_szClockPassword").val())) {
        $("#dialogMessage").text("Supervisor Clock Password is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "sup_szClockPassword"
        return false
    }
    $("#zem_lSUP_SysId").val(0);
    $("#zem_SUP_szEmployeeName").val("")
    $("#zem_SUP_szClockId").val("")
    var szXMLString = makeSoapHeader("MobileRetreiveSupervisor", "AtlasClockService/")
    szXMLString += createElementString("szClockId", $("#sup_szClockId").val())
    szXMLString += createElementString("szClockPassword", $("#sup_szClockPassword").val())
    szXMLString += createElementNumber("lCEM_SysId", authorizeCEM_SysId)
    szXMLString += makeSoapFooter("MobileRetreiveSupervisor")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/MobileRetreiveSupervisor"


    callLockoutWebService(szXMLString, szURL)

    if (ServiceResponse == "false") {
        szDialogReturnTo = "#Home"
        $("#dialogMessage").text("Failed to Retreive Supervisor Approval")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        return false
    }
    else {
        if ($(ServiceResponse).find("lSUP_SysId").text() == 0) {
            szDialogReturnTo = "#Home"
            $("#dialogMessage").text("Failed to Retreive Supervisor Approval")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            return false
        }
        else if ($(ServiceResponse).find("lSUP_SysId").text() == authorizeCEM_SysId) {
            szDialogReturnTo = "#Home"
            $("#dialogMessage").text("Can Not Self Override Lockout")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            return false
        }
        else {
            $("#zem_lSUP_SysId").val($(ServiceResponse).find("lSUP_SysId").text());
            $("#zem_SUP_szEmployeeName").val($(ServiceResponse).find("szSupervisorName").text())
            $("#zem_SUP_szClockId").val($(ServiceResponse).find("szSupClockId").text())
            setupPunchType()
        }
    }
}

function callLockoutWebService(pRequestXML, pszURL) {
    try {
        $.ajax({
            type: "POST",
            url: pszURL,
            dataType: "xml",
            data: pRequestXML,
            processData: false,
            crossDomain: true,
            timeout: 3000,
            async: false,
            success: lockoutWebServiceSuccess,
            error: lockoutWebServiceError
        });
    }
    catch (e) {

    }
}

function lockoutWebServiceSuccess(data) {
    var returnedXML = XMLToString(data)
    ServiceResponse = returnedXML
}

function lockoutWebServiceError(data, status, request) {
    ServiceResponse = "false"
}

function setupGroupPunch() {
    if ($("#zdp_lCount").val() <= 1) {
        $("#punchZDPRow").css('display', 'none')
    }
    else {
        $("#punchZDPRow").css('display', '')
    }
    if ($("#zaj_lCount").val() <= 1) {
        $("#punchZAJRow").css('display', 'none')
    }
    else {
        $("#punchZAJRow").css('display', '')
    }
    if ($("#zat_lCount").val() <= 1) {
        $("#punchZATRow").css('display', 'none')
    }
    else {
        $("#punchZATRow").css('display', '')
    }
    $("#GroupPunchSelectAllTable").css('display', '')
    $("#GrouPunchTable").css('display', '')
    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
}

function setupPunchType() {
    $("#GroupPunchSelectAllTable").css('display', 'none')
    $("#GrouPunchTable").css('display', 'none')
    if($("#bForceTransfer").val() == 1 || szPunchType == "Transfer"){
        if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
            if ($("#zdp_lCount").val() <= 1 || $("#bDisableDepSwitch").val() == 1) {
                $("#punchZDPRow").css('display', 'none')
            }
            else{
                $("#punchZDPRow").css('display', '')
            }
            if ($("#zaj_lCount").val() <= 1 || $("#bDisableJobSwitch").val() == 1) {
                $("#punchZAJRow").css('display', 'none')
            }
            else {
                $("#punchZAJRow").css('display', '')
            }
            if ($("#zat_lCount").val() <= 1 || $("#bDisableTaskSwitch").val() == 1) {
                $("#punchZATRow").css('display', 'none')
            }
            else {
                $("#punchZATRow").css('display', '')
            }
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
        }
        else {
            if ($('#zcn_bNoGeoPunch').val() == 0) {
                if (($("#nLatitude").val() == "" || $("#nLatitude").val() == 0) && ($("#nLongitude").val() == "" || $("#nLongitude").val() == 0)) {
                    punchRetreiveGeo()
                }
                else {
                    createPunchTransaction()
                }
            }
            else {
                createPunchTransaction()
            }            
        }
    }
    else {
        createPunchTransaction()
    }
}

function validateGroupPunchTransaction() {
    $("#GroupPunchSelectAllTable").css('display', '')
    $("#GrouPunchTable").css('display', '')
    if ($('#zgp_lSelectedCount').val() == 0) {
        szDialogReturnTo = "#Punch"
        $("#dialogMessage").text("At Least One Employee Must Be Tagged.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        //szFocusField = "szZDPSelect"
        return false

    }

    if ($("#zdp_lCount").val() > 1 && $("#zcn_bDepRequired").val() == 1) {
        if ($("#szZDPSelect").val() == "") {
            szDialogReturnTo = "#Punch"
            $("#dialogMessage").text("Department Must Be Selected.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szZDPSelect"
            return false
        }
    }
    if ($("#zaj_lCount").val() > 1 && $("#zcn_bJobRequired").val() == 1) {
        if ($("#szZAJSelect").val() == "") {
            szDialogReturnTo = "#Punch"
            $("#dialogMessage").text("Job Must Be Selected.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szZAJSelect"
            return false
        }
    }
    if ($("#zat_lCount").val() > 1) {
        if ($("#szZATSelect").val() == "" && $("#zcn_bTaskRequired").val() == 1) {
            szDialogReturnTo = "#Punch"
            $("#dialogMessage").text("Task Must Be Selected.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szZATSelect"
            return false
        }
        if ($("#szZATSelect").val() != "" && $("#szZAJSelect").val() == "") {
            szDialogReturnTo = "#Punch"
            if ($('#zem_szLastPunchTask').val() == "") {
                $("#dialogMessage").text("Default Employee Job is Not Assigned.")
            }
            else {
                $("#dialogMessage").text("Job Must Be Selected.")
            }
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szZATSelect"
            return false
        }
    }
    createGroupPunchTransaction()
}

function createGroupPunchTransaction() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM TCzgp WHERE bSelected = 1', null,
                function successloadZGPFromDB(tx, result) {
                    var rows, row, i = 0, bDisplayMessage=false
                    if (result.rows.length > 0) {
                        rows = resultsToArray(result.rows);
                        $.each(rows, function () {
                            if (device.platform == 'android' || device.platform == 'Android') {
                                row = rows.item(i);
                            }
                            else {
                                row = rows[i]
                            }
                            bDisplayMessage = false
                            if (i == result.rows.length - 1) {
                                bDisplayMessage = true
                            }
                            buildAndSendGroupPunch(row.lCEM_SysId, row.szEmployeeName, row.szClockId, bDisplayMessage)
                            i++;
                        })
                        grouPunchUntagAll()
                    }
                },
                function errorloadZGPFromDB(tx, err) {
                    displaySQLError('SELECT * FROM TCzgp WHERE bSelected = 1', err)
                }
                )
        })
    }
    catch (e) {

    }

}

function buildAndSendGroupPunch(plCEM_SysId, pszEmployeeName, pszClockId, pbDisplayMessage) {
    var sqlInsertTo, sqlValues, sqlStatement
    var cemSqlStataemet
    sqlInsertTo = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId"
    if (plCEM_SysId == authorizeCEM_SysId) {
        cemSqlStataemet = "UPDATE TCZEM SET"
        if ($("#szLastPunchType").val() == "" || $("#szLastPunchType").val() == "Clock Out") {
            cemSqlStataemet += " szLastPunchType = 'Clock In'"
        }
        else {
            cemSqlStataemet += " szLastPunchType = 'Clock Out'"
        }
    }    
    sqlValues = "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + pszClockId + "','" + pszEmployeeName + "','Punch'," + plCEM_SysId
    if (plCEM_SysId == authorizeCEM_SysId) {
        cemSqlStataemet += ", lLastPunchDate = " + clarionToday() + ", lLastPunchTime= " + clarionClock()
    }
        if ($("#szZDPSelect").val() != "" && $("#szZDPSelect").val() > 0) {
            sqlInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
            sqlValues += "," + $("#szZDPSelect").val() + "," + $('#zdp_lDepartmentNumber').val() + ",'" + $("#szZDPSelect").find(":selected").text() + "'"
            if (plCEM_SysId == authorizeCEM_SysId) {
                cemSqlStataemet += ",szLastPunchDepartment = '" + $("#szZDPSelect").find(":selected").text() + "'"
            }
        }
        if ($("#szZAJSelect").val() != "" && $("#szZAJSelect").val() > 0) {
            sqlInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
            sqlValues += "," + $("#szZAJSelect").val() + "," + $('#zaj_lJobNumber').val() + ",'" + $("#szZAJSelect").find(":selected").text() + "'"
            if (plCEM_SysId == authorizeCEM_SysId) {
                cemSqlStataemet += ",szLastPunchJob = '" + $("#szZAJSelect").find(":selected").text() + "'"
            }
        }
        if ($("#szZATSelect").val() != "" && $("#szZATSelect").val() > 0) {
            sqlInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
            sqlValues += "," + $("#szZATSelect").val() + "," + $('#zat_lTaskNumber').val() + ",'" + $("#szZATSelect").find(":selected").text() + "'"
            if (plCEM_SysId == authorizeCEM_SysId) {
                cemSqlStataemet += ",szLastPunchTask = '" + $("#szZATSelect").find(":selected").text() + "'"
            }
        }
    if ($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) {
        sqlInsertTo += ",nLatitude"
        sqlValues += "," + $("#nLatitude").val()
    }
    if ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0) {
        sqlInsertTo += ",nLongitude"
        sqlValues += "," + $("#nLongitude").val()
    }
    sqlInsertTo += ",lUTCTime,lUTCDate,lDateSent,lTimeSent,bFailureCount)"
    sqlValues += "," + clarionUTCClock() + "," + clarionUTCToday() + ",0,0,0)"
    sqlStatement = sqlInsertTo + " " + sqlValues
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        if (checkInternet() == true) {
            db.transaction(function (tx) {
                tx.executeSql(sqlStatement, null, retriveMaxZTR,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
            })
            if (plCEM_SysId == authorizeCEM_SysId) {
                db.transaction(function (tx) {
                    tx.executeSql(cemSqlStataemet, null, null, function errorUpdateZEM(tx, err) {
                        displaySQLError(cemSqlStataemet, err)
                    })
                })
            }
        }
        else {
            db.transaction(function (tx) {
                tx.executeSql(sqlStatement, null, null,
                    function sqlError(tx, err) {
                        displaySQLError(sqlStatement, err)
                    }
                        )
            })
            if (plCEM_SysId == authorizeCEM_SysId) {
                db.transaction(function (tx) {
                    tx.executeSql(cemSqlStataemet, null, null, function errorUpdateZEM(tx, err) {
                        displaySQLError(cemSqlStataemet, err)
                    })
                })
            }
        }
    }
    catch (e) {
        alert(e.message)
    }
    if (pbDisplayMessage == true) {
        if (checkInternet() == true) {
            $("#dialogHeader").text("Punch Successful")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            szDialogReturnTo = "#Home"
            $("#dialogMessage").text("Your punch was successful")
            $(":mobile-pagecontainer").pagecontainer("change", "#dialogPage")
        }
        else {
            displayQueuedMessage()
        }
    }
}

function createPunchTransaction() {
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if ($('#zcn_bNoGeoPunch').val() == 0) {
        if (($("#nLatitude").val() == "" || $("#nLatitude").val() == 0) && ($("#nLongitude").val() == "" || $("#nLongitude").val() == 0)) {
            if ($("#bForceTransfer").val() == 1 || szPunchType == "Transfer" || szPunchType == "GroupPunch") {
                szDialogReturnTo = "#Punch"
            }
            else {
                szDialogReturnTo = "#Home"
            }
            $("#dialogMessage").text("Location Tracking Is Blank. Location Tracking May Be Disabled.  Please Enable Location Tracking And Try Again.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            return false
        }
    }
    if (szPunchType != "GroupPunch") {
        if ($("#zem_bDisableClockOut").val() == 1 && $("#zem_szLastPunchType").val().toUpperCase() == "CLOCK IN") {
            if ($("#bForceTransfer").val() == 1 || szPunchType == "Transfer") {
                if ((!$.trim($("#szZDPSelect").val()) || $("#szZDPSelect").text() == $('#zem_szLastPunchDepartment').val())
                    && (!$.trim($("#szZAJSelect").val()) || $("#szZAJSelect").text() == $('#zem_szLastPunchJob').val())
                    && (!$.trim($("#szZATSelect").val()) || $("#szZATSelect").text() == $('#zem_szLastPunchTask').val())) {
                    szDialogReturnTo = "#Home"
                    $("#dialogMessage").text("Clock out is Disabled.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    return false
                }
            }
            else {
                szDialogReturnTo = "#Home"
                $("#dialogMessage").text("Clock out is Disabled.")
                $.mobile.changePage('#dialogPage', { transition: 'flip' });
                return false
            }
        }
        if ($("#bForceTransfer").val() == 1 || szPunchType == "Transfer") {
            if ($("#zdp_lCount").val() > 1 && $("#zcn_bDepRequired").val() == 1) {
                if ($("#szZDPSelect").val() == "") {
                    szDialogReturnTo = "#Punch"
                    $("#dialogMessage").text("Department Must Be Selected.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szZDPSelect"
                    return false
                }
            }
            if ($("#zaj_lCount").val() > 1 && $("#zcn_bJobRequired").val() == 1) {
                if ($("#szZAJSelect").val() == "") {
                    szDialogReturnTo = "#Punch"
                    $("#dialogMessage").text("Job Must Be Selected.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szZAJSelect"
                    return false
                }
            }
            if ($("#zat_lCount").val() > 1) {
                if ($("#szZATSelect").val() == "" && $("#zcn_bTaskRequired").val() == 1) {
                    szDialogReturnTo = "#Punch"
                    $("#dialogMessage").text("Task Must Be Selected.")
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szZATSelect"
                    return false
                }
                if ($("#szZATSelect").val() != "" && $("#szZAJSelect").val() == "") {
                    szDialogReturnTo = "#Punch"
                    if ($('#zem_szLastPunchTask').val() == "") {
                        $("#dialogMessage").text("Default Employee Job is Not Assigned.")
                    }
                    else {
                        $("#dialogMessage").text("Job Must Be Selected.")
                    }
                    $.mobile.changePage('#dialogPage', { transition: 'flip' });
                    szFocusField = "szZATSelect"
                    return false
                }
            }

        }
        var sqlInsertTo, sqlValues, sqlStatement
        var cemSqlStataemet
        sqlInsertTo = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId"
        cemSqlStataemet = "UPDATE TCZEM SET"
        if ($("#szLastPunchType").val() == "" || $("#szLastPunchType").val() == "Clock Out") {
            cemSqlStataemet += " szLastPunchType = 'Clock In'"
        }
        else {
            cemSqlStataemet += " szLastPunchType = 'Clock Out'"
        }
        sqlValues = "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Punch'," + authorizeCEM_SysId
        cemSqlStataemet += ", lLastPunchDate = " + clarionToday() + ", lLastPunchTime= " + clarionClock()
        if ($('#bForceTransfer').val() == 1 || szPunchType == "Transfer") {
            if ($("#szZDPSelect").val() != "" && $("#szZDPSelect").val() > 0) {
                sqlInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
                sqlValues += "," + $("#szZDPSelect").val() + "," + $('#zdp_lDepartmentNumber').val() + ",'" + $("#szZDPSelect").find(":selected").text() + "'"
                cemSqlStataemet += ",szLastPunchDepartment = '" + $("#szZDPSelect").find(":selected").text() + "'"
            }
            if ($("#szZAJSelect").val() != "" && $("#szZAJSelect").val() > 0) {
                sqlInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
                sqlValues += "," + $("#szZAJSelect").val() + "," + $('#zaj_lJobNumber').val() + ",'" + $("#szZAJSelect").find(":selected").text() + "'"
                cemSqlStataemet += ",szLastPunchJob = '" + $("#szZAJSelect").find(":selected").text() + "'"
            }
            if ($("#szZATSelect").val() != "" && $("#szZATSelect").val() > 0) {
                sqlInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
                sqlValues += "," + $("#szZATSelect").val() + "," + $('#zat_lTaskNumber').val() + ",'" + $("#szZATSelect").find(":selected").text() + "'"
                cemSqlStataemet += ",szLastPunchTask = '" + $("#szZATSelect").find(":selected").text() + "'"
            }
        }
        if ($('#zem_lSUP_SysId').val() > 0) {
            sqlInsertTo += ",szSupervisorClockId,szSupervisorName"
            sqlValues += ",'" + $("#zem_SUP_szClockId").val() + "','" + $("#zem_SUP_szEmployeeName").val() + "'"
        }
        if ($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) {
            sqlInsertTo += ",nLatitude"
            sqlValues += "," + $("#nLatitude").val()
        }
        if ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0) {
            sqlInsertTo += ",nLongitude"
            sqlValues += "," + $("#nLongitude").val()
        }
        sqlInsertTo += ",lUTCTime,lUTCDate,lDateSent,lTimeSent,bFailureCount)"
        sqlValues += "," + clarionUTCClock() + "," + clarionUTCToday() + ",0,0,0)"
        sqlStatement = sqlInsertTo + " " + sqlValues
        if (!db) {
            db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
        }
        try {
            if (checkInternet() == true) {
                db.transaction(function (tx) {
                    tx.executeSql(sqlStatement, null, retriveMaxZTR,
                        function sqlError(tx, err) {
                            displaySQLError(sqlStatement, err)
                        }
                            )
                })
                db.transaction(function (tx) {
                    tx.executeSql(cemSqlStataemet, null, null, function errorUpdateZEM(tx, err) {
                        displaySQLError(cemSqlStataemet, err)
                    })
                })
            }
            else {
                db.transaction(function (tx) {
                    tx.executeSql(sqlStatement, null, displayQueuedMessage,
                        function sqlError(tx, err) {
                            displaySQLError(sqlStatement, err)
                        }
                            )
                })
                db.transaction(function (tx) {
                    tx.executeSql(cemSqlStataemet, null, null, function errorUpdateZEM(tx, err) {
                        displaySQLError(cemSqlStataemet, err)
                    })
                })
            }
        }
        catch (e) {
            alert(e.message)
        }
        if (checkInternet() == true) {
            $("#dialogHeader").text("Punch Successful")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            szDialogReturnTo = "#Home"
            $("#dialogMessage").text("Your punch was successful")
            $(":mobile-pagecontainer").pagecontainer("change", "#dialogPage")
        }
    }
    else {
        validateGroupPunchTransaction()
    }
}

function cancelPunch() {
    if ($("#bMultiEmp").val() == 1) {
        szDialogReturnTo = "#Login"
    }
    else {
        szDialogReturnTo = "#Home"
    }
    fullUpdate = false
    callCancelDiaglog()
}

function displayQueuedMessage() {
    $("#dialogHeader").text("Punch Successful")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    $("#dialogMessage").text("Punch Queued For Server.")
    $(":mobile-pagecontainer").pagecontainer("change", "#dialogPage")
}


function autoPunchExit(pszID) {
    autoPunchCEMSQLStataemet = ""
    autoPunchSQLInsertTo = ""
    autoPunchSQLValues = ""
    autoPunchRetreiveGeo()
    autoPunchSQLInsertTo = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId"
    autoPunchSQLValues = "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Punch'," + authorizeCEM_SysId
    autoPunchCEMSQLStataemet = "UPDATE TCZEM SET szLastPunchType = 'Clock In', lLastPunchDate = " + clarionToday() + ", lLastPunchTime= " + clarionClock()
    retriveAutoPunchCEM()
}

function autoPunchEnter(pszID) {
    autoPunchCEMSQLStataemet = ""
    autoPunchSQLInsertTo = ""
    autoPunchSQLValues = ""
    autoPunchRetreiveGeo()
    autoPunchSQLInsertTo = "INSERT INTO TCztr(lDate,lTime,szClockId,szEmployeeName,szType,lCEM_SysId"
    autoPunchSQLValues = "VALUES(" + clarionToday() + "," + clarionClock() + ",'" + $("#szClockId").val() + "','" + $("#szEmployeeName").val() + "','Punch'," + authorizeCEM_SysId
    autoPunchCEMSQLStataemet = "UPDATE TCZEM SET szLastPunchType = 'Clock In', lLastPunchDate = " + clarionToday() + ", lLastPunchTime= " + clarionClock()
    if (pszID.indexOf("-") >= 0) {
        switch (pszID.split('-')[0]) {
            case "CDP":
                retriveAutoPunchZDPBySysId(pszID.split('-')[1])
                retriveAutoPunchZAJ("")
                retriveAutoPunchZAT("")
                break;
            case "JOB":
                retriveAutoPunchZDPBySysId("")
                retriveAutoPunchZAJ(pszID.split('-')[1])
                retriveAutoPunchZAT("")
                break;
            case "ASK":
                retriveAutoPunchZDPBySysId("")
                retriveAutoPunchZAJ("")
                retriveAutoPunchZAT(pszID.split('-')[1])
                break;
        }
    }
    else {
        retriveAutoPunchZSH(pszID)
    }

}

function retriveAutoPunchCEM() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try{
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, null, autoPunchAssignCEM, function errorSelectZEM(tx, err) {
                displaySQLError("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, err)
            })
        })
    }
    catch (e) {

    }
}

function autoPunchAssignCEM(tx, result) {
    if (result.rows.length > 0) {
        autoPunchSQLInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
        autoPunchSQLValues += "," + result.rows.item(0).lCDP_SysId + "," + result.rows.item(0).lDepartmentNumber + ",'" + result.rows.item(0).szDepartment + "'"
        autoPunchCEMSQLStataemet += ",szLastPunchDepartment = '" + result.rows.item(0).szDepartment + "'"
        autoPunchSQLInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
        autoPunchSQLValues += "," + result.rows.item(0).lJOB_SysId + "," + result.rows.item(0).lJobNumber + ",'" + result.rows.item(0).szJobDescription + "'"
        autoPunchCEMSQLStataemet += ",szLastPunchJob = '" + result.rows.item(0).szJobDescription + "'"
        autoPunchSQLInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
        autoPunchSQLValues += "," + result.rows.item(0).lASK_SysId + "," + result.rows.item(0).lTaskNumber + ",'" + result.rows.item(0).szTaskDescription + "'"
        autoPunchCEMSQLStataemet += ",szLastPunchTask = '" + result.rows.item(0).szTaskDescription + "'"
    }
    if ($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) {
        autoPunchSQLInsertTo += ",nLatitude"
        autoPunchSQLValues += "," + $("#nLatitude").val()
    }
    if ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0) {
        autoPunchSQLInsertTo += ",nLongitude"
        autoPunchSQLValues += "," + $("#nLongitude").val()
    }
    autoPunch()
}

function autoPunchRetreiveGeo() {
    if (bgGeo) {
        bgGeo.getCurrentPosition({
            timeout: 30,    // 30 second timeout to fetch location
            maximumAge: 3000, // Accept the last-known-location if not older than 5000 ms.
            desiredAccuracy: 10
        }, autoPunchAssignGeoParm, autoPunchErrorGeoParm)
    }
}

function autoPunchAssignGeoParm(location, taskId) {
    $('#nLatitude').val(location.coords.latitude)
    $('#nLongitude').val(location.coords.longitude)
}

function autoPunch(){
    autoPunchSQLInsertTo += ",lDateSent,lTimeSent,bFailureCount)"
    autoPunchSQLValues += ",0,0,0)"
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) { tx.executeSql(autoPunchSQLInsertTo + " " + autoPunchSQLValues, null, retriveMaxZTR,
                function sqlError(tx, err) {
                    displaySQLError(autoPunchSQLInsertTo + " " + autoPunchSQLValues, err)
                }
                    )
        })
        db.transaction(function (tx) {
            tx.executeSql(autoPunchCEMSQLStataemet, null, null, function errorUpdateZEM(tx, err) {
                displaySQLError(autoPunchCEMSQLStataemet, err)
            })
        })
    }
    catch (e) {

    }
}

function retriveAutoPunchZSH(plZSH_SysId) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzsh WHERE lZSH_SysId = " + plZSH_SysId, null, autoPunchAssignZSH, function errorSelectZSH(tx, err) {
                displaySQLError("SELECT * FROM TCzsh WHERE lZSH_SysId = " + plZSH_SysId, err)
            })
        })
    }
    catch (e) {

    }

}

function autoPunchAssignZSH(tx, result) {
    if (result.rows.length > 0) {
        retriveAutoPunchZDP(result.rows.item(0).szDepartment)
        retriveAutoPunchZAJ(result.rows.item(0).szJobDescription)
        retriveAutoPunchZAT(result.rows.item(0).szTaskDescription)
    }
}

function retriveAutoPunchZDP(pszDepartment) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        if (pszDepartment != " ") {
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzdp WHERE szDepartment = '" + pszDepartment + "'", null, autoPunchAssignZDP, function errorSelectZDP(tx, err) {
                    displaySQLError("SELECT * FROM TCzdp WHERE szDepartment = '" + pszDepartment + "'", err)
                })
            })
        }
        else {
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, null, autoPunchAssignZDP, function errorSelectZEM(tx, err) {
                    displaySQLError("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, err)
                })
            })
        }
    }
    catch (e) {

    }
}

function autoPunchAssignZDP(tx, result) {
    if (result.rows.length > 0) {
        autoPunchSQLInsertTo += ",lCDP_SysId,lDepartmentNumber,szDepartment"
        if (result.rows.item(0).lZDP_SysId) {
            autoPunchSQLValues += "," + result.rows.item(0).lZDP_SysId + "," + result.rows.item(0).lDepartmentNumber + ",'" + result.rows.item(0).szDepartment + "'"
        }
        else {
            autoPunchSQLValues += "," + result.rows.item(0).lCDP_SysId + "," + result.rows.item(0).lDepartmentNumber + ",'" + result.rows.item(0).szDepartment + "'"
        }
        autoPunchCEMSQLStataemet += ",szLastPunchDepartment = '" + result.rows.item(0).szDepartment + "'"
    }
}

function retriveAutoPunchZAJ(pszJobDescription) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        if (pszJobDescription != " ") {
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzaj WHERE szJobDescription = '" + pszJobDescription + "'", null, autoPunchAssignZAJ, function errorSelectZAJ(tx, err) {
                    displaySQLError("SELECT * FROM TCzaj WHERE szJobDescription = '" + pszJobDescription + "'", err)
                })
            })
        }
        else {
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, null, autoPunchAssignZAJ, function errorSelectZEM(tx, err) {
                    displaySQLError("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, err)
                })
            })
        }
    }
    catch (e) {

    }
}

function autoPunchAssignZAJ(tx, result) {
    if (result.rows.length > 0) {
        autoPunchSQLInsertTo += ",lJOB_SysId,lJobNumber,szJobDescription"
        if (result.rows.item(0).lZAJ_SysId) {
            autoPunchSQLValues += "," + result.rows.item(0).lZAJ_SysId + "," + result.rows.item(0).lJobNumber + ",'" + result.rows.item(0).szJobDescription + "'"
        }
        else{
            autoPunchSQLValues += "," + result.rows.item(0).lJOB_SysId + "," + result.rows.item(0).lJobNumber + ",'" + result.rows.item(0).szJobDescription + "'"
        }
        autoPunchCEMSQLStataemet += ",szLastPunchJob = '" + result.rows.item(0).szJobDescription + "'"
    }
}

function retriveAutoPunchZAT(pszTaskDescription) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        if (pszTaskDescription != " "){
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzat WHERE szTaskDescription = '" + pszTaskDescription + "'", null, autoPunchAssignZAT, function errorSelectZAT(tx, err) {
                    displaySQLError("SELECT * FROM TCzat WHERE szTaskDescription = '" + pszTaskDescription + "'", err)
                })
            })
        }
        else{
            db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, null, autoPunchAssignZAT, function errorSelectZEM(tx, err) {
                    displaySQLError("SELECT * FROM TCzem WHERE lCEM_SysId = " + authorizeCEM_SysId, err)
                })
            })
        }
    }
    catch (e) {

    }
}

function autoPunchAssignZAT(tx, result) {
    if (result.rows.length > 0) {
        autoPunchSQLInsertTo += ",lASK_SysId,lTaskNumber,szTaskDescription"
        if (result.rows.item(0).lZAT_SysId) {
            autoPunchSQLValues += "," + result.rows.item(0).lZAT_SysId + "," + result.rows.item(0).lTaskNumber + ",'" + result.rows.item(0).szTaskDescription + "'"
        }
        else {
            autoPunchSQLValues += "," + result.rows.item(0).lASK_SysId + "," + result.rows.item(0).lTaskNumber + ",'" + result.rows.item(0).szTaskDescription + "'"
        }
        autoPunchCEMSQLStataemet += ",szLastPunchTask = '" + result.rows.item(0).szTaskDescription + "'"
    }
    if ($("#nLatitude").val() != "" && $("#nLatitude").val() != 0) {
        autoPunchSQLInsertTo += ",nLatitude"
        autoPunchSQLValues += "," + $("#nLatitude").val()
    }
    if ($("#nLongitude").val() != "" && $("#nLongitude").val() != 0) {
        autoPunchSQLInsertTo += ",nLongitude"
        autoPunchSQLValues += "," + $("#nLongitude").val()
    }
    autoPunch()
}

function retriveAutoPunchZDPBySysId(plZDP_SysId) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzdp WHERE lZDP_SysId = " + plZDP_SysId, null, autoPunchAssignZDP, function errorSelectZDP(tx, err) {
                displaySQLError("SELECT * FROM TCzdp WHERE lZDP_SysId = " + plZDP_SysId, err)
            })
        })
    }
    catch (e) {

    }
}

function retriveAutoPunchZAJBySysId(plZAJ_SysId) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzaj WHERE lZAJ_SysId = " + plZAJ_SysId, null, autoPunchAssignZAJ, function errorSelectZAJ(tx, err) {
                displaySQLError("SELECT * FROM TCzaj WHERE lZAJ_SysId = " + plZAJ_SysId, err)
            })
        })
    }
    catch (e) {

    }
}

function retriveAutoPunchZATBySysId(plZAT_SysId) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM TCzat WHERE lZAT_SysId = " + plZAT_SysId, null, autoPunchAssignZAT, function errorSelectZAT(tx, err) {
                displaySQLError("SELECT * FROM TCzat WHERE lZAT_SysId = " + plZAT_SysId, err)
            })
        })
    }
    catch (e) {

    }
}
