var ServiceResponse, db, zshServiceResponse, zeaServiceResponse, ztsServiceResponse, zdpServiceResponse, zajServiceResponse, zatServiceResponse, swpServiceResponse
var zoaServiceResponse, zemServiceResponse, zcnServiceResponse, zecServiceResponse, ztrServiceResponse, zlcServiceResponse, zvlServiceResponse, zlgServiceResponse
var zgpServiceResponse, zscServiceResponse, zavServiceResponse 
var authorizeSLA_SysId, authorizeCEM_SysId, authorizeSDV_SysId
var lFromVersionIndex, szCurrentVersion, szLatestVersion
var szNewMessageType, szTabSelected, szDialogReturnTo, bReloadPage, bReloadMessages, szFocusField, szOTASelectControl, szPunchType = '', ztrToDeletedId
var fullUpdate = false, domainExist = false, serviceError, processTransDelay, loadPageDelay, szUUID = "", bgGeo, geoFenceStatus = 'EXIT', lgeofenceCount, geoFenceId = ''
var autoPunchCEMSQLStataemet, autoPunchSQLInsertTo, autoPunchSQLValues, fullUpdateProcessDelay
var TimeCarredProccessCalled = false
var loginPunchClicked = false, saveSetupWindowClicked = false
var zdpListitems = "", zajListitems = "", zatListitems = "", otaSelectListitems = "", otaApproveMessagetListitems = "", swpSelectListitems = ""
var szLastFullUpdateCommand = "", mycount = 0
var ip = "^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\." +
    "([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\." +
    "([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\." +
    "([01]?\\d\\d?|2[0-4]\\d|25[0-5])$";

function makeSoapHeader(pzAction, pURL) {
    var szXMLString

    szXMLString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
    szXMLString += "<soap:Envelope  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"  xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
    szXMLString += "<soap:Body>"
    szXMLString += "<" + pzAction + " xmlns=\"" + pURL + "\">"
    return szXMLString
}

function makeSoapFooter(pzAction) {
    var szXMLString

    szXMLString = "</" + pzAction + ">"
    szXMLString += "</soap:Body>"
    szXMLString += "</soap:Envelope>"

    return szXMLString
}

function createElementNumber(pszTag, plValue) {
    var szXMLString

    if (!(plValue == 0)) {
        szXMLString = "<" + pszTag + ">" + plValue + "</" + pszTag + ">"
    }
    else {
        szXMLString = "<" + pszTag + "/>"
    }

    return szXMLString
}

function createElementString(pszTag, pszValue) {
    var szXMLString

    if (!(pszValue == "")) {
        szXMLString = "<" + pszTag + ">" + pszValue + "</" + pszTag + ">"
    }
    else {
        szXMLString = "<" + pszTag + "/>"
    }

    return szXMLString
}

function callWebService(pRequestXML, pszURL) {
    //if (checkInternet() == true) {

    try {
        $.ajax({
            type: "POST",
            url: pszURL,
            dataType: "xml",
            data: pRequestXML,
            processData: false,
            crossDomain: true,
            timeout: 3000,
            async: true,
            success: webServiceSuccess,
            error: webServiceError
        });
    }
    catch (e) {

    }
    //}
    //else {
    //    ServiceResponse = "false"
    //}
}

function webServiceError(data, status, request) {
    serviceError = data.responseText
    ServiceResponse = "false"
}

function webServiceSuccess(data) {
    serviceError = ""
    var returnedXML = XMLToString(data)
    ServiceResponse = returnedXML
    loadSLC1()
}

function StringToXML(oString) {
    //code for IE
    if (window.ActiveXObject) {
        var oXML = new ActiveXObject("Microsoft.XMLDOM"); oXML.loadXML(oString);
        return oXML;
    }
    // code for Chrome, Safari, Firefox, Opera, etc.
    else {
        return (new DOMParser()).parseFromString(oString, "text/xml");
    }
}

function XMLToString(oXML) {
    //code for IE
    if (window.ActiveXObject) {
        var oString = oXML.xml; return oString;
    }
    // code for Chrome, Safari, Firefox, Opera, etc.
    else {
        return (new XMLSerializer()).serializeToString(oXML);
    }
}


function stdTimeZoneOffset() {
    var mydate = new Date()
    var jan = new Date(mydate.getFullYear(), 0, 1);
    var jul = new Date(mydate.getFullYear(), 6, 1);
    if (jan.getTimezoneOffset() < 0 && jul.getTimezoneOffset() < 0) {
        return Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }
    else {
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }
}

function dst() {
    var mydate = new Date();
    return mydate.getTimezoneOffset() < stdTimeZoneOffset();
}

function diffTimeZoneOffset() {
    var mydate = new Date();
    return stdTimeZoneOffset() - mydate.getTimezoneOffset();
}

function clarionToday() {
    var mydate = new Date();
    //return toClarionDate(mydate.toLocaleDateString());
    return toClarionDate(mydate.getFullYear() + "-" + ("0" + (mydate.getMonth() + 1)).slice(-2) + "-" + ("0" + mydate.getDate()).slice(-2));
}

function clarionClock() {
    var mydate = new Date();
    return toClarionTime(mydate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false }));
}

function clarionUTCToday() {
    var mydate = new Date();
    return toClarionDate(mydate.getUTCFullYear() + "-" + ("0" + (mydate.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + mydate.getUTCDate()).slice(-2));
}


function clarionUTCClock() {
    var mydate = new Date();
    //var jDate = new Date(1800, 11, 28);
    var jDate = new Date();
    var jHour = mydate.getUTCHours() + 0;
    var jMinute = mydate.getUTCMinutes() + 0;
    var jSecond = mydate.getUTCSeconds() + 0;
    jDate.setHours(jHour);
    jDate.setMinutes(jMinute);
    jDate.setSeconds(0);
    return toClarionTime(jDate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false }));
}

function sqlToday() {
    var mydate = new Date();
    //return mydate.toLocaleDateString();
    return mydate.getFullYear() + "-" + ("0" + (mydate.getMonth() + 1)).slice(-2) + "-" + ("0" + mydate.getDate()).slice(-2);
}

function sqlClock() {
    var mydate = new Date();
    return mydate.toLocaleTimeString(navigator.language, { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function toSqlDate(intDays) {
    var jDayinSec = 24 * 60 * 60 * 1000;
    var mydate = new Date();
    var jDate = new Date(1800, 11, 28, mydate.getHours(), mydate.getMinutes(), mydate.getSeconds());   
    if (dst()) {
        jDate.setTime(jDate.getTime() + (intDays * jDayinSec) - (diffTimeZoneOffset() * 60000));
    }
    else {
        jDate.setTime(jDate.getTime() + (intDays * jDayinSec));
    }
    var jMonth = jDate.getMonth();
    var jDay = jDate.getDate();
    var jYear = jDate.getFullYear();
    mydate.setFullYear(jYear);
    mydate.setMonth(jMonth);
    mydate.setDate(jDay);
    if (jMonth != mydate.getMonth()) {
        return jDate.toLocaleDateString();
    }
    else {
        return mydate.toLocaleDateString();
    }
}

function toSqlDateValue(intDays) {
    var jDayinSec = 24 * 60 * 60 * 1000;
    var mydate = new Date();
    var jDate = new Date(1800, 11, 28, mydate.getHours(), mydate.getMinutes(), mydate.getSeconds());
    if (dst()) {
        jDate.setTime(jDate.getTime() + (intDays * jDayinSec) - (diffTimeZoneOffset() * 60000));
    }
    else {
        jDate.setTime(jDate.getTime() + (intDays * jDayinSec));
    }
    var jMonth = jDate.getMonth();
    var jDay = jDate.getDate();
    var jYear = jDate.getFullYear();
    mydate.setFullYear(jYear);
    mydate.setMonth(jMonth);
    mydate.setDate(jDay);
    if (jMonth != mydate.getMonth()) {
        return jYear + "-" + ("0" + (jMonth + 1)).slice(-2) + "-" + ("0" + jDay).slice(-2)
    }
    else {
        return mydate.getFullYear() + "-" + ("0" + (mydate.getMonth() + 1)).slice(-2) + "-" + ("0" + mydate.getDate()).slice(-2)
    }
}


function toSqlTime(intSec) {
    var mydate = new Date();
    var jDate = new Date(1800, 11, 28);
    jDate.setTime(jDate.getTime() + (intSec * 10));
    var jHour = jDate.getHours() + 0;
    var jMinute = jDate.getMinutes() + 0;
    var jSecond = jDate.getSeconds() + 0;

    mydate.setHours(jHour);
    mydate.setMinutes(jMinute);
    mydate.setSeconds(0);

    return mydate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
}

function toSqlTimeValue(intSec) {
    var mydate = new Date();
    var jDate = new Date(1800, 11, 28);
    jDate.setTime(jDate.getTime() + (intSec * 10));
    var jHour = jDate.getHours() + 0;
    var jMinute = jDate.getMinutes() + 0;
    var jSecond = jDate.getSeconds() + 0;

    mydate.setHours(jHour);
    mydate.setMinutes(jMinute);
    mydate.setSeconds(0);

    return mydate.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false });
}


function toClarionDate(strDate) {
    if (strDate.split("-").length > 1) {
        var myDate = new Date(strDate.replace(/-/g, "/"));
    }
    else {
        var myDate = new Date(strDate);
    }
    strDate = Math.round(myDate.getMonth() * 1 + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()
    var jDayinSec = 24 * 60 * 60 * 1000;
    var jDateinSec, jBaseDate, jBaseDateinSec;
    jBaseDate = new Date(1800, 11, 28, 0, 0, 1);
    jBaseDateinSec = jBaseDate.getTime();
    if (device.platform != 'android' && device.platform != 'Android') {
        if (device.version.indexOf('9.') >= 0 || device.version.indexOf('10.') >= 0 || device.version.indexOf('11.') >= 0 || device.version.indexOf('12.') >= 0 || device.version.indexOf('13.') >= 0) {
            jDateinSec = Date.parse(strDate + " 00:00:01");
        }
        else {
            if (dst()) {
                jDateinSec = Date.parse(strDate + " 00:00:01") + (diffTimeZoneOffset() * 60000);
            }
            else {
                jDateinSec = Date.parse(strDate + " 00:00:01");
            }
        }
    }
    else {
        jDateinSec = Date.parse(strDate + " 00:00:01");
    }
    return Math.round(((jDateinSec - jBaseDateinSec) / jDayinSec));
}

function toClarionTime(strTime) {
    var jDateinSec, jBaseDate, jBaseDateinSec;

    if (strTime.split("M").length > 1) {
        strTime = strTime.split("M")[0] + "M"
    }

    jBaseDate = new Date(1800, 11, 28);
    jBaseDateinSec = jBaseDate.getTime();
    if (device.platform != 'android' && device.platform != 'Android') {
        if (device.version.indexOf('9.') >= 0 || device.version.indexOf('10.') >= 0 || device.version.indexOf('11.') >= 0 || device.version.indexOf('12.') >= 0 || device.version.indexOf('13.') >= 0) {
            jDateinSec = Date.parse("12/28/1800" + " " + strTime);
        }
        else {
            if (dst()) {
                jDateinSec = Date.parse("12/28/1800" + " " + strTime) + (diffTimeZoneOffset() * 60000);
            }
            else {
                jDateinSec = Date.parse("12/28/1800" + " " + strTime);
            }
        }
    }
    else {
        jDateinSec = Date.parse("12/28/1800" + " " + strTime);
    }
    return Math.round(((jDateinSec - jBaseDateinSec) / 10) + 1);
}

function checkInternet() {
    return true
    if ($("#szAuthorization").val() == "") {
        return true
    }
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE) {
        $(".ui-header").css("color", "red");
        return false;
    }
    else {
        //return serverReachable()
        doesDomainExist()
        if (domainExist == false) {
            $(".ui-header").css("color", "red");
            return false;
        }
        else {
            if (serverReachable() == false) {
                $(".ui-header").css("color", "red");
                return false;
            }
            else {
                $(".ui-header").css("color", "white");
                return true;
            }
        }
    }
}

function effectiveDeviceHeight() {
    var deviceHeight
    if (window.orientation == 90) {
        deviceHeight = window.screen.height
    }
    else {
        deviceHeight = 'auto'
    }
    // iOS returns available pixels, Android returns pixels / pixel ratio
    // http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
    if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio) {
        //deviceHeight = deviceHeight / window.devicePixelRatio;
        //deviceHeight = deviceHeight / 2;
    }
    return deviceHeight;
}

function callCancelDiaglog() {
    reloadPage = true
    $("#dialogHeader").text("Cancel Operation")
    $("#YesNoblock").css("display", "")
    $("#Closeblock").css("display", "none")
    $("#dialogMessage").text("Are You Sure You Want To Cancel?")
    $.mobile.changePage('#dialogPage', { transition: 'flip' });
}

function setFocusField() {
    switch (szFocusField) {
        case "szAuthorization":
            $("#szAuthorization").focus()
            szFocusField = ""
            break;
        case "szServerDomain":
            $("#szServerDomain").focus()
            szFocusField = ""
            break;
        case "lServerPort":
            $("#lServerPort").focus()
            szFocusField = ""
            break;
        case "szClockId":
            $("#szClockId").focus()
            szFocusField = ""
            break;
        case "szClockPassword":
            $("#szClockPassword").focus()
            szFocusField = ""
            break;
        case "lHeartBeatFrequency":
            $("#lHeartBeatFrequency").focus()
            szFocusField = ""
            break;
        case "szMessageDescription":
            $("#szMessageDescription").focus()
            szFocusField = ""
            break;
        case "szMessageText":
            $("#szMessageText").focus()
            szFocusField = ""
            break;
        case "lDateRequestFrom":
            $("#lDateRequestFrom").focus()
            szFocusField = ""
            break;
        case "lDateRequestTo":
            $("#lDateRequestTo").focus()
            szFocusField = ""
            break;
        case "lTimeRequestFrom":
            $("#lTimeRequestFrom").focus()
            szFocusField = ""
            break;
        case "lTimeRequestTo":
            $("#lTimeRequestTo").focus()
            szFocusField = ""
            break;
        case "nDailyOTAHours":
            $("#nDailyOTAHours").focus()
            szFocusField = ""
            break;
        case "szDeclineMessageText":
            $("#szDeclineMessageText").focus()
            szFocusField = ""
            break;
        case "szReplyMessageDescription":
            $("#szReplyMessageDescription").focus()
            szFocusField = ""
            break;
        case "szReplyMessageText":
            $("#szReplyMessageText").focus()
            szFocusField = ""
            break;
        case "szApproveMessageText":
            $("#szApproveMessageText").focus()
            szFocusField = ""
            break;
        case "szApproveMessageOTASelect":
            $("#szApproveMessageOTASelect").focus()
            szFocusField = ""
            break;
        case "szOTASelect":
            $("#szOTASelect").focus()
            szFocusField = ""
            break;
        case "nOtherAmount":
            $("#nOtherAmount").focus()
            szFocusField = ""
            break;
        case "sup_szClockId":
            $("#sup_szClockId").focus()
            szFocusField = ""
            break;
        case "sup_szClockPassword":
            $("#sup_szClockPassword").focus()
            szFocusField = ""
            break;
        case "szZDPSelect":
            $("#szZDPSelect").focus()
            szFocusField = ""
            break;
        case "szZAJSelect":
            $("#szZAJSelect").focus()
            szFocusField = ""
            break;
        case "szZATSelect":
            $("#szZATSelect").focus()
            szFocusField = ""
            break;
        case "szTimecardNote":
            $("#szTimecardNote").focus()
            szFocusField = ""
            break;
        case "szLoginClockId":
            $("#szLoginClockId").focus()
            szFocusField = ""
            break;
        case "szLoginClockPassword":
            $("#szLoginClockPassword").focus()
            szFocusField = ""
            break;
        case "szSWPSelect":
            $("#szSWPSelect").focus()
            szFocusField = ""
            break;
        case "szCoverDescription":
            $("#szCoverDescription").focus()
            szFocusField = ""
            break;
        case "szCoverText":
            $("#szCoverText").focus()
            szFocusField = ""
            break;
        case "lCoverTimeRequestFrom":
            $("#lCoverTimeRequestFrom").focus()
            szFocusField = ""
            break;
        case "lCoverTimeRequestTo":
            $("#lCoverTimeRequestTo").focus()
            szFocusField = ""
            break;
        case "lStartTimeOne":
            $("#lStartTimeOne").focus()
            szFocusField = ""
            break;
        case "lStopTimeOne":
            $("#lStopTimeOne").focus()
            szFocusField = ""
            break;
        case "lStartTimeTwo":
            $("#lStartTimeTwo").focus()
            szFocusField = ""
            break;
        case "lStopTimeTwo":
            $("#lStopTimeTwo").focus()
            szFocusField = ""
            break;
        case "lStartTimeThree":
            $("#lStartTimeThree").focus()
            szFocusField = ""
            break;
        case "lStopTimeThree":
            $("#lStopTimeThree").focus()
            szFocusField = ""
            break;
        default:
            break;
    }
}

function setupHeader() {
    if (checkInternet() == true) {
        $(".ui-header").css("color", "white");
    }
    else {
        $(".ui-header").css("color", "red");
    }
}

function setupMenuRetreiveTCzcn() {
    hideMenuItems()
    zcnServiceResponse = ""
    var heartBeatHeader = createHeartBeatHeader("DATA UPDATE CONFIGURATION")
    $.ajax({
        type: "POST",
        url: heartBeatHeader.szURL,
        dataType: "xml",
        data: heartBeatHeader.szXMLString,
        processData: false,
        crossDomain: true,
        async: false,
        success: function (data) {
            var returnedXML
            var sqlStatement
            returnedXML = XMLToString(data)
            var currentResponse = returnedXML
            if (!$(currentResponse).find("TCzcn").length) {
                setupMenu();
                if (saveSetupWindowClicked == true) {
                    saveSetupWindowClicked = false
                    fulldataUpdate();
                }
                return
            }
            for (var i = 0; i < $(currentResponse).find("TCzcn").length; i++) {
                var TCzcnRecord = $(currentResponse).find("TCzcn")[i];
                $("#bHideTimecard").val($(TCzcnRecord).attr('bHideTimecard'))
                $("#bHideSchedule").val($(TCzcnRecord).attr('bHideSchedule'))
                $("#bHideAccrual").val($(TCzcnRecord).attr('bHideAccrual'))
                $("#bHideTransfer").val($(TCzcnRecord).attr('bHideTransfer'))
                $("#bHideOtherActivity").val($(TCzcnRecord).attr('bHideOtherActivity'))
                $("#bDisablePunch").val($(TCzcnRecord).attr('bDisablePunch'))
                $("#szGeofenceBase").val($(TCzcnRecord).attr('szGeofenceBase'))
                $("#bGeoAutoPunch").val($(TCzcnRecord).attr('bGeoAutoPunch'))
                $("#bGeoDefaults").val($(TCzcnRecord).attr('bGeoDefaults'))
                $("#bDisableCECOTA").val($(TCzcnRecord).attr('bDisableCECOTA'))
                $("#bDisableCECSCH").val($(TCzcnRecord).attr('bDisableCECSCH'))
                $("#bDisableCECSWAP").val($(TCzcnRecord).attr('bDisableCECSWAP'))
                $("#bDisableCEC").val($(TCzcnRecord).attr('bDisableCEC'))
                $("#bHideCECList").val($(TCzcnRecord).attr('bHideCECList'))
                $("#bDisableReview").val($(TCzcnRecord).attr('bDisableReview'))
                $("#bDisableNote").val($(TCzcnRecord).attr('bDisableNote'))
                $("#lCurrentPayPerFrmDate").val($(TCzcnRecord).attr('lCurrentPayPerFrmDate'))
                $("#lCurrentPayPerToDate").val($(TCzcnRecord).attr('lCurrentPayPerToDate'))
                $("#lPastPayPerFrmDate").val($(TCzcnRecord).attr('lPastPayPerFrmDate'))
                $("#lPastPayPerToDate").val($(TCzcnRecord).attr('lPastPayPerToDate'))
                $("#szTimecardDateRange").val($(TCzcnRecord).attr('szTimecardDateRange'))
                $("#bDisableDepSwitch").val($(TCzcnRecord).attr('bDisableDepSwitch'))
                $("#bDisableJobSwitch").val($(TCzcnRecord).attr('bDisableJobSwitch'))
                $("#bDisableTaskSwitch").val($(TCzcnRecord).attr('bDisableTaskSwitch'))
                $("#bForceTransfer").val($(TCzcnRecord).attr('bForceTransfer'))
                $("#bMultiEmp").val($(TCzcnRecord).attr('bMultiEmp'))
                $("#bOTANoDepSwtch").val($(TCzcnRecord).attr('bOTANoDepSwtch'))
                $("#bOTANoJobSwtch").val($(TCzcnRecord).attr('bOTANoJobSwtch'))
                $("#bOTANoTaskSwtch").val($(TCzcnRecord).attr('bOTANoTaskSwtch'))
                $('#zcn_bMinOutDuration').val($(TCzcnRecord).attr('bMinOutDuration'))
                $("#zcn_bDepRequired").val($(TCzcnRecord).attr('bDepRequired'))
                $('#zcn_bJobRequired').val($(TCzcnRecord).attr('bJobRequired'))
                $('#zcn_bTaskRequired').val($(TCzcnRecord).attr('bTaskRequired'))
                $('#zcn_bNoGeoPunch').val($(TCzcnRecord).attr('bNoGeoPunch'))
                $('#zcn_bGeofenceLockout').val($(TCzcnRecord).attr('bGeofenceLockout'))
                $('#bAllowGrpPunch').val($(TCzcnRecord).attr('bAllowGrpPunch'))
                $('#bHideAvailability').val($(TCzcnRecord).attr('bHideAvailability'))
                $('#bDisableSHC').val($(TCzcnRecord).attr('bDisableSHC'))
                $('#bHideSHCList').val($(TCzcnRecord).attr('bHideSHCList'))
                sqlStatement = "Update TCzcn set bMinOutDuration = " + $(TCzcnRecord).attr('bMinOutDuration') + ", bForceTransfer = " + $(TCzcnRecord).attr('bForceTransfer')
                sqlStatement += ", bJobRequired = " + $(TCzcnRecord).attr('bJobRequired') + ", bTaskRequired = " + $(TCzcnRecord).attr('bTaskRequired')
                sqlStatement += ", bHideTimecard = " + $(TCzcnRecord).attr('bHideTimecard') + ", bHideSchedule = " + $(TCzcnRecord).attr('bHideSchedule')
                sqlStatement += ", bHideAccrual = " + $(TCzcnRecord).attr('bHideAccrual') + ", bHideTransfer = " + $(TCzcnRecord).attr('bHideTransfer')
                sqlStatement += ", bHideOtherActivity = " + $(TCzcnRecord).attr('bHideOtherActivity') + ", bNoGeoPunch = " + $(TCzcnRecord).attr('bNoGeoPunch')
                sqlStatement += ", bDisablePunch = " + $(TCzcnRecord).attr('bDisablePunch') + ", bGeofenceLockout = " + $(TCzcnRecord).attr('bGeofenceLockout')
                sqlStatement += ", szGeofenceBase = '" + $(TCzcnRecord).attr('szGeofenceBase') + "',bGeoAutoPunch = " + $(TCzcnRecord).attr('bGeoAutoPunch') + ",bGeoDefaults = " + $(TCzcnRecord).attr('bGeoDefaults')
                sqlStatement += ", bDisableCECOTA = " + $(TCzcnRecord).attr('bDisableCECOTA') + ", bDisableCECSCH = " + $(TCzcnRecord).attr('bDisableCECSCH') + ", bDisableCECSWAP = " + $(TCzcnRecord).attr('bDisableCECSWAP')
                sqlStatement += ", bDisableCEC = " + $(TCzcnRecord).attr('bDisableCEC') + ", bHideCECList = " + $(TCzcnRecord).attr('bHideCECList')
                sqlStatement += ", bDisableReview = " + $(TCzcnRecord).attr('bDisableReview') + ", bDisableNote = " + $(TCzcnRecord).attr('bDisableNote')
                sqlStatement += ", lCurrentPayPerFrmDate = " + $(TCzcnRecord).attr('lCurrentPayPerFrmDate') + ", lCurrentPayPerToDate = " + $(TCzcnRecord).attr('lCurrentPayPerToDate')
                sqlStatement += ", lPastPayPerFrmDate = " + $(TCzcnRecord).attr('lPastPayPerFrmDate') + ", lPastPayPerToDate = " + $(TCzcnRecord).attr('lPastPayPerToDate')
                sqlStatement += ", szTimecardDateRange = '" + $(TCzcnRecord).attr('szTimecardDateRange') + "', bDisableDepSwitch = " + $(TCzcnRecord).attr('bDisableDepSwitch')
                sqlStatement += ", bDisableJobSwitch = " + $(TCzcnRecord).attr('bDisableJobSwitch') + ", bDisableTaskSwitch = " + $(TCzcnRecord).attr('bDisableTaskSwitch')
                sqlStatement += ", bDepRequired = " + $(TCzcnRecord).attr('bDepRequired') + ", bOTANoDepSwtch = " + $(TCzcnRecord).attr('bOTANoDepSwtch')
                sqlStatement += ", bOTANoJobSwtch = " + $(TCzcnRecord).attr('bOTANoJobSwtch') + ", bOTANoTaskSwtch = " + $(TCzcnRecord).attr('bOTANoTaskSwtch')
                if ($(TCzcnRecord).attr('bAllowGrpPunch')) {
                    sqlStatement += ", bAllowGrpPunch = " + $(TCzcnRecord).attr('bAllowGrpPunch')
                }
                if ($(TCzcnRecord).attr('bHideAvailability')) {
                    sqlStatement += ", bHideAvailability = " + $(TCzcnRecord).attr('bHideAvailability')
                }
                if ($(TCzcnRecord).attr('bMultiEmp')) {
                    sqlStatement += ", bMultiEmp = " + $(TCzcnRecord).attr('bMultiEmp')
                }
                if ($(TCzcnRecord).attr('bDisableSHC')) {
                    sqlStatement += ", bDisableSHC = " + $(TCzcnRecord).attr('bDisableSHC')
                }
                if ($(TCzcnRecord).attr('bHideSHCList')) {
                    sqlStatement += ", bHideSHCList = " + $(TCzcnRecord).attr('bHideSHCList')
                }
            }
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            db.transaction(function (tx) {
                tx.executeSql(sqlStatement, null, null,
                    function errorUpdate(tx, err) {
                        displaySQLError(sqlStatement, err)
                    })
            })
            setupMenu();
            if (saveSetupWindowClicked == true) {
                saveSetupWindowClicked = false
                fulldataUpdate();
            }
        },
        error: function (jqXHR, textStatus) {
            var sqlStatement = 'SELECT * FROM TCzcn'
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            try {
                db.transaction(function (tx) {
                    tx.executeSql(sqlStatement, null, loadZCNFromDBForMenu, function errorSelectZCN(tx, err) {
                        displaySQLError('SELECT * FROM TCzcn', err)
                    })
                })
            }
            catch (e) {

            }
        }
    })
}

function loadZCNFromDBForMenu(tx, result) {
    if (result.rows.length > 0) {
        $("#bHideTimecard").val(result.rows.item(0).bHideTimecard)
        $("#bHideSchedule").val(result.rows.item(0).bHideSchedule)
        $("#bHideAccrual").val(result.rows.item(0).bHideAccrual)
        $("#bHideTransfer").val(result.rows.item(0).bHideTransfer)
        $("#bHideOtherActivity").val(result.rows.item(0).bHideOtherActivity)
        $("#bDisablePunch").val(result.rows.item(0).bDisablePunch)
        $("#szGeofenceBase").val(result.rows.item(0).szGeofenceBase)
        $("#bGeoAutoPunch").val(result.rows.item(0).bGeoAutoPunch)
        $("#bGeoDefaults").val(result.rows.item(0).bGeoDefaults)
        $("#bDisableCECOTA").val(result.rows.item(0).bDisableCECOTA)
        $("#bDisableCECSCH").val(result.rows.item(0).bDisableCECSCH)
        $("#bDisableCECSWAP").val(result.rows.item(0).bDisableCECSWAP)
        $("#bDisableCEC").val(result.rows.item(0).bDisableCEC)
        $("#bHideCECList").val(result.rows.item(0).bHideCECList)
        $("#bDisableReview").val(result.rows.item(0).bDisableReview)
        $("#bDisableNote").val(result.rows.item(0).bDisableNote)
        $("#lCurrentPayPerFrmDate").val(result.rows.item(0).lCurrentPayPerFrmDate)
        $("#lCurrentPayPerToDate").val(result.rows.item(0).lCurrentPayPerToDate)
        $("#lPastPayPerFrmDate").val(result.rows.item(0).lPastPayPerFrmDate)
        $("#lPastPayPerToDate").val(result.rows.item(0).lPastPayPerToDate)
        $("#szTimecardDateRange").val(result.rows.item(0).szTimecardDateRange)
        $("#bDisableDepSwitch").val(result.rows.item(0).bDisableDepSwitch)
        $("#bDisableJobSwitch").val(result.rows.item(0).bDisableJobSwitch)
        $("#bDisableTaskSwitch").val(result.rows.item(0).bDisableTaskSwitch)
        $("#bForceTransfer").val(result.rows.item(0).bForceTransfer)
        $("#bMultiEmp").val(result.rows.item(0).bMultiEmp)
        $("#bOTANoDepSwtch").val(result.rows.item(0).bOTANoDepSwtch)
        $("#bOTANoJobSwtch").val(result.rows.item(0).bOTANoJobSwtch)
        $("#bOTANoTaskSwtch").val(result.rows.item(0).bOTANoTaskSwtch)
        $('#zcn_bMinOutDuration').val(result.rows.item(0).bMinOutDuration)
        $("#zcn_bDepRequired").val(result.rows.item(0).bDepRequired)
        $('#zcn_bJobRequired').val(result.rows.item(0).bJobRequired)
        $('#zcn_bTaskRequired').val(result.rows.item(0).bTaskRequired)
        $('#zcn_bNoGeoPunch').val(result.rows.item(0).bNoGeoPunch)
        $('#zcn_bGeofenceLockout').val(result.rows.item(0).bGeofenceLockout)
        $('#bAllowGrpPunch').val(result.rows.item(0).bAllowGrpPunch)
        $('#bHideAvailability').val(result.rows.item(0).bHideAvailability)        
        $('#bDisableSHC').val(result.rows.item(0).bDisableSHC)
        $('#bHideSHCList').val(result.rows.item(0).bHideSHCList)
    }
    else {
        if (1 == 0) {
            $("#bHideTimecard").val(0)
            $("#bHideSchedule").val(0)
            $("#bHideAccrual").val(0)
            $("#bHideTransfer").val(0)
            $("#bHideOtherActivity").val(0)
            $("#bDisablePunch").val(0)
            $("#szGeofenceBase").val('')
            $("#bGeoAutoPunch").val(0)
            $("#bGeoDefaults").val(0)
            $("#bDisableCECOTA").val(0)
            $("#bDisableCECSCH").val(0)
            $("#bDisableCECSWAP").val(0)
            $("#bDisableCEC").val(0)
            $("#bHideCECList").val(0)
            $("#bDisableReview").val(0)
            $("#bDisableNote").val(0)
            $("#bDisableDepSwitch").val(0)
            $("#bDisableJobSwitch").val(0)
            $("#bDisableTaskSwitch").val(0)
            $("#bForceTransfer").val(0)
            $("#bMultiEmp").val(0)
            $('#zcn_bMinOutDuration').val(0)
            $("#zcn_bDepRequired").val(0)
            $('#zcn_bJobRequired').val(0)
            $('#zcn_bTaskRequired').val(0)
            $('#zcn_bNoGeoPunch').val(0)
            $('#zcn_bGeofenceLockout').val(0)
            $("#bAllowGrpPunch").val(0)
            $("#bHideAvailability").val(0)
            $("#bDisableSHC").val(0)
            $("#bHideSHCList").val(0)
        }
    }
    setupMenu()
    if (saveSetupWindowClicked == true) {
        saveSetupWindowClicked = false
        fulldataUpdate();
    }
}

function hideMenuItems() {
    $("#Home_Timecard").hide()
    $("#OverviewMenu_Timecard").parent().hide()
    $("#Schedule_Timecard").parent().hide()
    $("#ScheduleCover_Timecard").parent().hide()
    $("#Accrual_Timecard").parent().hide()
    $("#Availability_Timecard").parent().hide()
    $("#Messages_Timecard").parent().hide()
    $("#Transactions_Timecard").parent().hide()
    $("#TimecardNote_Timecard").parent().hide()

    $("#Home_Schedule").hide()
    $("#OverviewMenu_Schedule").parent().hide()
    $("#ScheduleCover_Schedule").parent().hide()
    $("#Timecard_Schedule").parent().hide()
    $("#Accrual_Schedule").parent().hide()
    $("#Availability_Schedule").parent().hide()
    $("#Messages_Schedule").parent().hide()
    $("#Transactions_Schedule").parent().hide()
    $("#TimecardNote_Schedule").parent().hide()

    $("#Home_ScheduleCover").hide()
    $("#OverviewMenu_ScheduleCover").parent().hide()
    $("#Schedule_ScheduleCover").parent().hide()
    $("#Timecard_ScheduleCover").parent().hide()
    $("#Accrual_ScheduleCover").parent().hide()
    $("#Availability_ScheduleCover").parent().hide()
    $("#Messages_ScheduleCover").parent().hide()
    $("#Transactions_ScheduleCover").parent().hide()
    $("#TimecardNote_ScheduleCover").parent().hide()

    $("#HomeMenu_Accrual").parent().hide()
    $("#OverviewMenu_Accrual").parent().hide()
    $("#Schedule_Accrual").parent().hide()
    $("#ScheduleCover_Accrual").parent().hide()
    $("#Availability_Accrual").parent().hide()
    $("#Timecard_Accrual").parent().hide()
    $("#Messages_Accrual").parent().hide()
    $("#Transactions_Accrual").parent().hide()
    $("#TimecardNote_Accrual").parent().hide()

    $("#HomeMenu_Availability").parent().hide()
    $("#OverviewMenu_Availability").parent().hide()
    $("#Schedule_Availability").parent().hide()
    $("#ScheduleCover_Availability").parent().hide()
    $("#Accrual_Availability").parent().hide()
    $("#Timecard_Availability").parent().hide()
    $("#Messages_Availability").parent().hide()
    $("#Transactions_Availability").parent().hide()
    $("#TimecardNote_Availability").parent().hide()

    $("#Home_Transfer").hide()
    $("#OverviewMenu_Transfer").parent().hide()
    $("#Timecard_Transfer").parent().hide()
    $("#Schedule_Transfer").parent().hide()
    $("#ScheduleCover_Transfer").parent().hide()
    $("#Accrual_Transfer").parent().hide()
    $("#Availability_Transfer").parent().hide()
    $("#Messages_Transfer").parent().hide()
    $("#Transactions_Transfer").parent().hide()
    $("#TimecardNote_Transfer").parent().hide()

    $("#Home_OTA").hide()
    $("#OverviewMenu_OTA").parent().hide()
    $("#Timecard_OTA").parent().hide()
    $("#Schedule_OTA").parent().hide()
    $("#ScheduleCover_OTA").parent().hide()
    $("#Accrual_OTA").parent().hide()
    $("#Availability_OTA").parent().hide()
    $("#Messages_OTA").parent().hide()
    $("#Transactions_OTA").parent().hide()
    $("#TimecardNote_OTA").parent().hide()

    $("#Home_Punch").hide()
    $("#OverviewMenu_Punch").parent().hide()
    $("#Timecard_Punch").parent().hide()
    $("#Schedule_Punch").parent().hide()
    $("#ScheduleCover_Punch").parent().hide()
    $("#Accrual_Punch").parent().hide()
    $("#Availability_Punch").parent().hide()
    $("#Messages_Punch").parent().hide()
    $("#Transactions_Punch").parent().hide()
    $("#TimecardNote_Punch").parent().hide()
    $("#punchLogin").css('display', 'none')

    $("#Home_GroupPunch").hide()
    $("#OverviewMenu_GroupPunch").parent().hide()
    $("#Timecard_GroupPunch").parent().hide()
    $("#Schedule_GroupPunch").parent().hide()
    $("#ScheduleCover_GroupPunch").parent().hide()
    $("#Accrual_GroupPunch").parent().hide()
    $("#Availability_GroupPunch").parent().hide()
    $("#Messages_GroupPunch").parent().hide()
    $("#Transactions_GroupPunch").parent().hide()
    $("#TimecardNote_GroupPunch").parent().hide()

    $("#HomeMenu_NewOTA").parent().hide()
    $("#OverviewMenu_NewOTA").parent().hide()
    $("#Timecard_NewOTA").parent().hide()
    $("#Schedule_NewOTA").parent().hide()
    $("#ScheduleCover_NewOTA").parent().hide()
    $("#Accrual_NewOTA").parent().hide()
    $("#Availability_NewOTA").parent().hide()
    $("#Messages_NewOTA").parent().hide()
    $("#Transactions_NewOTA").parent().hide()
    $("#TimecardNote_NewOTA").parent().hide()

    $("#HomeMenu_NewSCH").parent().hide()
    $("#OverviewMenu_NewSCH").parent().hide()
    $("#Timecard_NewSCH").parent().hide()
    $("#Schedule_NewSCH").parent().hide()
    $("#ScheduleCover_NewSCH").parent().hide()
    $("#Accrual_NewSCH").parent().hide()
    $("#Availability_NewSCH").parent().hide()
    $("#Messages_NewSCH").parent().hide()
    $("#Transactions_NewSCH").parent().hide()
    $("#TimecardNote_NewSCH").parent().hide()

    $("#HomeMenu_NewSWAP").parent().hide()
    $("#OverviewMenu_NewSWAP").parent().hide()
    $("#Timecard_NewSWAP").parent().hide()
    $("#Schedule_NewSWAP").parent().hide()
    $("#ScheduleCover_NewSWAP").parent().hide()
    $("#Accrual_NewSWAP").parent().hide()
    $("Availability_NewSWAP").parent().hide()
    $("#Messages_NewSWAP").parent().hide()
    $("#Transactions_NewSWAP").parent().hide()
    $("#TimecardNote_NewSWAP").parent().hide()

    $("#HomeMenu_Note").parent().hide()
    $("#OverviewMenu_Note").parent().hide()
    $("#Timecard_Note").parent().hide()
    $("#Schedule_Note").parent().hide()
    $("#ScheduleCover_Note").parent().hide()
    $("#Accrual_Note").parent().hide()
    $("#Availability_Note").parent().hide()
    $("#Messages_Note").parent().hide()
    $("#Transactions_Note").parent().hide()
    $("#TimecardNote_Note").parent().hide()

    $("#HomeMenu_Messages").parent().hide()
    $("#OverviewMenu_Messages").parent().hide()
    $("#Timecard_Messages").parent().hide()
    $("#Schedule_Messages").parent().hide()
    $("#ScheduleCover_Messages").parent().hide()
    $("#Accrual_Messages").parent().hide()
    $("#Availability_Messages").parent().hide()
    $("#Transactions_Messages").parent().hide()
    $("#TimecardNote_Messages").parent().hide()

    $("#HomeMenu_TimecardNote").parent().hide()
    $("#OverviewMenu_TimecardNote").parent().hide()
    $("#Timecard_TimecardNote").parent().hide()
    $("#Schedule_TimecardNote").parent().hide()
    $("#ScheduleCover_TimecardNote").parent().hide()
    $("#Accrual_TimecardNote").parent().hide()
    $("#Availability_TimecardNote").parent().hide()
    $("#Transactions_TimecardNote").parent().hide()
    $("#Messages_TimecardNote").parent().hide()

    $("#HomeMenu_Logout").parent().hide()
    $("#OverviewMenu_Logout").parent().hide()
    $("#Timecard_Logout").parent().hide()
    $("#Schedule_Logout").parent().hide()
    $("#ScheduleCover_Logout").parent().hide()
    $("#Accrual_Logout").parent().hide()
    $("#Availability_Logout").parent().hide()
    $("#Transactions_Logout").parent().hide()
    $("#Messages_Logout").parent().hide()
}

function setupMenu() {
    if ($("#bHideTimecard").val() == 1) {
        $("#Home_Timecard").hide()
        $("#OverviewMenu_Timecard").parent().hide()
        $("#Schedule_Timecard").parent().hide()
        $("#ScheduleCover_Timecard").parent().hide()
        $("#Accrual_Timecard").parent().hide()
        $("#Availability_Timecard").parent().hide()
        $("#Messages_Timecard").parent().hide()
        $("#Transactions_Timecard").parent().hide()
        $("#TimecardNote_Timecard").parent().hide()
    }
    else {
        $("#Home_Timecard").show()
        $("#OverviewMenu_Timecard").parent().show()
        $("#Schedule_Timecard").parent().show()
        $("#ScheduleCover_Timecard").parent().show()
        $("#Accrual_Timecard").parent().show()
        $("#Availability_Timecard").parent().show()
        $("#Messages_Timecard").parent().show()
        $("#Transactions_Timecard").parent().show()
        $("#TimecardNote_Timecard").parent().show()
    }
    if ($("#bHideSchedule").val() == 1) {
        $("#Home_Schedule").hide()
        $("#OverviewMenu_Schedule").parent().hide()
        $("#ScheduleCover_Schedule").parent().hide()
        $("#Timecard_Schedule").parent().hide()
        $("#Accrual_Schedule").parent().hide()
        $("#Availability_Schedule").parent().hide()
        $("#Messages_Schedule").parent().hide()
        $("#Transactions_Schedule").parent().hide()
        $("#TimecardNote_Schedule").parent().hide()
    }
    else {
        $("#Home_Schedule").show()
        $("#OverviewMenu_Schedule").parent().show()
        $("#ScheduleCover_Schedule").parent().show()
        $("#Timecard_Schedule").parent().show()
        $("#Accrual_Schedule").parent().show()
        $("#Availability_Schedule").parent().show()
        $("#Messages_Schedule").parent().show()
        $("#Transactions_Schedule").parent().show()
        $("#TimecardNote_Schedule").parent().show()
    }
    if ($("#bHideSHCList").val() == 1) {
        $("#Home_ScheduleCover").hide()
        $("#OverviewMenu_ScheduleCover").parent().hide()
        $("#Schedule_ScheduleCover").parent().hide()
        $("#Timecard_ScheduleCover").parent().hide()
        $("#Accrual_ScheduleCover").parent().hide()
        $("#Availability_ScheduleCover").parent().hide()
        $("#Messages_ScheduleCover").parent().hide()
        $("#Transactions_ScheduleCover").parent().hide()
        $("#TimecardNote_ScheduleCover").parent().hide()
    }
    else {
        $("#Home_ScheduleCover").show()
        $("#OverviewMenu_ScheduleCover").parent().show()
        $("#Schedule_ScheduleCover").parent().show()
        $("#Timecard_ScheduleCover").parent().show()
        $("#Accrual_ScheduleCover").parent().show()
        $("#Availability_ScheduleCover").parent().show()
        $("#Messages_ScheduleCover").parent().show()
        $("#Transactions_ScheduleCover").parent().show()
        $("#TimecardNote_ScheduleCover").parent().show()
    }

    if ($("#bHideAccrual").val() == 1) {
        $("#HomeMenu_Accrual").parent().hide()
        $("#OverviewMenu_Accrual").parent().hide()
        $("#Schedule_Accrual").parent().hide()
        $("#ScheduleCover_Accrual").parent().hide()
        $("#Availability_Accrual").parent().hide()
        $("#Timecard_Accrual").parent().hide()
        $("#Messages_Accrual").parent().hide()
        $("#Transactions_Accrual").parent().hide()
        $("#TimecardNote_Accrual").parent().hide()
    }
    else {
        $("#HomeMenu_Accrual").parent().show()
        $("#OverviewMenu_Accrual").parent().show()
        $("#Schedule_Accrual").parent().show()
        $("#ScheduleCover_Accrual").parent().show()
        $("#Availability_Accrual").parent().show()
        $("#Timecard_Accrual").parent().show()
        $("#Messages_Accrual").parent().show()
        $("#Transactions_Accrual").parent().show()
        $("#TimecardNote_Accrual").parent().show()
    }
    if ($("#bHideAvailability").val() == 1) {
        $("#HomeMenu_Availability").parent().hide()
        $("#OverviewMenu_Availability").parent().hide()
        $("#Schedule_Availability").parent().hide()
        $("#ScheduleCover_Availability").parent().hide()
        $("#Accrual_Availability").parent().hide()
        $("#Timecard_Availability").parent().hide()
        $("#Messages_Availability").parent().hide()
        $("#Transactions_Availability").parent().hide()
        $("#TimecardNote_Availabilityl").parent().hide()
    }
    else {
        $("#HomeMenu_Availability").parent().show()
        $("#OverviewMenu_Availability").parent().show()
        $("#Schedule_Availability").parent().show()
        $("#ScheduleCover_Availability").parent().show()
        $("#Accrual_Availability").parent().show()
        $("#Timecard_Availability").parent().show()
        $("#Messages_Availability").parent().show()
        $("#Transactions_Availability").parent().show()
        $("#TimecardNote_Availabilityl").parent().show()
    }

    if ($("#bHideTransfer").val() == 1 || $("#bForceTransfer").val() == 1) {
        $("#Home_Transfer").hide()
        $("#OverviewMenu_Transfer").parent().hide()
        $("#Timecard_Transfer").parent().hide()
        $("#Schedule_Transfer").parent().hide()
        $("#ScheduleCover_Transfer").parent().hide()
        $("#Accrual_Transfer").parent().hide()
        $("#Availability_Transfer").parent().hide()
        $("#Messages_Transfer").parent().hide()
        $("#Transactions_Transfer").parent().hide()
        $("#TimecardNote_Transfer").parent().hide()
    }
    else {
        $("#Home_Transfer").show()
        $("#OverviewMenu_Transfer").parent().show()
        $("#Timecard_Transfer").parent().show()
        $("#Schedule_Transfer").parent().show()
        $("#ScheduleCover_Transfer").parent().show()
        $("#Accrual_Transfer").parent().show()
        $("#Availability_Transfer").parent().show()
        $("#Messages_Transfer").parent().show()
        $("#Transactions_Transfer").parent().show()
        $("#TimecardNote_Transfer").parent().show()
    }
    if ($("#bHideOtherActivity").val() == 1) {
        $("#Home_OTA").hide()
        $("#OverviewMenu_OTA").parent().hide()
        $("#Timecard_OTA").parent().hide()
        $("#Schedule_OTA").parent().hide()
        $("#ScheduleCover_OTA").parent().hide()
        $("#Accrual_OTA").parent().hide()
        $("#Availability_OTA").parent().hide()
        $("#Messages_OTA").parent().hide()
        $("#Transactions_OTA").parent().hide()
        $("#TimecardNote_OTA").parent().hide()
    }
    else {
        $("#Home_OTA").show()
        $("#OverviewMenu_OTA").parent().show()
        $("#Timecard_OTA").parent().show()
        $("#Schedule_OTA").parent().show()
        $("#ScheduleCover_OTA").parent().show()
        $("#Accrual_OTA").parent().show()
        $("#Availability_OTA").parent().show()
        $("#Messages_OTA").parent().show()
        $("#Transactions_OTA").parent().show()
        $("#TimecardNote_OTA").parent().show()
    }
    if ($("#bDisablePunch").val() == 1) {
        $("#Home_Punch").hide()
        $("#OverviewMenu_Punch").parent().hide()
        $("#Timecard_Punch").parent().hide()
        $("#Schedule_Punch").parent().hide()
        $("#ScheduleCover_Punch").parent().hide()
        $("#Accrual_Punch").parent().hide()
        $("#Availability_Punch").parent().hide()
        $("#Messages_Punch").parent().hide()
        $("#Transactions_Punch").parent().hide()
        $("#TimecardNote_Punch").parent().hide()
        $("#punchLogin").css('display', 'none')
    }
    else {
        $("#Home_Punch").show()
        $("#OverviewMenu_Punch").parent().show()
        $("#Timecard_Punch").parent().show()
        $("#Schedule_Punch").parent().show()
        $("#ScheduleCover_Punch").parent().show()
        $("#Accrual_Punch").parent().show()
        $("#Availability_Punch").parent().show()
        $("#Messages_Punch").parent().show()
        $("#Transactions_Punch").parent().show()
        $("#TimecardNote_Punch").parent().show()
        $("#punchLogin").css('display', '')
    }
    if ($("#bAllowGrpPunch").val() == 1) {
        $("#Home_GroupPunch").show()
        $("#OverviewMenu_GroupPunch").parent().show()
        $("#Timecard_GroupPunch").parent().show()
        $("#Schedule_GroupPunch").parent().show()
        $("#ScheduleCover_GroupPunch").parent().show()
        $("#Accrual_GroupPunch").parent().show()
        $("#Availability_GroupPunch").parent().show()
        $("#Messages_GroupPunch").parent().show()
        $("#Transactions_GroupPunch").parent().show()
        $("#TimecardNote_GroupPunch").parent().show()
    }
    else {
        $("#Home_GroupPunch").hide()
        $("#OverviewMenu_GroupPunch").parent().hide()
        $("#Timecard_GroupPunch").parent().hide()
        $("#Schedule_GroupPunch").parent().hide()
        $("#ScheduleCover_GroupPunch").parent().hide()
        $("#Accrual_GroupPunch").parent().hide()
        $("#Availability_GroupPunch").parent().hide()
        $("#Messages_GroupPunch").parent().hide()
        $("#Transactions_GroupPunch").parent().hide()
        $("#TimecardNote_GroupPunch").parent().hide()
    }

    if ($("#bDisableCECOTA").val() == 1) {
        $("#HomeMenu_NewOTA").parent().hide()
        $("#OverviewMenu_NewOTA").parent().hide()
        $("#Timecard_NewOTA").parent().hide()
        $("#Schedule_NewOTA").parent().hide()
        $("#ScheduleCover_NewOTA").parent().hide()
        $("#Accrual_NewOTA").parent().hide()
        $("#Availability_NewOTA").parent().hide()
        $("#Messages_NewOTA").parent().hide()
        $("#Transactions_NewOTA").parent().hide()
        $("#TimecardNote_NewOTA").parent().hide()
    }
    else {
        $("#HomeMenu_NewOTA").parent().show()
        $("#OverviewMenu_NewOTA").parent().show()
        $("#Timecard_NewOTA").parent().show()
        $("#Schedule_NewOTA").parent().show()
        $("#ScheduleCover_NewOTA").parent().show()
        $("#Accrual_NewOTA").parent().show()
        $("#Availability_NewOTA").parent().show()
        $("#Messages_NewOTA").parent().show()
        $("#Transactions_NewOTA").parent().show()
        $("#TimecardNote_NewOTA").parent().show()
    }
    if ($("#bDisableCECSCH").val() == 1) {
        $("#HomeMenu_NewSCH").parent().hide()
        $("#OverviewMenu_NewSCH").parent().hide()
        $("#Timecard_NewSCH").parent().hide()
        $("#Schedule_NewSCH").parent().hide()
        $("#ScheduleCover_NewSCH").parent().hide()
        $("#Accrual_NewSCH").parent().hide()
        $("#Availability_NewSCH").parent().hide()
        $("#Messages_NewSCH").parent().hide()
        $("#Transactions_NewSCH").parent().hide()
        $("#TimecardNote_NewSCH").parent().hide()
    }
    else {
        $("#HomeMenu_NewSCH").parent().show()
        $("#OverviewMenu_NewSCH").parent().show()
        $("#Timecard_NewSCH").parent().show()
        $("#Schedule_NewSCH").parent().show()
        $("#ScheduleCover_NewSCH").parent().show()
        $("#Accrual_NewSCH").parent().show()
        $("#Availability_NewSCH").parent().show()
        $("#Messages_NewSCH").parent().show()
        $("#Transactions_NewSCH").parent().show()
        $("#TimecardNote_NewSCH").parent().show()
    }
    if ($("#bDisableCECSWAP").val() == 1) {
        $("#HomeMenu_NewSWAP").parent().hide()
        $("#OverviewMenu_NewSWAP").parent().hide()
        $("#Timecard_NewSWAP").parent().hide()
        $("#Schedule_NewSWAP").parent().hide()
        $("#ScheduleCover_NewSWAP").parent().hide()
        $("#Accrual_NewSWAP").parent().hide()
        $("#Availability_NewSWAP").parent().hide()
        $("#Messages_NewSWAP").parent().hide()
        $("#Transactions_NewSWAP").parent().hide()
        $("#TimecardNote_NewSWAP").parent().hide()
    }
    else {
        $("#HomeMenu_NewSWAP").parent().show()
        $("#OverviewMenu_NewSWAP").parent().show()
        $("#Timecard_NewSWAP").parent().show()
        $("#Schedule_NewSWAP").parent().show()
        $("#ScheduleCover_NewSWAP").parent().show()
        $("#Accrual_NewSWAP").parent().show()
        $("#Availability_NewSWAP").parent().show()
        $("#Messages_NewSWAP").parent().show()
        $("#Transactions_NewSWAP").parent().show()
        $("#TimecardNote_NewSWAP").parent().show()
    }
    if ($("#bDisableCEC").val() == 1) {
        $("#HomeMenu_Note").parent().hide()
        $("#OverviewMenu_Note").parent().hide()
        $("#Timecard_Note").parent().hide()
        $("#Schedule_Note").parent().hide()
        $("#ScheduleCover_Note").parent().hide()
        $("#Accrual_Note").parent().hide()
        $("#Availability_Note").parent().hide()
        $("#Messages_Note").parent().hide()
        $("#Transactions_Note").parent().hide()
        $("#TimecardNote_Note").parent().hide()
    }
    else {
        $("#HomeMenu_Note").parent().show()
        $("#OverviewMenu_Note").parent().show()
        $("#Timecard_Note").parent().show()
        $("#Schedule_Note").parent().show()
        $("#ScheduleCover_Note").parent().show()
        $("#Accrual_Note").parent().show()
        $("#Availability_Note").parent().show()
        $("#Messages_Note").parent().show()
        $("#Transactions_Note").parent().show()
        $("#TimecardNote_Note").parent().show()
    }
    if ($("#bHideCECList").val() == 1) {
        $("#HomeMenu_Messages").parent().hide()
        $("#OverviewMenu_Messages").parent().hide()
        $("#Timecard_Messages").parent().hide()
        $("#Schedule_Messages").parent().hide()
        $("#ScheduleCover_Messages").parent().hide()
        $("#Accrual_Messages").parent().hide()
        $("#Availability_Messages").parent().hide()
        $("#Transactions_Messages").parent().hide()
        $("#TimecardNote_Messages").parent().hide()
    }
    else {
        $("#HomeMenu_Messages").parent().show()
        $("#OverviewMenu_Messages").parent().show()
        $("#Timecard_Messages").parent().show()
        $("#Schedule_Messages").parent().show()
        $("#ScheduleCover_Messages").parent().show()
        $("#Accrual_Messages").parent().show()
        $("#Availability_Messages").parent().show()
        $("#Transactions_Messages").parent().show()
        $("#TimecardNote_Messages").parent().show()
    }
    if ($("#bDisableNote").val() == 1) {
        $("#HomeMenu_TimecardNote").parent().hide()
        $("#OverviewMenu_TimecardNote").parent().hide()
        $("#Timecard_TimecardNote").parent().hide()
        $("#Schedule_TimecardNote").parent().hide()
        $("#ScheduleCover_TimecardNote").parent().hide()
        $("#Accrual_TimecardNote").parent().hide()
        $("#Availability_TimecardNote").parent().hide()
        $("#Transactions_TimecardNote").parent().hide()
        $("#Messages_TimecardNote").parent().hide()
    }
    else {
        $("#HomeMenu_TimecardNote").parent().show()
        $("#OverviewMenu_TimecardNote").parent().show()
        $("#Timecard_TimecardNote").parent().show()
        $("#Schedule_TimecardNote").parent().show()
        $("#ScheduleCover_TimecardNote").parent().show()
        $("#Accrual_TimecardNote").parent().show()
        $("#Availability_TimecardNote").parent().show()
        $("#Transactions_TimecardNote").parent().show()
        $("#Messages_TimecardNote").parent().show()
    }
    if ($("#bMultiEmp").val() == 0) {
        $("#HomeMenu_Logout").parent().hide()
        $("#OverviewMenu_Logout").parent().hide()
        $("#Timecard_Logout").parent().hide()
        $("#Schedule_Logout").parent().hide()
        $("#ScheduleCover_Logout").parent().hide()
        $("#Accrual_Logout").parent().hide()
        $("#Availability_Logout").parent().hide()
        $("#Transactions_Logout").parent().hide()
        $("#Messages_Logout").parent().hide()
    }
    else {
        $("#HomeMenu_Logout").parent().show()
        $("#OverviewMenu_Logout").parent().show()
        $("#Timecard_Logout").parent().show()
        $("#Schedule_Logout").parent().show()
        $("#ScheduleCover_Logout").parent().show()
        $("#Accrual_Logout").parent().show()
        $("#Availability_Logout").parent().show()
        $("#Transactions_Logout").parent().show()
        $("#Messages_Logout").parent().show()
    }
    if (device.platform != 'android' && device.platform != 'Android') {
        $("#HomeMenu_Exit").parent().hide()
        $("#OverviewMenu_Exit").parent().hide()
        $("#Timecard_Exit").parent().hide()
        $("#Schedule_Exit").parent().hide()
        $("#ScheduleCover_Exit").parent().hide()
        $("#Accrual_Exit").parent().hide()
        $("#Availability_Exit").parent().hide()
        $("#Messages_Exit").parent().hide()
        $("#Transactions_Exit").parent().hide()
        $("#HomeIOS").css('display', '')
        $("#OverviewIOS").css('display', '')
        $("#SetupIOS").css('display', '')
        $("#PunchIOS").css('display', '')
        $("#LockoutOverrideIOS").css('display', '')
        $("#LockoutOverrideRequestIOS").css('display', '')
        $("#OTAIOS").css('display', '')
        $("#TimecardIOS").css('display', '')
        $("#TimecardNoteIOS").css('display', '')
        $("#ScheduleIOS").css('display', '')
        $("#ScheduleCoverIOS").css('display', '')
        $("#ScheduleCoverRequestIOS").css('display', '')
        $("#AccrualIOS").css('display', '')
        $("#AvailabilityIOS").css('display', '')
        $("#AvailabilityFormIOS").css('display', '')
        $("#TransactionsIOS").css('display', '')
        $("#MessagesIOS").css('display', '')
        $("#OutgoingMessageIOS").css('display', '')
        $("#DeclineMessageIOS").css('display', '')
        $("#ApproveMessageIOS").css('display', '')
        $("#ReplyMessageIOS").css('display', '')
        $("#AboutIOS").css('display', '')
        $("#LoginIOS").css('display', '')
    }
    else {
        $("#HomeIOS").css('display', 'none')
        $("#OverviewIOS").css('display', 'none')
        $("#SetupIOS").css('display', 'none')
        $("#PunchIOS").css('display', 'none')
        $("#LockoutOverrideIOS").css('display', 'none')
        $("#LockoutOverrideRequestIOS").css('display', 'none')
        $("#OTAIOS").css('display', 'none')
        $("#TimecardIOS").css('display', 'none')
        $("#TimecardNoteIOS").css('display', 'none')
        $("#ScheduleIOS").css('display', 'none')
        $("#ScheduleCoverIOS").css('display', 'none')
        $("#ScheduleCoverRequestIOS").css('display', 'none')
        $("#AccrualIOS").css('display', 'none')
        $("#AvailabilityIOS").css('display', 'none')
        $("#AvailabilityFormIOS").css('display', 'none')
        $("#TransactionsIOS").css('display', 'none')
        $("#MessagesIOS").css('display', 'none')
        $("#OutgoingMessageIOS").css('display', 'none')
        $("#DeclineMessageIOS").css('display', 'none')
        $("#ApproveMessageIOS").css('display', 'none')
        $("#ReplyMessageIOS").css('display', 'none')
        $("#AboutIOS").css('display', 'none')
        $("#LoginIOS").css('display', 'none')
    }
}

function exitButtonClicked() {
    reloadPage = true
    szDialogReturnTo = "#Exit"
    $("#dialogHeader").text("Exit Atlas Mobile")
    $("#YesNoblock").css("display", "")
    $("#Closeblock").css("display", "none")
    $("#dialogMessage").text("Are You Sure You Want To Exit?")
    $.mobile.changePage('#dialogPage', { transition: 'flip' });

}

function doesDomainExist() {
    if ($("#szServerProtocol").val().toLowerCase() == "" || $("#szServerDomain").val().toLowerCase() == "") {
        domainExist = true;
    }
    else {
        if ($("#szServerDomain").val().match(ip) || validDomain() || ($("#szServerDomain").val().toLowerCase() == "localhost")) {
            var url = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx";
            try {
                $.ajax({
                    type: "GET",
                    url: url,
                    crossDomain: true,
                    async: false,
                    success: domainExistSuccess,
                    error: domainExistError
                });
            }
            catch (e) {
                domainExist = false;
            }
        }
        else {
            domainExist = false;
        }
    }
}

function domainExistError(data, status, request) {
    domainExist = false;
}

function domainExistSuccess(data) {
    domainExist = true;
}

function validDomain() {
    var arr = new Array('.com', '.net', '.org', '.biz', '.coop', '.info', '.museum', '.name',
        '.pro', '.edu', '.gov', '.int', '.mil', '.ac', '.ad', '.ae', '.af', '.ag',
        '.ai', '.al', '.am', '.an', '.ao', '.aq', '.ar', '.as', '.at', '.au', '.aw',
        '.az', '.ba', '.bb', '.bd', '.be', '.bf', '.bg', '.bh', '.bi', '.bj', '.bm',
        '.bn', '.bo', '.br', '.bs', '.bt', '.bv', '.bw', '.by', '.bz', '.ca', '.cc',
        '.cd', '.cf', '.cg', '.ch', '.ci', '.ck', '.cl', '.cm', '.cn', '.co', '.cr',
        '.cu', '.cv', '.cx', '.cy', '.cz', '.de', '.dj', '.dk', '.dm', '.do', '.dz',
        '.ec', '.ee', '.eg', '.eh', '.er', '.es', '.et', '.fi', '.fj', '.fk', '.fm',
        '.fo', '.fr', '.ga', '.gd', '.ge', '.gf', '.gg', '.gh', '.gi', '.gl', '.gm',
        '.gn', '.gp', '.gq', '.gr', '.gs', '.gt', '.gu', '.gv', '.gy', '.hk', '.hm',
        '.hn', '.hr', '.ht', '.hu', '.id', '.ie', '.il', '.im', '.in', '.io', '.iq',
        '.ir', '.is', '.it', '.je', '.jm', '.jo', '.jp', '.ke', '.kg', '.kh', '.ki',
        '.km', '.kn', '.kp', '.kr', '.kw', '.ky', '.kz', '.la', '.lb', '.lc', '.li',
        '.lk', '.lr', '.ls', '.lt', '.lu', '.lv', '.ly', '.ma', '.mc', '.md', '.mg',
        '.mh', '.mk', '.ml', '.mm', '.mn', '.mo', '.mp', '.mq', '.mr', '.ms', '.mt',
        '.mu', '.mv', '.mw', '.mx', '.my', '.mz', '.na', '.nc', '.ne', '.nf', '.ng',
        '.ni', '.nl', '.no', '.np', '.nr', '.nu', '.nz', '.om', '.pa', '.pe', '.pf',
        '.pg', '.ph', '.pk', '.pl', '.pm', '.pn', '.pr', '.ps', '.pt', '.pw', '.py',
        '.qa', '.re', '.ro', '.rw', '.ru', '.sa', '.sb', '.sc', '.sd', '.se', '.sg',
        '.sh', '.si', '.sj', '.sk', '.sl', '.sm', '.sn', '.so', '.sr', '.st', '.sv',
        '.sy', '.sz', '.tc', '.td', '.tf', '.tg', '.th', '.tj', '.tk', '.tm', '.tn',
        '.to', '.tp', '.tr', '.tt', '.tv', '.tw', '.tz', '.ua', '.ug', '.uk', '.um',
        '.us', '.uy', '.uz', '.va', '.vc', '.ve', '.vg', '.vi', '.vn', '.vu', '.ws',
        '.wf', '.ye', '.yt', '.yu', '.za', '.zm', '.zw');

    var mai = $("#szServerDomain").val().toLowerCase();
    var val = true;

    var dot = mai.lastIndexOf(".");
    var dname = mai.substring(0, dot);
    var ext = mai.substring(dot, mai.length);
    //alert(ext);

    if (dot > 2 && dot < 57) {
        for (var i = 0; i < arr.length; i++) {
            if (ext == arr[i]) {
                val = true;
                break;
            }
            else {
                val = false;
            }
        }
        if (val == false) {
            return false;
        }
        else {
            for (var j = 0; j < dname.length; j++) {
                var dh = dname.charAt(j);
                var hh = dh.charCodeAt(0);
                if ((hh > 47 && hh < 59) || (hh > 64 && hh < 91) || (hh > 96 && hh < 123) || hh == 45 || hh == 46) {
                    if ((j == 0 || j == dname.length - 1) && hh == 45) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
    }
    else {
        return false;
    }
    return true;
}

function showloader() {
    $.mobile.loading('show', {
        text: "Checking connection",
        textVisible: true,
        theme: "b",
        textonly: false,
        html: ""
    });
}

function hideloader() {
    $.mobile.loading("hide");
}

function loadSLC() {
    clearTimeout(loadPageDelay)
}


function successAddGeoFence() {

}

function errorAddGeoFence(errorCode) {
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
    $("#dialogHeader").text("Geo Location Error")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    $("#dialogMessage").text(errorMessage)
    $.mobile.changePage('#dialogPage', { transition: 'flip' });
}

function displaySQLError(szSQL, err) {
    var errorMessage
    if ($("#bMultiEmp").val() == 1) {
        szDialogReturnTo = "#Login"
    }
    else {
        szDialogReturnTo = "#Home"
    }
    if (szSQL != "") {
        errorMessage = 'An error has occurred.  Please call (623)258-4430 and report this error and allow us to help you. <br/><br/>Error Occurred in the following SQL Statement:'
        errorMessage += '<br/><br/>' + szSQL + "<br/><br/> Error Code: " + err.code + "<br/><br/> Error: " + err.message
    }
    else {
        errorMessage = 'An error has occurred.  Please call (623)258-4430 and report this error and allow us to help you. <br/><br/>'
        errorMessage += "Error Code: " + err.code + "<br/><br/> Error: " + err.message
    }
    $("#dialogHeader").text("Error")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    $("#dialogMessage").text("")
    $("#dialogMessage").html(errorMessage).css("word-wrap", "break-word")
    $.mobile.changePage('#dialogPage', { transition: 'flip' });

}

function createHeartBeatHeader(szHeartBeatCommand) {

    var szXMLString = makeSoapHeader("HeartBeatMobile", "AtlasClockService/")
    szXMLString += createElementString("szClockSerialNumber", $("#szAuthorization").val())
    szXMLString += createElementNumber("lSLA_SysId", authorizeSLA_SysId)
    szXMLString += createElementNumber("lCEM_SysId", authorizeCEM_SysId)
    szXMLString += createElementString("lSDV_SysId", authorizeSDV_SysId)
    szXMLString += createElementString("lPhoneDate", clarionToday())
    szXMLString += createElementString("lPhoneTime", clarionClock())
    szXMLString += createElementString("szHeartBeatCommand", szHeartBeatCommand)
    szXMLString += makeSoapFooter("HeartBeatMobile")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/HeartBeatMobile"
    return {
        szXMLString: szXMLString,
        szURL: szURL
    }
}

function punchWebService(pRequestXML, pszURL, szCommand) {
    $.ajax({
        type: "POST",
        url: pszURL,
        dataType: "xml",
        data: pRequestXML,
        processData: false,
        crossDomain: true,
        async: true,
        success: function (data) {

            var sqlStatement
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            slcResponse = XMLToString(data)
            switch ($(slcResponse).find("Action")[0].innerHTML) {
                case "DATA UPDATE CONFIGURATION":
                    slcAction = $(slcResponse).find("Action")[0].innerHTML
                    if (slcAction == "DATA UPDATE CONFIGURATION") {
                        zcnServiceResponse = slcResponse
                        db.transaction(updateZCN, errorZCN, null);
                        var currentResponse = zcnServiceResponse
                        for (var i = 0; i < $(currentResponse).find("TCzcn").length; i++) {
                            var TCzcnRecord = $(currentResponse).find("TCzcn")[i];
                            $('#zcn_bMinOutDuration').val($(TCzcnRecord).attr('bMinOutDuration'))
                            $('#bForceTransfer').val($(TCzcnRecord).attr('bForceTransfer'))
                            $("#zcn_bDepRequired").val($(TCzcnRecord).attr('bDepRequired'))
                            $('#zcn_bJobRequired').val($(TCzcnRecord).attr('bJobRequired'))
                            $('#zcn_bTaskRequired').val($(TCzcnRecord).attr('bTaskRequired'))
                            $('#zcn_bNoGeoPunch').val($(TCzcnRecord).attr('bNoGeoPunch'))
                            $('#zcn_bGeofenceLockout').val($(TCzcnRecord).attr('bGeofenceLockout'))
                        }
                        PunchRetreiveTCzem()
                    }
                    else {
                        sqlStatement = 'SELECT * FROM TCzcn'
                        db.transaction(function (tx) {
                            tx.executeSql(sqlStatement, null, loadZCNFromDB, function errorSelectzcn(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        })
                    }
                    break;
                case "DATA UPDATE USER":
                    slcAction = $(slcResponse).find("Action")[0].innerHTML
                    if (slcAction == "DATA UPDATE USER") {
                        zemServiceResponse = slcResponse
                        db.transaction(deleteAndLoadEmployee, errorZEM, null);
                        var currentResponse = zemServiceResponse
                        for (var i = 0; i < $(currentResponse).find("TCzem").length; i++) {
                            var TCzemRecord = $(currentResponse).find("TCzem")[i];
                            $('#zem_bDisableClockOut').val($(TCzemRecord).attr('bDisableClockOut'))
                            $('#zem_szLastPunchType').val($(TCzemRecord).attr('szLastPunchType'))
                            $('#zem_lLastPunchDate').val($(TCzemRecord).attr('lLastPunchDate'))
                            $('#zem_lLastPunchTime').val($(TCzemRecord).attr('lLastPunchTime'))
                            $('#zem_szLastPunchDepartment').val($(TCzemRecord).attr('szLastPunchDepartment'))
                            $('#zem_szLastPunchJob').val($(TCzemRecord).attr('szLastPunchJob'))
                            $('#zem_szLastPunchTask').val($(TCzemRecord).attr('szLastPunchTask'))
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
                    else {
                        sqlStatement = 'SELECT * FROM TCzem'
                        db.transaction(function (tx) {
                            tx.executeSql(sqlStatement, null, loadZEMFromDB, function errorSelectZEM(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        })
                    }
                    break;
                case "DATA UPDATE EMPLOYEE LOCKOUT":
                    slcAction = $(slcResponse).find("Action")[0].innerHTML
                    if (slcAction == "DATA UPDATE EMPLOYEE LOCKOUT") {
                        zlcServiceResponse = slcResponse
                        db.transaction(deleteAndLoadLockout, errorZLC, null);
                        var currentResponse = zlcServiceResponse
                        if ($(currentResponse).find("TCzlc").length > 0) {
                            $('#zlc_szStatus').val("true")
                            for (var i = 0; i < $(currentResponse).find("TCzlc").length; i++) {
                                var TCzlcRecord = $(currentResponse).find("TCzlc")[i];
                                if ($(TCzlcRecord).attr('lDate') == clarionToday()) {
                                    if (clarionClock() >= $(TCzlcRecord).attr('lBeginTime') && clarionClock() <= $(TCzlcRecord).attr('lEndTime')) {
                                        $('#zlc_szStatus').val("false")
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            $('#zlc_szStatus').val("false")
                        }
                        setupPunchWindow(2)
                    }
                    else {
                        sqlStatement = 'SELECT * FROM TCzlc where lDate = ' + clarionToday()
                        db.transaction(function (tx) {
                            tx.executeSql(sqlStatement, null, loadZLCFromDB, function errorSelectZLC(tx, err) {
                                displaySQLError(sqlStatement, err)
                            })
                        })
                    }
                    break;
            }

        },
        error: function () {
            var sqlStatement = ""
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            switch (szCommand) {
                case "DATA UPDATE CONFIGURATION":
                    sqlStatement = 'SELECT * FROM TCzcn'
                    db.transaction(function (tx) {
                        tx.executeSql(sqlStatement, null, loadZCNFromDB, function errorSelectZCN(tx, err) {
                            displaySQLError(sqlStatement, err)
                        })
                    })
                    break;
                case "DATA UPDATE USER":
                    sqlStatement = 'SELECT * FROM TCzem'
                    db.transaction(function (tx) {
                        tx.executeSql(sqlStatement, null, loadZEMFromDB, function errorSelectZEN(tx, err) {
                            displaySQLError(sqlStatement, err)
                        })
                    })
                    break;
                case "DATA UPDATE EMPLOYEE LOCKOUT":
                    sqlStatement = 'SELECT * FROM TCzlc where lDate = ' + clarionToday()
                    db.transaction(function (tx) {
                        tx.executeSql(sqlStatement, null, loadZLCFromDB, function errorSelectZLC(tx, err) {
                            displaySQLError(sqlStatement, err)
                        })
                    })
                    break;
            }
        }
    })
}

function fullUpdatehWebService(pRequestXML, pszURL, szCommand) {
    if (fullUpdate == false) {
        return
    }
    $.ajax({
        type: "POST",
        url: pszURL,
        dataType: "xml",
        data: pRequestXML,
        processData: false,
        crossDomain: true,
        async: true,
        success: function (data) {
            var returnedXML, ServiceResponse1
            if (!db) {
                db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
            }
            returnedXML = XMLToString(data)
            ServiceResponse1 = returnedXML
            var heartBeatHeader = ""
            switch ($(returnedXML).find("Action")[0].innerHTML) {
                case "DATA UPDATE CONFIGURATION":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zcnServiceResponse = ServiceResponse1
                        db.transaction(updateZCN, function errorupdateZCN(tx, err) {
                            displaySQLError("updateZCN", err)
                        }, null);
                        zshServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE SCHEDULE")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE SCHEDULE")
                    }
                    break;
                case "DATA UPDATE EMPLOYEE SCHEDULE":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zshServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadSchedule, errorZSH, null);
                        if ($("#bHideSHCList").val() == 0) {
                            zscServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE SCHEDULE COVER")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE SCHEDULE COVER")
                        }
                        else {
                            zvlServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE VALID LOCATION")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE VALID LOCATION")
                        }
                    }
                    break;
                case "DATA UPDATE EMPLOYEE SCHEDULE COVER":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zscServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadScheduleCover, errorZSC, null);
                        zvlServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE VALID LOCATION")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE VALID LOCATION")
                    }
                    break;
                case "DATA UPDATE VALID LOCATION":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zvlServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadValidLocation, errorZVL, null);
                        zeaServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE ACCRUALTOTAL")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE ACCRUALTOTAL")
                    }
                    break;
                case "DATA UPDATE ACCRUALTOTAL":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zeaServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadAccrual, errorZEA, null);
                        ztsServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE TIMECARD")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE TIMECARD")
                    }
                    break;
                case "DATA UPDATE TIMECARD":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        ztsServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadTimecard, errorZTS, null);
                        zemServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE USER")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE USER")
                    }
                    break;
                case "DATA UPDATE USER":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zemServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadEmployee, errorZEM, null);
                        zecServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE MESSAGES")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE MESSAGES")
                    }
                    break;
                case "DATA UPDATE MESSAGES":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zecServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadMessages, errorZEC, null);
                        zlcServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE LOCKOUT")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE LOCKOUT")
                    }
                    break;
                case "DATA UPDATE EMPLOYEE LOCKOUT":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zlcServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadLockout, errorZLC, null);
                        zoaServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE OTHER ACTIVITY")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE OTHER ACTIVITY")
                    }
                    break;
                case "DATA UPDATE OTHER ACTIVITY":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zoaServiceResponse = ServiceResponse1
                        db.transaction(processZOA, errorZOA, null);
                        zdpServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE DEPT")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE DEPT")
                    }
                    break;
                case "DATA UPDATE DEPT":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zdpServiceResponse = ServiceResponse1
                        db.transaction(processZDP, errorZDP, null);
                        zajServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE JOB")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE JOB")
                    }
                    break;
                case "DATA UPDATE JOB":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zajServiceResponse = ServiceResponse1
                        db.transaction(processZAJ, errorZAJ, null);
                        zatServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE TASK")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE TASK")
                    }
                    break;
                case "DATA UPDATE TASK":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zatServiceResponse = ServiceResponse1
                        db.transaction(processZAT, errorZAT, null);
                        if ($("#bDisableCECSWAP").val() != 1) {
                            swpServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE SWAPLIST")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE SWAPLIST")
                        }
                        else {
                            if ($("#bAllowGrpPunch").val() == 1) {
                                zgpServiceResponse = ""
                                heartBeatHeader = createHeartBeatHeader("DATA UPDATE GROUP PUNCH")
                                szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                                fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE GROUP PUNCH")
                            }
                            else {
                                zavServiceResponse = ""
                                heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                                szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                                fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                            }
                        }
                    }
                    break;
                case "DATA UPDATE SWAPLIST":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        swpServiceResponse = ServiceResponse1
                        db.transaction(processSWP, errorSWP, null);
                        if ($("#bAllowGrpPunch").val() == 1) {
                            zgpServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE GROUP PUNCH")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE GROUP PUNCH")

                        }
                        else {
                            zavServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                        }
                    }
                    break;
                case "DATA UPDATE GROUP PUNCH":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zgpServiceResponse = ServiceResponse1
                        db.transaction(processZGP, errorZGP, null);                         
                        zavServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                        szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                    }
                    break;
                case "DATA UPDATE AVAILABILITY":
                    if (szLastFullUpdateCommand != $(returnedXML).find("Action")[0].innerHTML) {
                        zavServiceResponse = ServiceResponse1
                        db.transaction(deleteAndLoadAvailability, errorZAV, null);
                        zlgServiceResponse = ""
                        if ($("#bMultiEmp").val() != 1) {
                            $.mobile.loading("hide");
                            szLastFullUpdateCommand = ""
                            mycount = 0
                            fullUpdate = false
                            setupMenuRetreiveTCzcn()
                        }
                        else {
                            zlgServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE LOGIN")
                            szLastFullUpdateCommand = $(returnedXML).find("Action")[0].innerHTML
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE LOGIN")
                        }
                    }
                    break;
                case "DATA UPDATE LOGIN":
                    zlgServiceResponse = ServiceResponse1
                    db.transaction(processZLG, errorZLG, null);
                    $.mobile.loading("hide");
                    szLastFullUpdateCommand = ""
                    mycount = 0
                    fullUpdate = false
                    setupMenuRetreiveTCzcn()
                    break;
            }
        },
        error: function (jqXHR, textStatus) {
            if (textStatus === 'timeout' || textStatus === "parsererror" || textStatus === "error") {
                switch (szCommand) {
                    case "DATA UPDATE CONFIGURATION":
                        zshServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE SCHEDULE")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE SCHEDULE")
                        break;
                    case "DATA UPDATE EMPLOYEE SCHEDULE":
                        if ($("#bHideSHCList").val() == 0) {
                            zscServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE SCHEDULE COVER")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE SCHEDULE COVER")
                        }
                        else {
                            zvlServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE VALID LOCATION")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE VALID LOCATION")
                        }
                        break;
                    case "DATA UPDATE EMPLOYEE SCHEDULE COVER":
                        zvlServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE VALID LOCATION")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE VALID LOCATION")
                        break;
                    case "DATA UPDATE VALID LOCATION":
                        zeaServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE ACCRUALTOTAL")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE ACCRUALTOTAL")
                        break;
                    case "DATA UPDATE ACCRUALTOTAL":
                        ztsServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE TIMECARD")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE TIMECARD")
                        break;
                    case "DATA UPDATE TIMECARD":
                        zemServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE USER")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE USER")
                        break;
                    case "DATA UPDATE USER":
                        zecServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE MESSAGES")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE MESSAGES")
                        break;
                    case "DATA UPDATE MESSAGES":
                        zlcServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE EMPLOYEE LOCKOUT")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE EMPLOYEE LOCKOUT")
                        break;
                    case "DATA UPDATE EMPLOYEE LOCKOUT":
                        zoaServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE OTHER ACTIVITY")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE OTHER ACTIVITY")
                        break;
                    case "DATA UPDATE OTHER ACTIVITY":
                        zdpServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE DEPT")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE DEPT")
                        break;
                    case "DATA UPDATE DEPT":
                        zajServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE JOB")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE JOB")
                        break;
                    case "DATA UPDATE JOB":
                        zatServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE TASK")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE TASK")
                        break;
                    case "DATA UPDATE TASK":
                        if ($("#bDisableCECSWAP").val() != 1) {
                            swpServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE SWAPLIST")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE SWAPLIST")
                        }
                        else {
                            if ($("#bAllowGrpPunch").val() == 1) {
                                zgpServiceResponse = ""
                                heartBeatHeader = createHeartBeatHeader("DATA UPDATE GROUP PUNCH")
                                fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE GROUP PUNCH")
                            }
                            else {
                                zavServiceResponse = ""
                                heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                                fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                            }
                        }
                        break;
                    case "DATA UPDATE SWAPLIST":
                        if ($("#bAllowGrpPunch").val() == 1) {
                            zgpServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE GROUP PUNCH")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE GROUP PUNCH")
                        }
                        else {
                            zavServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                        }
                        break;
                    case "DATA UPDATE GROUP PUNCH":
                        zavServiceResponse = ""
                        heartBeatHeader = createHeartBeatHeader("DATA UPDATE AVAILABILITY")
                        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE AVAILABILITY")
                    case "DATA UPDATE AVAILABILITY":
                        zlgServiceResponse = ""
                        if ($("#bMultiEmp").val() != 1) {
                            $.mobile.loading("hide");
                            szLastFullUpdateCommand = ""
                            setupMenuRetreiveTCzcn()
                        }
                        else {
                            zlgServiceResponse = ""
                            heartBeatHeader = createHeartBeatHeader("DATA UPDATE LOGIN")
                            fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE LOGIN")
                        }
                        break;
                    case "DATA UPDATE LOGIN":
                        $.mobile.loading("hide");
                        szLastFullUpdateCommand = ""
                        setupMenuRetreiveTCzcn()
                        break;
                }
            }
            else {
                $.mobile.loading("hide");
                setupMenuRetreiveTCzcn()
                //var error = {
                //    code: "",
                //    message: ""
                //}
                //displaySQLError(szCommand + " Caused the Following Error: " + textStatus, error)
            }
        }
    })
}

function resultsToArray(passedResults) {
    if (device.platform == 'android' || device.platform == 'Android') {
        return passedResults
    }
    else {
        var rows = [];
        for (i = 0; i < passedResults.length; i++) {
            rows.push(passedResults.item(i));
        }
        return rows
    }
}