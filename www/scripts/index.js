
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    window.addEventListener("orientationchange", onOrientationChange.bind(this), false);


    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener("backbutton", onBackKeyDown, false);
        //$.mobile.page.prototype.options.theme = "c";
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //alert("fadi")
        // Set Font Scale to 100% based on device font size
        try {
            MobileAccessibility.setTextZoom(100);
        }
        catch (e) {

        }

        try {
            cordova.plugins.backgroundMode.enable();
        }
        catch (e) {

        }

        try {
            cordova.plugins.backgroundMode.setDefaults({
                title: "Infinitime Atlas Mobile",
                ticker: "",
                text: ""
            })
        }
        catch (e) {

        }


        //try {
        //     cordova.plugins.backgroundMode.configure({
        //        silent: true
        //    });
        //  }
        // catch (e) {
        // }
        try {
            szUUID = device.uuid
        }
        catch (e) {

        }


        if (!authorizeSLA_SysId) {
            authorizeSLA_SysId = 0
        }
        if (!authorizeCEM_SysId) {
            authorizeCEM_SysId = 0
        }

        setPushServices();

        bgGeo = BackgroundGeolocation
        bgGeo.onGeofence(function (params, taskId) {
            try {
                if ($("#bGeoAutoPunch").val() == 1 && $("#szLastPunchType").val() == "Clock In") {
                    if (geoFenceStatus != params.action) {

                        if (params.action == "EXIT") {
                            autoPunchExit(params.identifier)
                        }
                        else {
                            autoPunchEnter(params.identifier)
                        }
                    }
                }
                geoFenceStatus = params.action;
                geoFenceId = params.identifier
            } catch (e) {
                alert('An error occurred in my application code', e);
            }
            // The plugin runs your callback in a background-thread:
            // you MUST signal to the native plugin when your callback is finished so it can halt the thread.
            // IF YOU DON'T, iOS WILL KILL YOUR APP
            if (device.platform == 'android' || device.platform == 'Android') { } else {
                bgGeo.finish(taskId);
            }

        });

        bgGeo.ready(
            {
                desiredAccuracy: 0,
                distanceFilter: 50,
                forceReloadOnGeofence: true,
                startOnBoot: true,
                stopOnTerminate: false
            },
            function () {
                bgGeo.start();
            }, null
        );

        if (!bReloadPage) {
            bReloadPage = true;
        }

        if (!szDialogReturnTo) {
            szDialogReturnTo = ""
        }

        $("#MessageTab").tabs();
        $("#TransactionsTab").tabs();

        $("#szServerProtocol").selectmenu()


        $(document).on("panelbeforeopen", function (e, ui) {
            setupMenuRetreiveTCzcn();
        });

        $("#szServerProtocol").bind("change", function (event, ui) {
            if ($("#szServerProtocol").val() == "HTTP") {
                $("#lServerPort").val(80)
            }
            else {
                $("#lServerPort").val(443)
            }
        });

        // wire Click Function for the Save Setup
        $("#saveSetup").click(function () {
            if (saveSetupClicked() == true) {
                saveSetupWindowClicked = true
                db.transaction(saveZCN, errorSaveZCN, null)
            }
        });

        // wire Click Function for the Cancel Setup
        $("#cancelSetup").click(function () {
            cancelSetupClicked();
        });

        // Process Code when Page is selected
        $(document).on("pagecontainerbeforechange", function (event, data) {
            var toPage = data.toPage
            var absUrl = data.absUrl ? $.mobile.path.parseUrl(data.absUrl).hash.split("#")[1] : "";
            if (typeof toPage == "object" && absUrl != "Setup") {
                setupHeader();
            }
            else {
                if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
                    setupHeader();
                }
            }
            //if (typeof toPage == "object" && (absUrl == "Home" || absUrl == "Schedule" || absUrl == "Accrual" || absUrl == "Timecard" || absUrl == "TimecardNote" ||
            //                                  absUrl == "Overview" || absUrl == "Punch" || absUrl == "OTA")) {
            //szTabSelected = ''
            //}
            if (typeof toPage == "object") {
                if (absUrl != "Timecard" && absUrl != "dialogPage") {
                    TimeCarredProccessCalled = false
                }
                if (absUrl != "OutgoingMessage") {
                    szTabSelected = ''
                }
                switch (absUrl) {
                    case "Setup":
                        if (bReloadPage == true) {
                            if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
                                db.transaction(loadZCN_NoAuth, function errorInser(tx, err) {
                                    displaySQLError("loadZCN_NoAuth", err)
                                }, null)
                            }
                        }
                        else {
                            bReloadPage = true
                        }
                        break;
                    case "Login":
                        if (bReloadPage == true) {
                            $("#szLoginClockId").val("")
                            $("#szLoginClockPassword").val("")
                            deleteUserData()
                        }
                        else {
                            bReloadPage = true
                        }
                        break;
                    case "Schedule":
                        heartBeat("DATA UPDATE EMPLOYEE SCHEDULE")
                        db.transaction(checkZSHJobCount, errorZSH, null)
                        break;
                    case "ScheduleCover":
                        heartBeat("DATA UPDATE EMPLOYEE SCHEDULE COVER")
                        db.transaction(loadZSC, errorZSC, null)
                        break;
                    case "Accrual":
                        heartBeat("DATA UPDATE ACCRUALTOTAL")
                        db.transaction(checkTimeBaseCount, errorZEA, null)
                        break;
                    case "Availability":
                        heartBeat("DATA UPDATE AVAILABILITY")
                        db.transaction(loadAvailability, errorZAV, null)
                        break;
                    case "Timecard":
                        if (TimeCarredProccessCalled == false) {
                            processTransactions()
                            TimeCarredProccessCalled = true
                        }
                        heartBeat("DATA UPDATE TIMECARD")
                        db.transaction(checkZTSReviewdCount, errorZTS, null)
                        break;
                    case "Overview":
                        heartBeat("DATA UPDATE USER")
                        db.transaction(loadZEM_NoAuth, errorZEM, null)
                        break;
                    case "Messages":
                        heartBeat("DATA UPDATE MESSAGES")
                        db.transaction(loadMessages, errorZEO, null)
                        break;
                    case "Transactions":
                        db.transaction(loadTransactions, errorZTR, null);
                        break;
                    case "OutgoingMessage":
                        if (bReloadPage == true) {
                            loadSWP()
                            //setupOutgoingMessage()
                        }
                        else {
                            bReloadPage = true
                        }
                        break;
                    case "OTA":
                        if (bReloadPage == true) {
                            szPunchType = "OTA"
                            loadDepJobAskOTA();
                        }
                        else {
                            bReloadPage == true
                        }
                        break;
                    case "About":
                        fillPluginGeoLocation()
                        break;
                    case "Punch":
                        break;
                    default:
                        break;
                }
            }
        });

        // Process Code After Page is Loaded
        $(document).on("pagecontainerchange", function (event, data) {
            var toPage = data.toPage
            var absUrl = data.absUrl ? $.mobile.path.parseUrl(data.absUrl).hash.split("#")[1] : "";
            if (typeof toPage == "object") {
                switch (absUrl) {
                    case "Setup":
                        if (szTabSelected == 'SetupServerInfo') {
                            $("#SetupTab").tabs("option", "active", 1);
                            $("#SetupUserInfoTab").removeClass("ui-btn-active")
                            $("#SetupServerInfoTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                        }
                        else {
                            $("#SetupTab").tabs("option", "active", 0);
                            $("#SetupServerInfoTab").removeClass("ui-btn-active")
                            $("#SetupUserInfoTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                        }
                        break;
                    case "Messages":
                        if (szTabSelected == 'Outgoing') {
                            $("#MessageTab").tabs("option", "active", 1);
                            $("#IncomingTab").removeClass("ui-btn-active")
                            $("#OutgoingTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                        }
                        else {
                            $("#MessageTab").tabs("option", "active", 0);
                            $("#OutgoingTab").removeClass("ui-btn-active")
                            $("#IncomingTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                        }
                        break;
                    case "Transactions":
                        if (szTabSelected == 'SentTransactions') {
                            $("#TransactionsTab").tabs("option", "active", 2);
                            $("#FailedTab").removeClass("ui-btn-active")
                            $("#PendingTab").removeClass("ui-btn-active")
                            $("#SentTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                            $("#ResendFailed").css('display', 'none')
                        }
                        else if (szTabSelected == 'PendingTransactions') {
                            $("#TransactionsTab").tabs("option", "active", 0);
                            $("#FailedTab").removeClass("ui-btn-active")
                            $("#SentTab").removeClass("ui-btn-active")
                            $("#PendingTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                            $("#ResendFailed").css('display', 'none')
                        }
                        else {
                            $("#TransactionsTab").tabs("option", "active", 1);
                            $("#SentTab").removeClass("ui-btn-active")
                            $("#FailedTab").removeClass("ui-btn-active").addClass("ui-btn-active");
                            $("#ResendFailed").css('display', '')
                        }
                        break;
                    case "OutgoingMessage":
                        setupOutgoingMessage()
                        if (szNewMessageType == 'View') {
                            $("#replyOutgoingMessage").closest('.ui-btn').hide();
                            $("#saveOutgoingMessage").closest('.ui-btn').hide();
                            $("#cancelOutgoingMessage").closest('.ui-btn').hide();
                            $("#closeOutgoingMessage").closest('.ui-btn').hide();
                            $("#approveOutgoingMessage").closest('.ui-btn').hide();
                            $("#declineOutgoingMessage").closest('.ui-btn').hide();
                            if ($("#szMessageType").val() == 'Note') {
                                if (szTabSelected == 'Outgoing') {
                                    $("#closeOutgoingMessage").closest('.ui-btn').show();
                                }
                                else {
                                    $("#replyOutgoingMessage").closest('.ui-btn').show();
                                    $("#closeOutgoingMessage").closest('.ui-btn').show();
                                }
                            }
                            else {
                                if (szTabSelected == 'Outgoing') {
                                    $("#closeOutgoingMessage").closest('.ui-btn').show();
                                }
                                else {
                                    $("#closeOutgoingMessage").closest('.ui-btn').show();
                                    if ($("#szRequestApproved").val() == 'Approved') {
                                        $("#declineOutgoingMessage").closest('.ui-btn').show();
                                    }
                                    else if ($("#szRequestApproved").val() == 'Decline') {
                                        $("#approveOutgoingMessage").closest('.ui-btn').show();
                                    }
                                    else if ($("#szRequestStatus").val() == "Approved") {
                                        $("#declineOutgoingMessage").closest('.ui-btn').show();
                                    }
                                    else if ($("#szRequestStatus").val() == "Decline") {
                                        $("#approveOutgoingMessage").closest('.ui-btn').show();
                                    }
                                    else {
                                        $("#approveOutgoingMessage").closest('.ui-btn').show();
                                        $("#declineOutgoingMessage").closest('.ui-btn').show();
                                        $("#declineOutgoingMessage").css('marginLeft', 100);
                                    }
                                }
                            }
                        }
                        else {
                            if ($("#szMessageType").val() != 'Note') {
                                $("#lDateRequestFrom").val(sqlToday())
                                $("#lDateRequestTo").val(sqlToday())
                                $('#lTimeRequestFrom').val('')
                                $('#lTimeRequestTo').val('')
                                $('nDailyOTAHours').val('')
                                if ($("#szMessageType").val() == 'Schedule Change Request') {
                                    $('#lTimeRequestFrom').val('08:00:00')
                                    $('#lTimeRequestTo').val('16:00:00')
                                    $('nDailyOTAHours').val('0.00')
                                }
                            }
                        }
                        break;
                    case "OTA":
                        if (bReloadPage == true) {
                            setupOTAwindow()
                        }
                        else {
                            bReloadPage = true
                        }
                        break;
                    case "LockoutOverride":
                        if (bReloadPage == true) {
                            //setupOTAwindow()
                        }
                        else {
                            bReloadPage = true
                        }
                        break;
                    case "Home":
                        if (fullUpdate == true) {
                            $.mobile.loading('show', {
                                text: $.mobile.loader.prototype.options.text,
                                textVisible: $.mobile.loader.prototype.options.textVisible,
                                theme: $.mobile.loader.prototype.options.theme,
                                textonly: false,
                                html: ""
                            })
                        }
                    case "dialogPage":
                        //setFocusField();
                        break;
                }
            }
        });

        // Process Code when Setup Tab Changes
        $('#SetupTab').on("tabsactivate", function (event, data) {
            if ($("#SetupTab .ui-tabs-panel:visible").attr("id") == 'SetupUserInfo') {
                szTabSelected = 'SetupUserInfo'
            }
            else {
                szTabSelected = 'SetupServerInfo'
            }
        });

        // Process Code when Message Tab Changes
        $('#MessageTab').on("tabsactivate", function (event, data) {
            if ($("#MessageTab .ui-tabs-panel:visible").attr("id") == 'Incoming') {
                szTabSelected = 'Incoming'
            }
            else {
                szTabSelected = 'Outgoing'
            }
        });

        // Process Code when Transactions Tab Changes
        $('#TransactionsTab').on("tabsactivate", function (event, data) {
            if ($("#TransactionsTab .ui-tabs-panel:visible").attr("id") == 'PendingTransactions') {
                szTabSelected = 'PendingTransactions'
                $("#ResendFailed").css('display', 'none')

            }
            else if ($("#TransactionsTab .ui-tabs-panel:visible").attr("id") == 'FailedTransactions') {
                szTabSelected = 'FailedTransactions'
                $("#ResendFailed").css('display', '')
            }
            else {
                szTabSelected = 'SentTransactions'
                $("#ResendFailed").css('display', 'none')
            }
        });

        // Set  Punch based on Menu Clikced
        $("#Home_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#Timecard_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#TimecardNote_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#Schedule_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#Accrual_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#Availability_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });

        $("#Messages_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });
        $("#Transactions_Punch").click(function () {
            if ($("#bForceTransfer").val() == 1) {
                if ($("#zdp_lCount").val() > 1 || $("#zaj_lCount").val() > 1 || $("#zat_lCount").val() > 1) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
                }
            }
            szPunchType = "Punch"
            PunchRetreiveTCzcn()
        });

        // Set  Group Punch based on Menu Clikced
        $("#Home_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Timecard_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#TimecardNote_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Schedule_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Accrual_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Availability_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Messages_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });
        $("#Transactions_GroupPunch").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "GroupPunch"
            PunchRetreiveTCzcn()
        });


        // Set  Transfer based on Menu Clikced
        $("#Home_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Timecard_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#TimecardNote_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Schedule_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Accrual_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Availability_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Messages_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });
        $("#Transactions_Transfer").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Punch")
            szPunchType = "Transfer"
            PunchRetreiveTCzcn()
        });


        //wire Click function for exit window
        $("#HomeMenu_Exit").click(function () {
            exitButtonClicked()
        });

        $("#OverviewMenu_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Timecard_Exit").click(function () {
            exitButtonClicked()
        });

        $("#TimecardNote_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Schedule_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Accrual_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Availability_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Messages_Exit").click(function () {
            exitButtonClicked()
        });

        $("#Transactions_Exit").click(function () {
            exitButtonClicked()
        });

        // wire Click Function for the Save Lockout Override window
        $("#saveLockoutOverride").click(function () {
            validateLockoutOverride()
        });

        // wire Click Function for the Cancel Lockout Override window
        $("#cancelLockoutOverride").click(function () {
            cancelLockoutOverride();
        });

        // wire Click Function for the Save Lockout Override window
        $("#saveLockoutOverrideRequest").click(function () {
            callLockoutOverride()
        });

        // wire Click Function for the Cancel Lockout Override window
        $("#cancelLockoutOverrideRequest").click(function () {
            cancelLockoutOverride();
        });

        // wire New Selection on Dept. dropdown on transfer window
        $("#szZDPSelect").change(function () {
            bReloadPage = false
            if ($("#szZDPSelect").val() > 0) {
                setDepartmentNumber()
                $('#szZDPSelect').selectmenu("refresh")
            }
            else {
                $('#szZDPSelect').selectmenu("refresh")
            }
        });

        // wire New Selection on Job dropdown on transfer window
        $("#szZAJSelect").change(function () {
            bReloadPage = false
            if ($("#szZAJSelect").val() > 0) {
                setJobNumber()
                $('#szZAJSelect').selectmenu("refresh")
            }
            else {
                $('#szZAJSelect').selectmenu("refresh")
            }
        });

        // wire New Selection on Task dropdown on transfer window
        $("#szZATSelect").change(function () {
            bReloadPage = false
            if ($("#szZATSelect").val() > 0) {
                setTaskNumber()
                $('#szZATSelect').selectmenu("refresh")
            }
            else {
                $('#szZATSelect').selectmenu("refresh")
            }
        });

        // wire New Selection on OTA Dept. dropdown on transfer window
        $("#szZDPSelectOTA").change(function () {
            bReloadPage = false
            if ($("#szZDPSelectOTA").val() > 0) {
                setDepartmentNumber()
                $('#szZDPSelectOTA').selectmenu("refresh")
            }
            else {
                $('#szZDPSelectOTA').selectmenu("refresh")
            }
        });

        // wire New Selection on OTA Job dropdown on transfer window
        $("#szZAJSelectOTA").change(function () {
            bReloadPage = false
            if ($("#szZAJSelectOTA").val() > 0) {
                setJobNumber()
                $('#szZAJSelectOTA').selectmenu("refresh")
            }
            else {
                $('#szZAJSelectOTA').selectmenu("refresh")
            }
        });


        // wire New Selection on OTA Task dropdown on transfer window
        $("#szZATSelectOTA").change(function () {
            bReloadPage = false
            if ($("#szZATSelectOTA").val() > 0) {
                setTaskNumber()
                $('#szZATSelectOTA').selectmenu("refresh")
            }
            else {
                $('#szZATSelectOTA').selectmenu("refresh")
            }
        });

        // wire Click Function for the Save Punch/Transfer
        $("#savePunch").click(function () {
            if ($('#zcn_bNoGeoPunch').val() == 0) {
                punchRetreiveGeo()
            }
            else {
                createPunchTransaction()
            }
        });

        // wire Click Function for the Cancel Punch/Transfer
        $("#cancelPunch").click(function () {
            cancelPunch();
        });

        // wire Click Function for the Save Availability window
        $("#saveAvailability").click(function () {
            bReloadMessages = true
            if (validateAvailability() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Availability")
            }
        });

        // wire Click Function for the Cancel Availability window
        $("#cancelAvailability").click(function () {
            cancelAvailabilityClicked();
        });


        // Set  Message Type based on Outgoing Message Menu Clikced
        $("#HomeMenu_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Messages_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Accrual_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Availability_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Schedule_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Timecard_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#TimecardNote_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#OTA_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Punch_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#OverviewMenu_Note").click(function () {
            szNewMessageType = "Note"
        });

        $("#Transactions_Note").click(function () {
            szNewMessageType = "Note"
        });


        $("#HomeMenu_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Messages_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Accrual_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Availability_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Schedule_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Timecard_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#TimecardNote_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#OTA_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Punch_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#OverviewMenu_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#Transactions_NewSCH").click(function () {
            szNewMessageType = "Schedule Change Request"
        });

        $("#HomeMenu_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Messages_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Accrual_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Accrual_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Availability_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Timecard_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#TimecardNote_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#OTA_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Punch_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#OverviewMenu_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });

        $("#Transactions_NewSWAP").click(function () {
            szNewMessageType = "Schedule Swap Request"
        });


        $("#HomeMenu_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Messages_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Accrual_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Availability_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Schedule_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Timecard_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#TimecardNote_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#OTA_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Punch_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#OverviewMenu_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#Transactions_NewOTA").click(function () {
            szNewMessageType = "Time Off Request"
        });

        $("#RequestScheduleCover").click(function () {
            retreiveSchedulInformation()
        });

        $("#CoverSchedule").click(function () {
            CoverSchedule()
        });

        $("#DeleteCoverSchedule").click(function () {
            DeleteCoverSchedule()
        });

        // wire Click Function for the Save Outgoing Message
        $("#saveOutgoingMessage").click(function () {
            bReloadMessages = true
            szTabSelected = 'Outgoing'
            if (validateOutgoingMessage() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
            }
        });

        // wire Click Function for the Cancel Outgoing Message
        $("#cancelOutgoingMessage").click(function () {
            szTabSelected = 'Outgoing'
            szDialogReturnTo = "#Messages"
            callCancelDiaglog()
        });

        // wire Click Function for the close Outgoing Message
        $("#closeOutgoingMessage").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
        });

        // wire Click Function for the decline Outgoing Message
        $("#declineOutgoingMessage").click(function () {
            var szMessgae = 'Your ' + $("#szMessageType").val()
            if ($("#szMessageType").val() != 'Schedule Swap Request') {
                if ($("#lDateRequestFrom").val() == $("#lDateRequestTo").val()) {
                    szMessgae += ' on ' + $("#lDateRequestFrom").val() + ' from '
                }
                else {
                    szMessgae += ' for dates between ' + $("#lDateRequestFrom").val() + ' and ' + $("#lDateRequestTo").val() + ' from '
                }
                szMessgae += ' ' + $("#lTimeRequestFrom").val() + ' to ' + $("#lTimeRequestTo").val() + ' has been declined.'
            }
            else {
                szMessgae += ' on ' + $("#lDateRequestFrom").val() + ' has been declined.'
            }
            $("#szDeclineMessageText").val(szMessgae)
            $(":mobile-pagecontainer").pagecontainer("change", "#DeclineMessage")
        });

        // wire Click Function for the Save Declined Message
        $("#saveDeclineMessage").click(function () {
            szTabSelected = 'Outgoing'
            bReloadMessages = true
            if (validateDeclineMessage() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
            }
        });

        // wire Click Function for the Cancel Declined Message
        $("#cancelDeclineMessage").click(function () {
            szTabSelected = 'Incoming'
            szDialogReturnTo = "#Messages"
            callCancelDiaglog()
        });

        // wire Click Function for the Approve Outgoing Message
        $("#approveOutgoingMessage").click(function () {
            $(":mobile-pagecontainer").pagecontainer("change", "#ApproveMessage")
            var szMessgae = 'Your ' + $("#szMessageType").val()
            if ($("#szMessageType").val() != 'Schedule Swap Request') {
                if ($("#lDateRequestFrom").val() == $("#lDateRequestTo").val()) {
                    szMessgae += ' on ' + $("#lDateRequestFrom").val() + ' from '
                }
                else {
                    szMessgae += ' for dates between ' + $("#lDateRequestFrom").val() + ' and ' + $("#lDateRequestTo").val() + ' from '
                }
                szMessgae += ' ' + $("#lTimeRequestFrom").val() + ' to ' + $("#lTimeRequestTo").val() + ' has been approved.'
            }
            else {
                szMessgae += ' on ' + $("#lDateRequestFrom").val() + ' has been approved.'
                $("#ApprovCheckBoxesRow").css('display', 'none')
            }
            $("#szApproveMessageText").val(szMessgae)

            if ($("#szMessageType").val() == 'Schedule Change Request' || $("#szMessageType").val() == 'Schedule Swap Request') {
                $("#szApproveMessageOTARow").css('display', 'none')
                $(":mobile-pagecontainer").pagecontainer("change", "#ApproveMessage")
            }
            else {
                $("#szApproveMessageOTARow").css('display', '')
                setupApproveMessageOTA()
            }
        });

        // wire Click Function for the Save Schedule Approval Message
        $("#saveApproveMessage").click(function () {
            szTabSelected = 'Outgoing'
            bReloadMessages = true
            if (validateApproveMessage() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
            }
        });

        // wire Click Function for the Cancel Schedule Approval Message
        $("#cancelApproveMessage").click(function () {
            szTabSelected = 'Incoming'
            szDialogReturnTo = "#Messages"
            callCancelDiaglog()
        });

        // wire Click Function for the Reply Message
        $("#replyOutgoingMessage").click(function () {
            $("#szReplyMessageType").val($("#szMessageType").val())
            $("#szReplyMessageDescription").val('Re: ' + $("#szMessageDescription").val())
            $("#szReplyMessageToEmployeeName").val($("#szMessageFromEmployeeName").val())
            $("#szReplyMessageText").val("---------------------------------\n\n" + $("#szMessageText").val())
            $(":mobile-pagecontainer").pagecontainer("change", "#ReplyMessage")
        });

        // wire Click Function for the Save Reply Message
        $("#saveReplyMessage").click(function () {
            szTabSelected = 'Outgoing'
            bReloadMessages = true
            if (validateReplyMessage() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
            }
        });

        // wire Click Function for the Cancel Reply Message
        $("#cancelReplyMessage").click(function () {
            szTabSelected = 'Incoming'
            szDialogReturnTo = "#Messages"
            callCancelDiaglog()
        });

        // wire Click Function for the Save OTA
        $("#saveOTA").click(function () {
            if (validateOTA() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Home")
            }
        });

        // wire Click Function for the Cancel OTA
        $("#cancelOTA").click(function () {
            cancelOTAClicked();
        });

        // wire New Selection on OTA dropdown on OTA window
        $("#szOTASelect").change(function () {
            bReloadPage = false
            if ($("#szOTASelect").val() > 0) {
                setOTAPrompt()
                $('#szOTASelect').selectmenu("refresh")
            }
            else {
                $('#szOTASelect').selectmenu("refresh")
            }
        });

        // wire Click Function for the Save Timecard Note
        $("#saveTimecardNote").click(function () {
            if (validateTimecardNote() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Home")
            }
        });

        // wire Click Function for the Cancel Timecard Note
        $("#cancelTimecardNote").click(function () {
            cancelTimecardNoteClicked();
        });

        // wire Click Function for Save the Schedule Cover
        $("#saveScheduleCover").click(function () {
            if (validateScheduleCover() == true) {
                $(":mobile-pagecontainer").pagecontainer("change", "#Home")
            }
        });

        // wire Click Function for the Cancel the Schedule Cover
        $("#cancelScheduleCover").click(function () {
            cancelScheduleCoverClicked();
        });



        // Wire Click Dialog Box close button
        $("#dialogPageClosebutton").click(function () {
            bReloadPage = false
            if (szDialogReturnTo == "#Home") {
                bReloadPage = true
                if (loginPunchClicked == false) {
                    $(":mobile-pagecontainer").pagecontainer("change", "#Home")
                }
                else {
                    loginPunchClicked = false
                    $(":mobile-pagecontainer").pagecontainer("change", "#Login")
                }

            }
            else {
                if (szDialogReturnTo == "#Login") {
                    bReloadPage = true
                }
                $.mobile.back();
            }
        });

        // Wire Click Dialog Box No button
        $("#dialogPageNoBbutton").click(function () {
            bReloadPage = false
            $.mobile.back();
            setFocusField()
        });

        // Wire Click Dialog Box Yes button
        $("#dialogPageYesbutton").click(function () {
            switch (szDialogReturnTo) {
                case "#Messages":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Messages")
                    break;
                case "#Schedule":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Schedule")
                    break;
                case "#Availability":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Availability")
                    break;
                case "#Transactions":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    resendFailedTransactions()
                    $.mobile.back();
                    break;
                case "#DeleteTransactions":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    deleteTCztr();
                    $.mobile.back();
                    break;
                case "#Setup":
                    if (!$("#szAuthorization").val().length || !$("#szServerDomain").val().length || !$("#lServerPort").val().length || !$("#szClockId").val().length || !$("#szClockPassword").val().length) {
                        szDialogReturnTo = ''
                        if (bgGeo) {
                            try {
                                bgGeo.stop()
                            }
                            catch (e) {

                            }
                        }
                        navigator.app.exitApp();
                    }
                    else {
                        szDialogReturnTo = ''
                        bReloadPage = true
                        db.transaction(function (tx) {
                            tx.executeSql('Select * From TCzcn', null, primeSetupData_NoAuth, function errorSelect(tx, err) {
                                displaySQLError("Select * From TCzcn", err)
                            })
                        })
                        $(":mobile-pagecontainer").pagecontainer("change", "#Home")
                        break;
                    }
                case "#OTA":
                    szPunchType = ''
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Home")
                    break;
                case "#Home":
                    szPunchType = ''
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Home")
                    break;
                case "#Login":
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $(":mobile-pagecontainer").pagecontainer("change", "#Login")
                    break;
                case "#Exit":
                    if (bgGeo) {
                        try {
                            bgGeo.stop()
                        }
                        catch (e) {

                        }
                    }
                    navigator.app.exitApp();
                    break;
                default:
                    szDialogReturnTo = ''
                    bReloadPage = true
                    $.mobile.back();
                    break;
            }
        });

        $("#ResendFailed").click(function () {
            szTabSelected = 'FailedTransactions'
            szDialogReturnTo = "#Transactions"
            $("#dialogHeader").text("Re-Send Failed Transaction")
            $("#YesNoblock").css("display", "")
            $("#Closeblock").css("display", "none")
            $("#dialogMessage").text("Are You Sure You Want To Re-Send Failed Transactions?")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
        });

        // wire New Selection on Timecard date range filter dropdown on Timecard window
        $("#szTimecardDateRangeFilter").bind("change", function (event, ui) {
            bReloadPage = false
            db.transaction(checkZTSReviewdCount, errorZTS, null);
        });

        // wire Click Function for the Review Timecard
        $("#reviwTimecard").click(function () {
            revieTimecard()
            //processTransactions()
            //heartBeat("DATA UPDATE TIMECARD")
            db.transaction(checkZTSReviewdCount, errorZTS, null)
        });

        // wire Click Function for the Save Timecard Note
        $("#saveLogin").click(function () {
            szDialogReturnTo = "#Login"
            loginPunchClicked = false
            validateLogin()
        });
        // wire Click Function for the Save Timecard Note
        $("#punchLogin").click(function () {
            loginPunchClicked = true
            validateLogin()
        });

        // wire Click Function for the Group Punch Tag All
        $("#GrouPunchTagAllButton").click(function () {
            groupPunchTagAll()
        });

        // wire Click Function for the Group Punch Untag All
        $("#GrouPunchUntagAllButton").click(function () {
            grouPunchUntagAll()
        });

        // call this function to perform a check on the database sceama upgrade
        checkDatabase();


        //processTransDelay = setTimeout(processTransactions, 1000)

        setAppVersion();

        // call this function to refresh the geofence data

    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
        if ($("#bMultiEmp").val() == 1) {
            $(":mobile-pagecontainer").pagecontainer("change", "#Login")
        }
        else {
            authenticateResume();
            refreshGeofence();
        }
        //authenticateAsync()
        //if (checkInternet() == true) {
        //    processTransactions();
        //}
        //fulldataUpdate();
    };

    function onBackKeyDown() {
        var pageId = $.mobile.activePage.attr("id")
        if (pageId == 'Home') {
            //navigator.app.exitApp();
            if (device.platform != 'android' && device.platform != 'Android') {
                exitButtonClicked()
            }
        }
        else if (pageId == 'Setup') {
            if ($("#lCEM_SysId").val() == 0) {
                if (bgGeo) {
                    try {
                        bgGeo.stop()
                    }
                    catch (e) {

                    }
                }
                navigator.app.exitApp();
            }
            else {
                $(":mobile-pagecontainer").pagecontainer("change", "#Home")
            }
        }
        else if (pageId == 'Login') {
            return false;
            //$(":mobile-pagecontainer").pagecontainer("change", "#Login")
        }
        else {
            $(":mobile-pagecontainer").pagecontainer("change", "#Home")
        }
    }

    function onOrientationChange() {
        // Announce the new orientation number
        var pageId = $.mobile.activePage.attr("id")
        var effectiveHeight = effectiveDeviceHeight()
        if (effectiveHeight == 'auto') {
            switch (pageId) {
                case 'Schedule':
                    $("#scheduleTable").css('height', 'auto');
                    break;
                case 'Accrual':
                    $("#AccrualTable").css('height', 'auto');
                    break;
                case 'Timecard':
                    $("#timecardTable").css('height', 'auto');
                    break;
            }
        }
        else {
            switch (pageId) {
                case 'Schedule':
                    $("#scheduleTable").css('height', effectiveHeight + 'px');
                    break;
                case 'Accrual':
                    $("#AccrualTable").css('height', effectiveHeight + 'px');
                    break;
                case 'Timecard':
                    $("#timecardTable").css('height', effectiveHeight + 'px');
                    break;
            }
        }
    }

    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZDPSelect-menu", function (e) {
            var input,
                listbox = $("#szZDPSelect-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZDPSelect-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZDPSelect-dialog", function (e) {
            var form = $("#szZDPSelect-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZDPSelect-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });


    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZAJSelect-menu", function (e) {
            var input,
                listbox = $("#szZAJSelect-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZAJSelect-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZAJSelect-dialog", function (e) {
            var form = $("#szZAJSelect-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZAJSelect-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });

    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZATSelect-menu", function (e) {
            var input,
                listbox = $("#szZATSelect-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZATSelect-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZATSelect-dialog", function (e) {
            var form = $("#szZATSelect-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZATSelect-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });


    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZDPSelectOTA-menu", function (e) {
            var input,
                listbox = $("#szZDPSelectOTA-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZDPSelectOTA-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZDPSelectOTA-dialog", function (e) {
            var form = $("#szZDPSelectOTA-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZDPSelectOTA-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });


    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZAJSelectOTA-menu", function (e) {
            var input,
                listbox = $("#szZAJSelectOTA-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZAJSelectOTA-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZAJSelectOTA-dialog", function (e) {
            var form = $("#szZAJSelectOTA-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZAJSelectOTA-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });

    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szZATSelectOTA-menu", function (e) {
            var input,
                listbox = $("#szZATSelectOTA-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szZATSelectOTA-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szZATSelectOTA-dialog", function (e) {
            var form = $("#szZATSelectOTA-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szZATSelectOTA-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });

    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szOTASelect-menu", function (e) {
            var input,
                listbox = $("#szOTASelect-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szOTASelect-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szOTASelect-dialog", function (e) {
            var form = $("#szOTASelect-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szOTASelect-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });

    $.mobile.document
        // "filter-menu-menu" is the ID generated for the listview when it is created
        // by the custom selectmenu plugin. Upon creation of the listview widget we
        // want to prepend an input field to the list to be used for a filter.
        .on("listviewcreate", "#szApproveMessageOTASelect-menu", function (e) {
            var input,
                listbox = $("#szApproveMessageOTASelect-listbox"),
                form = listbox.jqmData("filter-form"),
                listview = $(e.target);
            // We store the generated form in a variable attached to the popup so we
            // avoid creating a second form/input field when the listview is
            // destroyed/rebuilt during a refresh.
            if (!form) {
                input = $("<input data-type='search'></input>");
                form = $("<form></form>").append(input);
                input.textinput();
                $("#szApproveMessageOTASelect-listbox")
                    .prepend(form)
                    .jqmData("filter-form", form);
            }
            // Instantiate a filterable widget on the newly created listview and
            // indicate that the generated input is to be used for the filtering.
            listview.filterable({ input: input });
        })
        // The custom select list may show up as either a popup or a dialog,
        // depending how much vertical room there is on the screen. If it shows up
        // as a dialog, then the form containing the filter input field must be
        // transferred to the dialog so that the user can continue to use it for
        // filtering list items.
        //
        // After the dialog is closed, the form containing the filter input is
        // transferred back into the popup.
        .on("pagebeforeshow pagehide", "#szApproveMessageOTASelect-dialog", function (e) {
            var form = $("#szApproveMessageOTASelect-listbox").jqmData("filter-form"),
                placeInDialog = (e.type === "pagebeforeshow"),
                destination = placeInDialog ? $(e.target).find(".ui-content") : $("#szApproveMessageOTASelect-listbox");
            form
                .find("input")
                // Turn off the "inset" option when the filter input is inside a dialog
                // and turn it back on when it is placed back inside the popup, because
                // it looks better that way.
                .textinput("option", "inset", !placeInDialog)
                .end()
                .prependTo(destination);
        });

})();

function setAppVersion() {
    cordova.getAppVersion(function (version) {
        $("#aboutVersion").text("Version Number: " + version)
    });
}

function setGeoStatus() {
    if ($('#zcn_bNoGeoPunch').val() == 0 || $('#zcn_bGeofenceLockout').val() == 1) {
        var sqlStatement = 'SELECT * FROM TCzvl'
        if (!db) {
            db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
        }
        try {
            db.transaction(function (tx) { tx.executeSql(sqlStatement, null, setGeoStatusWithCount, errorSelectZVL) })
        }
        catch (e) {

        }
    }
    else {
        $("#GeoLocationStatusInfo").text("")
        fillPhonGapGeoLocation()
    }
}

function setGeoStatusWithCount(tx, result) {
    $("#GeoLocationStatusInfo").html("Geofence Status: " + geoFenceStatus + "</br>" + "Geofence Count: " + result.rows.length) + "</br>"
    fillPhonGapGeoLocation()
}

function fillPluginGeoLocation() {
    if (bgGeo) {
            bgGeo.getCurrentPosition( {
                timeout: 30,    // 30 second timeout to fetch location
                maximumAge: 3000, // Accept the last-known-location if not older than 5000 ms.
                desiredAccuracy: 10
            }, setPluginGeoParmAbout, errorPluginGeoParmAbout)
    }
}

function setPluginGeoParmAbout(location, taskId) {
    $('#PluginLatitudeLongitude').html("Plugin Latitude: " + location.coords.latitude + "</br>" + "Plugin Longitude: " + location.coords.longitude + "</br>")
    setGeoStatus()

}

function errorPluginGeoParmAbout(error) {
    $('#PluginLatitudeLongitude').html("Plugin Latitude: None" + "</br>" + "Plugin Longitude: None" + "</br>")
    fillPhonGapGeoLocation()
}

function fillPhonGapGeoLocation() {
    navigator.geolocation.getCurrentPosition(setPhonGapGeoParm, errorPhonGapGeoParm, { maximumAge: 3000, timeout: 30000, enableHighAccuracy: true });
}

function setPhonGapGeoParm(position) {
    $('#PhonGapLatitudeLongitude').html("PhonGap Latitude: " + position.coords.latitude + "</br>" + "PhonGap Longitude: " + position.coords.longitude + "</br>")
    if ($('#zcn_bNoGeoPunch').val() == 0) {
        $('#GeoPunchStatus').html("Geo Punch: On")
    }
    else {
        $('#GeoPunchStatus').html("Geo Punch: Off")
    }
}

function errorPhonGapGeoParm(error) {
    $('#PhonGapLatitudeLongitude').html("PhonGap Latitude: None" + "</br>" + "PhonGap Longitude: None" + "</br>")
    if ($('#zcn_bNoGeoPunch').val() == 0) {
        $('#GeoPunchStatus').html("Geo Punch: On")
    }
    else {
        $('#GeoPunchStatus').html("Geo Punch: Off")
    }
}

function saveSetupClicked() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    var test = $("#szAuthorization").val().toUpperCase().replace(/\s/g, "")
    $("#szAuthorization").val(test)
    $("#szAuthorization").val().toUpperCase()
    $("#szAuthorization").val($("#szAuthorization").val().replace(" ", ""))
    if (!$("#szAuthorization").val().length) {
        $("#dialogMessage").text("Authorization Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szAuthorization"
        return false
    }
    if (!$("#szServerDomain").val().length) {
        $("#dialogMessage").text("Address or Domain Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szServerDomain"
        return false
    }
    if (!$("#szServerDomain").val().match(ip) && !validDomain() && !($("#szServerDomain").val().toLowerCase() == "localhost")) {
        $("#dialogMessage").text("Address or Domain Invalid.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szServerDomain"
        return false
    }
    if (!$("#lServerPort").val().length) {
        $("#dialogMessage").text("Port Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "lServerPort"
        return false
    }
    if (!$("#szClockId").val().length) {
        $("#dialogMessage").text("Clock Id Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szClockId"
        return false
    }
    if (!$("#szClockPassword").val().length) {
        $("#dialogMessage").text("Clock Password Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szClockPassword"
        return false
    }
    if (!$("#lHeartBeatFrequency").val().length || $("#lHeartBeatFrequency").val() == 0) {
        $("#dialogMessage").text("Heartbeat Frequency Cannot Be Blank.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "lHeartBeatFrequency"
        return false
    }
    return true
}

function cancelSetupClicked() {
    szDialogReturnTo = "#Setup"
    callCancelDiaglog()
}


function loadSLC1() {
    var slcResponse, slcAction;
    slcResponse = ServiceResponse
    slcAction = $(slcResponse).find("Action")[0].innerHTML
    switch (slcAction) {
        case "DATA UPDATE EMPLOYEE SCHEDULE":
            zshServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadSchedule, errorZSH, null);
            break;
        case "DATA UPDATE EMPLOYEE SCHEDULE COVER":
            zscServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadScheduleCover, errorZSC, null);
            break;
        case "DATA UPDATE ACCRUALTOTAL":
            zeaServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadAccrual, errorZEA, null);
            break;
        case "DATA UPDATE TIMECARD":
            ztsServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadTimecard, errorZTS, null);
            break;
        case "DATA UPDATE DEPT":
            zdpServiceResponse = ServiceResponse
            db.transaction(processZDP, errorZDP, null);
            break;
        case "DATA UPDATE JOB":
            zajServiceResponse = ServiceResponse
            db.transaction(processZAJ, errorZAJ, null);
            break;
        case "DATA UPDATE TASK":
            zatServiceResponse = ServiceResponse
            db.transaction(processZAT, errorZAT, null);
            break;
        case "DATA UPDATE SWAPLIST":
            swpServiceResponse = ServiceResponse
            db.transaction(processSWP, errorSWP, null);
            break;
        case "DATA UPDATE OTHER ACTIVITY":
            zoaServiceResponse = ServiceResponse
            db.transaction(processZOA, errorZOA, null);
            break;
        case "DATA UPDATE USER":
            zemServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadEmployee, errorZEM, null);
            break;
        case "DATA UPDATE CONFIGURATION":
            zcnServiceResponse = ServiceResponse
            db.transaction(updateZCN, function errorInser(tx, err) {
                displaySQLError("updateZCN", err)
            }, null);
            break;
        case "DATA UPDATE MESSAGES":
            zecServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadMessages, errorZEC, null);
            break;
        case "DATA UPDATE EMPLOYEE LOCKOUT":
            zlcServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadLockout, errorZLC, null);
            break;
        case "DATA UPDATE VALID LOCATION":
            zvlServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadValidLocation, errorZVL, null);
            break;
        case "DATA UPDATE LOGIN":
            zlgServiceResponse = ServiceResponse
            db.transaction(processZLG, errorZLG, null);
            break;
        case "DATA UPDATE AVAILABILITY":
            zavServiceResponse = ServiceResponse
            db.transaction(deleteAndLoadAvailability, errorZAV, null);
            break;
        case "DATA UPDATE GROUP PUNCH":
            zgpServiceResponse = ServiceResponse
            db.transaction(processZGP, errorZGP, null);
            break;

    }
}


function saveZCN(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzcn'
    try {
        tx.executeSql(sqlStatement, null, actionOnZCN, errorSaveZCN)
    }
    catch (e) {
        alert(e.message)
    }
}

function actionOnZCN(tx, result) {
    var sqlStatement;
    if (result.rows.item(0).myCount == 0) {
        sqlStatement = "Insert Into TCzcn(szAuthorization,szServerProtocol,szServerDomain,lServerPort,lHeartBeatFrequency,szClockId,szClockPassword,lSDV_SysId)"
        sqlStatement += " values('" + $("#szAuthorization").val() + "','" + $("#szServerProtocol").val() + "','" + $("#szServerDomain").val() + "',"
        sqlStatement += $("#lServerPort").val() + "," + $("#lHeartBeatFrequency").val() + ",'" + $("#szClockId").val() + "','" + $("#szClockPassword").val() + "'," + $("#lSDV_SysId").val() + ")"
    }
    else {
        sqlStatement = "Update TCzcn set szAuthorization = '" + $("#szAuthorization").val() + "', szServerProtocol = '" + $("#szServerProtocol").val() + "', "
        sqlStatement += "szServerDomain = '" + $("#szServerDomain").val() + "', lServerPort = " + $("#lServerPort").val() + ", lHeartBeatFrequency = " + $("#lHeartBeatFrequency").val()
        sqlStatement += ", szClockId = '" + $("#szClockId").val() + "', szClockPassword = '" + $("#szClockPassword").val() + "', lSDV_SysId = " + $("#lSDV_SysId").val()
    }
    try {
        tx.executeSql(sqlStatement, null, successSaveSZN, errorSaveZCN)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function updateZCN(tx) {
    var sqlStatement
    var currentResponse = zcnServiceResponse
    for (var i = 0; i < $(currentResponse).find("TCzcn").length; i++) {
        var TCzcnRecord = $(currentResponse).find("TCzcn")[i];
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
        try {
            tx.executeSql(sqlStatement, null, null, function errorZCN(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        }
        catch (e) {

        }
    }
}

function successSaveSZN(tx) {
    authenticateAfterSave(tx);
    if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
        //setupMenuRetreiveTCzcn()
        //fulldataUpdate()
        $("#cancelSetup").show()
        $(":mobile-pagecontainer").pagecontainer("change", "#Home")
    }
}

function errorSaveZCN(tx, err) {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$("#szAuthorization").val().length) {
        $("#dialogMessage").text("Error Inserting / Saving TCzcn" + err.message + "  " + err.code)
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szAuthorization"
    }
}

function authenticateAfterSave(tx) {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    if (db) {
        if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
            authenticateAsync(tx)
        }
        else {
            authenticate(tx)
        }

    }
}

function authenticateResume() {
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    if (db) {
        db.transaction(loadZCN, function errorInser(tx, err) {
            displaySQLError("loadZCN", err)
        }, null)
    }
}

function authenticate(tx) {
    if ($("#szAuthorization").val() == "" || $("#szClockId").val() == "" || $("#szClockPassword").val() == "") {
        alert('Missing Required Information')
        return
    }
    var szXMLString = makeSoapHeader("AuthenticateMobile", "AtlasClockService/")
    szXMLString += createElementString("szAuthorization", $("#szAuthorization").val())
    szXMLString += createElementString("szClockId", $("#szClockId").val())
    szXMLString += createElementString("szClockPassword", $("#szClockPassword").val())
    szXMLString += createElementString("lSDV_SysId", $("#lSDV_SysId").val())
    if ($("#szPushDeviceId").val() == "") {
        setTimeout(function () {
            loadSLC()
        }, 1000)
    }
    if ($("#szPushDeviceId").val() == "") {
        $("#szPushDeviceId").val("DebugCode")
    }
    szXMLString += createElementString("szPushDeviceId", $("#szPushDeviceId").val())
    szXMLString += createElementString("szUUID", szUUID)
    szXMLString += makeSoapFooter("AuthenticateMobile")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/AuthenticateMobile"

    //callWebService(szXMLString, szURL)

    try {
        $.ajax({
            type: "POST",
            url: szURL,
            dataType: "xml",
            data: szXMLString,
            processData: false,
            crossDomain: true,
            async: false,
            success: webServiceAuthSuccess,
            error: webServiceAuthError
        });
    }
    catch (e) {

    }
}

function authenticateAsync(tx) {
    if ($("#szAuthorization").val() == "" || $("#szClockId").val() == "" || $("#szClockPassword").val() == "") {
        alert('2. Missing Required Information')
        return
    }
    var szXMLString = makeSoapHeader("AuthenticateMobile", "AtlasClockService/")
    szXMLString += createElementString("szAuthorization", $("#szAuthorization").val())
    szXMLString += createElementString("szClockId", $("#szClockId").val())
    szXMLString += createElementString("szClockPassword", $("#szClockPassword").val())
    szXMLString += createElementString("lSDV_SysId", $("#lSDV_SysId").val())
    if ($("#szPushDeviceId").val() == "") {
        setTimeout(function () {
            loadSLC()
        }, 1000)
    }
    if ($("#szPushDeviceId").val() == "") {
        $("#szPushDeviceId").val("DebugCode")
    }
    szXMLString += createElementString("szPushDeviceId", $("#szPushDeviceId").val())
    szXMLString += createElementString("szUUID", szUUID)
    szXMLString += makeSoapFooter("AuthenticateMobile")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/AuthenticateMobile"

    //callWebService(szXMLString, szURL)

    try {
        $.ajax({
            type: "POST",
            url: szURL,
            dataType: "xml",
            data: szXMLString,
            processData: false,
            crossDomain: true,
            async: true,
            timeout: 3000,
            success: webServiceAuthSuccess,
            error: webServiceAuthError
        });
    }
    catch (e) {

    }
}

function webServiceAuthError(data, status, request) {
    try {
        cordova.plugins.backgroundMode.enable();
    }
    catch (e) {

    }
}

function webServiceAuthSuccess(data) {
    var returnedXML = XMLToString(data)
    ServiceResponse = returnedXML
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    authorizeSLA_SysId = 0;
    authorizeCEM_SysId = 0;
    authorizeSDV_SysId = 0;
    authorizeSLA_SysId = $(ServiceResponse).find("lSLA_SysId").text();
    authorizeCEM_SysId = $(ServiceResponse).find("lCEM_SysId").text();
    authorizeSDV_SysId = $(ServiceResponse).find("lSDV_SysId").text();
    ServiceResponse = ""
    if (authorizeSLA_SysId == 0 || authorizeSLA_SysId == "") {
        try {
            cordova.plugins.backgroundMode.disable();
        }
        catch (e) {

        }
        if ($("#bMultiEmp").val() != 1) {
            db.transaction(function (tx) {
                tx.executeSql("Update TCzcn set szClockId = '',  szClockPassword = ''", null, successClearCuredentail, function errorInser(tx, err) {
                    displaySQLError("Update TCzcn set szClockId = '',  szClockPassword = ''", err)
                })
            })
        }
    }
    else if (authorizeCEM_SysId == 0 || authorizeCEM_SysId == "") {
        try {
            cordova.plugins.backgroundMode.disable();
        }
        catch (e) {

        }
        if ($("#bMultiEmp").val() != 1) {
            db.transaction(function (tx) {
                tx.executeSql("Update TCzcn set szClockId = '',  szClockPassword = ''", null, successClearCuredentail, function errorInser(tx, err) {
                    displaySQLError("Update TCzcn set szClockId = '',  szClockPassword = ''", err)
                })
            })
        }
    }
    else {
        if (authorizeSDV_SysId == 0 || authorizeSDV_SysId == "") {
            try {
                cordova.plugins.backgroundMode.disable();
            }
            catch (e) {

            }
            if ($("#bMultiEmp").val() != 1) {
                db.transaction(function (tx) {
                    tx.executeSql("Update TCzcn set szClockId = '',  szClockPassword = ''", null, successClearCuredentail, function errorInser(tx, err) {
                        displaySQLError("Update TCzcn set szClockId = '',  szClockPassword = ''", err)
                    })
                })
            }
        }
        else {
            if (authorizeSLA_SysId == 0 || authorizeSLA_SysId == "") {
                try {
                    cordova.plugins.backgroundMode.disable();
                }
                catch (e) {

                }
                if ($("#bMultiEmp").val() != 1) {
                    db.transaction(function (tx) {
                        tx.executeSql("Update TCzcn set szClockId = '',  szClockPassword = ''", null, successClearCuredentail, function errorInser(tx, err) {
                            displaySQLError("Update TCzcn set szClockId = '',  szClockPassword = ''", err)
                        })
                    })
                }
            }
            else {
                if (($("#lSDV_SysId").val() == 0 || $("#lSDV_SysId").val() != authorizeSDV_SysId) || ($("#lCEM_SysId").val() == 0 || $("#lCEM_SysId").val() != authorizeCEM_SysId)
                    || ($("#lSLA_SysID").val() == 0 || $("#lSLA_SysID").val() != authorizeSLA_SysId)) {
                    $("#lSDV_SysId").val(authorizeSDV_SysId)
                    db.transaction(function (tx) {
                        tx.executeSql("Update TCzcn set lSDV_SysId = " + authorizeSDV_SysId + ", lCEM_SysID = " + authorizeCEM_SysId + ", lSLA_SysID = " + authorizeSLA_SysId, null, null, function errorInser(tx, err) {
                            displaySQLError("Update TCzcn set lSDV_SysId = " + authorizeSDV_SysId + ", lCEM_SysID = " + authorizeCEM_SysId + ", lSLA_SysID = " + authorizeSLA_SysId, err)
                        })
                    })
                }
            }

        }
    }
    if (authorizeSLA_SysId != 0 && authorizeCEM_SysId != 0 && authorizeSDV_SysId != 0) {
        refreshGeofence();
        if (saveSetupWindowClicked == false) {
            setupMenuRetreiveTCzcn()
            try {
                cordova.plugins.backgroundMode.enable();
            }
            catch (e) {

            }
            if (loginPunchClicked != true) {
                fullUpdateProcess();
                //fulldataUpdate();
            }
        }
        else {
            setupMenuRetreiveTCzcn()
            try {
                cordova.plugins.backgroundMode.enable();
            }
            catch (e) {

            }
        }
    }

}

function successClearCuredentail() {
    $("#szClockId").val("")
    $("#szClockPassword").val("")
    $(":mobile-pagecontainer").pagecontainer("change", "#Setup")
}

function heartBeat(szHeartBeatCommand) {
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
    callWebService(szXMLString, szURL)
    if (ServiceResponse != "false") {
        if ($(ServiceResponse).find("lSLC_SysId").length > 0) {
            ServiceResponse = "false"
        }
    }
}



function serverReachable() {
    var szXMLString = makeSoapHeader("MobileServerReachable", "AtlasClockService/")
    if ($("#szServerProtocol").val().toLowerCase() == "" || $("#szServerDomain").val().toLowerCase() == "") {
        return true
    }
    szXMLString += createElementNumber("ServerReachable", 0)
    szXMLString += makeSoapFooter("MobileServerReachable")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/MobileServerReachable"
    callWebService(szXMLString, szURL)
    if (ServiceResponse == "false") {
        return false
    }
    else {
        if ($(ServiceResponse).find("ServerReachable").text() == "0") {
            return false
        }
        else {
            return true
        }
    }
}

function checkForFullDataUpdate() {
    var szXMLString = makeSoapHeader("MobileCheckForFullUpdate", "AtlasClockService/")
    szXMLString += createElementString("szClockSerialNumber", $("#szAuthorization").val())
    szXMLString += createElementNumber("lSLA_SysId", authorizeSLA_SysId)
    szXMLString += createElementNumber("lCEM_SysId", authorizeCEM_SysId)
    szXMLString += createElementString("lSDV_SysId", authorizeSDV_SysId)
    szXMLString += createElementString("lPhoneDate", clarionToday())
    szXMLString += createElementString("lPhoneTime", clarionClock())
    szXMLString += makeSoapFooter("MobileCheckForFullUpdate")
    var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
    szXMLString = encodeURIComponent(szXMLString2)
    var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/MobileCheckForFullUpdate"
    $.ajax({
        type: "POST",
        url: szURL,
        dataType: "xml",
        data: szXMLString,
        processData: false,
        crossDomain: true,
        async: true,
        success: function (data) {
            var returnedXML, ServiceResponse1
            returnedXML = XMLToString(data)
            ServiceResponse1 = returnedXML
            if ($(ServiceResponse1).find("FullUpdate").text() == "True") {
                fulldataUpdate();
            }
            else {
                return false

            }
        },
        error: function (jqXHR, textStatus) {
            return false
        }
    })
}


function fullUpdateProcess() {
    var fullUpdateTimeoutTimer
    if (fullUpdateProcessDelay) {
        clearTimeout(fullUpdateProcessDelay);
    }
    if ($("#lHeartBeatFrequency").val() == 0) {
        fullUpdateTimeoutTimer = 5 * 60 * 1000
    }
    else {
        //if ($("#bMultiEmp").val() == 1) {
        //    fullUpdateTimeoutTimer = 30 * 1000
        //}
        //else {
        if ($("#bMultiEmp").val() != 1) {
            fullUpdateTimeoutTimer = $("#lHeartBeatFrequency").val() * 60 * 1000
        }
        else {
            fullUpdateTimeoutTimer = 30 * 1000
        }
        //}

    }
    if ($.mobile.path.parseUrl($.mobile.activePage[0].baseURI).hash.split("#")[1] != "Login") {
        checkForFullDataUpdate()
    }
    else {
        fulldataUpdateLogin();
    }
    fullUpdateProcessDelay = setTimeout(function () {
        fullUpdateProcess()
    }, fullUpdateTimeoutTimer)
}
