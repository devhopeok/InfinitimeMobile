var szVersionNumber = ["1.0", "1.01", "1.02", "1.03", "1.04", "1.05", "1.06", "1.07", "1.08", "1.09", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.16", "1.17",
                       "1.18", "1.19", "1.20", "1.21", "1.22", "1.23", "1.24", "1.25", "1.26", "1.27", "1.28", "1.29", "1.30", "1.31", "1.32", "1.33", "1.34", "1.35",
                       "1.36","1.37","1.38","1.39","1.40"]
function callCheckDatabase(tx) {
    checkDatabase()
}

function errorZCN1(tx, err) {

    callCheckDatabase()
}

function checkDatabase() {
    db = null;
    db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    lFromVersionIndex = null;
    szCurrentVersion = db.version;
    szLatestVersion = szVersionNumber[szVersionNumber.length - 1];

    if (szCurrentVersion !== szLatestVersion) {

        // Check for empty version, meaning empty db
        if (szCurrentVersion === '') {

            lFromVersionIndex = 0;

        } else if (szCurrentVersion !== '') {

            lFromVersionIndex = szVersionNumber.indexOf(szCurrentVersion);

            if (lFromVersionIndex === -1) {
                console.log("migrationManager Error: Can't locate version: " + szCurrentVersion + " in versions stack: [" + szVersionNumber.join(', ') + "]");
                return;
            }

            lFromVersionIndex += 1;
        }
        db.changeVersion(szCurrentVersion, szLatestVersion, processVersion)
    }
    else {
        initializeDB()
    }

}

function initializeDB() {
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    db.transaction(checkZCN, null, null)
    if ($("#lCEM_SysId").val() != 0) {
        db.transaction(loadZEM, errorZEM, null)
    }
    db.transaction(checkZDP, null, null)
    db.transaction(checkZAJ, null, null)
    db.transaction(checkZAT, null, null)
    var sqlStatement = "SELECT name FROM sqlite_master WHERE type='table' AND name='TCztr'"
    db.transaction(function (tx) {
        tx.executeSql(sqlStatement, null, function TCztrFound(tx, result) {
            try{
                tx.executeSql("DELETE FROM TCztr WHERE lDateSent > 0 and lDateSent < " + clarionToday() + " - 30", null, null, function errorDeleteZTR(tx, err) {
                    displaySQLError(sqlStatement, err)
                })
            }
            catch (e) {

            }
        }, function errorDeleteZTR(tx, err) {
        //displaySQLError(sqlStatement, err)
    }) })
}

function processVersion(tx) {
    for (var i = lFromVersionIndex; i < szVersionNumber.length; i++) {
        upgradeDbToVersion(tx, szVersionNumber[i]);
    }

}


function upgradeDbToVersion(tx, szVersion) {
    switch (szVersion) {
        case '1.0':
            createTCZCN(tx);
            createTCZSH(tx);
            createTCZEA(tx);
            createTCZTS(tx);
            break;
        default:
            updateDataBase(tx, szVersion)
            break;
    }
}

function updateDataBase(tx, szVersion) {

    switch (szVersion) {
        case '1.01':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD szVersion VARCHAR(20)", null, null, errorZCN);
            }
            catch (e) {
                alert(e.message);
            }
            break;
        case '1.02':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD lSDV_SysId INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert(e.message)
            }
            break;
        case '1.03':
            createTCZDP(tx);
            createTCZAJ(tx);
            createTCZAT(tx);
            createTCZOA(tx);
            break;
        case '1.04':
            createTCZEM(tx);
            break;
        case '1.05':
            createTCZEC(tx);
            createTCZEO(tx);
            break;
        case '1.06':
            createTCZTR(tx);
            break;
        case '1.07':
            createTCZLC(tx);
            break;
        case '1.09':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bHideTimecard INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bHideSchedule INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bHideAccrual INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bHideTransfer INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bHideOtherActivity INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.09  ' + e.message)
            }
            break;
        case '1.10':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bNoGeoPunch INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCztr ADD nLatitude DECIMAL(8,6)", null, null, errorZTR);
                tx.executeSql("ALTER TABLE TCztr ADD nLongitude DECIMAL(8,6)", null, null, errorZTR);
            }
            catch (e) {
                alert('DB Version: 1.10  ' + e.message)
            }
            break;
        case '1.11':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bDisablePunch INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.11  ' + e.message)
            }
            break;
        case '1.12':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD lSLA_SysId INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.12  ' + e.message)
            }
            break;
        case '1.13':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bGeofenceLockout INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.13  ' + e.message)
            }
            break;
        case '1.14':
            try {
                tx.executeSql("ALTER TABLE TCzsh ADD nDepartmentLatitude DECIMAL(8,6)", null, null, errorZSH);
                tx.executeSql("ALTER TABLE TCzsh ADD nDepartmentLongitude DECIMAL(8,6)", null, null, errorZSH);
                tx.executeSql("ALTER TABLE TCzsh ADD nJobLatitude DECIMAL(8,6)", null, null, errorZSH);
                tx.executeSql("ALTER TABLE TCzsh ADD nJobLongitude DECIMAL(8,6)", null, null, errorZSH);
                tx.executeSql("ALTER TABLE TCzsh ADD nTaskLatitude DECIMAL(8,6)", null, null, errorZSH);
                tx.executeSql("ALTER TABLE TCzsh ADD nTaskLongitude DECIMAL(8,6)", null, null, errorZSH);
            }
            catch (e) {
                alert('DB Version: 1.14  ' + e.message)
            }
            break;
        case '1.15':
            createTCZVL(tx);
            try{
                tx.executeSql("ALTER TABLE TCzcn ADD szGeofenceBase VARCHAR(40)", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.15  ' + e.message)
            }
            break;
        case '1.16':
            alterTCZSH(tx);
            alterTCZTS(tx)
            alterTCZDP(tx);
            alterTCZAJ(tx)
            alterTCZTR(tx)
            try{
                tx.executeSql("ALTER TABLE TCzem ADD lCDP_SysId INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD szDepartment VARCHAR(100)", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD lDepartmentNumber INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD lJOB_SysId INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD szJobDescription VARCHAR(100)", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD lJobNumber INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD lASK_SysId INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD szTaskDescription VARCHAR(40)", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzem ADD lTaskNumber INTEGER", null, null, errorZEM);
                tx.executeSql("ALTER TABLE TCzcn ADD bGeoAutoPunch INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.16  ' + e.message)
            }
            break;
        case '1.17':
            try {
                tx.executeSql("ALTER TABLE TCztr ADD bWeekDayOnly INTEGER", null, null, errorZTR);
                tx.executeSql("ALTER TABLE TCztr ADD bNoHoliday INTEGER", null, null, errorZTR);
            }
            catch (e) {
                alert('DB Version: 1.17  ' + e.message)
            }
            break;
        case '1.18':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableCECOTA INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableCECSCH INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableCEC INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bHideCECList INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.18  ' + e.message)
            }
            break;
        case '1.19':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableReview INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableNote INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD lCurrentPayPerFrmDate INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD lCurrentPayPerToDate INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD lPastPayPerFrmDate INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD lPastPayPerToDate INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD szTimecardDateRange VARCHAR(40)", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.19  ' + e.message)
            }
            break;
        case '1.20':
            try {
                tx.executeSql("ALTER TABLE TCztr ADD lReviewDateFrom INTEGER", null, null, errorZTR);
                tx.executeSql("ALTER TABLE TCztr ADD lReviewDateTo INTEGER", null, null, errorZTR);
                tx.executeSql("ALTER TABLE TCztr ADD szTimecardNote VARCHAR(500)", null, null, errorZTR);
            }
            catch (e) {
                alert('DB Version: 1.20  ' + e.message)
            }
            break;
        case '1.21':
            try {
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableDepSwitch INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableJobSwitch INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDisableTaskSwitch INTEGER", null, null, errorZCN);
                tx.executeSql("ALTER TABLE TCzcn ADD bDepRequired INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.21  ' + e.message)
            }
            break;
        case '1.22':
            alterTCZEM(tx);
            break
        case '1.23':
            createTCZLG(tx);
            break
        case '1.24':
            try{
                tx.executeSql("ALTER TABLE TCzcn ADD bMultiEmp INTEGER", null, null, errorZCN);
            }
            catch (e) {
                alert('DB Version: 1.24  ' + e.message)
            }
            break;
        case '1.25':
            break;
        case '1.26':
            alterTCZCN(tx);
            break;
        case '1.27':
            //alterTCZTR2(tx)
            break;
        case '1.28':
            tx.executeSql("ALTER TABLE TCzdp ADD bRetainRecord INTEGER", null, null, errorZDP);
            tx.executeSql("ALTER TABLE TCzaj ADD bRetainRecord INTEGER", null, null, errorZAJ);
            tx.executeSql("ALTER TABLE TCzat ADD bRetainRecord INTEGER", null, null, errorZAT);
            tx.executeSql("ALTER TABLE TCzoa ADD bRetainRecord INTEGER", null, null, errorZOA);
            tx.executeSql("ALTER TABLE TCzlg ADD bRetainRecord INTEGER", null, null, errorZLG);
            break;
        case '1.29':
            createTCZDR(tx);
            break;
        case '1.30':
            tx.executeSql("ALTER TABLE TCzcn ADD szVersion VARCHAR(20)",null, null, errorZCN);
            break;
        case "1.31":
            tx.executeSql("ALTER TABLE TCzcn ADD bOTANoDepSwtch INTEGER", null, null, errorZCN);
            tx.executeSql("ALTER TABLE TCzcn ADD bOTANoJobSwtch INTEGER", null, null, errorZCN);
            tx.executeSql("ALTER TABLE TCzcn ADD bOTANoTaskSwtch INTEGER", null, null, errorZCN);
            break;
        case "1.32":
            tx.executeSql("ALTER TABLE TCztr ADD lUTCTime INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lUTCDate INTEGER", null, null, errorZTR);
            break;
        case "1.33":
            tx.executeSql("ALTER TABLE TCzec ADD szRequestStatus VARCHAR(20)", null, null, errorZEC);
            tx.executeSql("ALTER TABLE TCzec ADD bInternetRequired INTEGER", null, null, errorZEC);
            break;
        case "1.34":
            tx.executeSql("ALTER TABLE TCzlg ADD lSUP_SysId INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szEmployeeName VARCHAR(51)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lLastPunchDate INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lLastPunchTime INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szLastPunchType VARCHAR(40)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szLastPunchDepartment VARCHAR(100)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szLastPunchJob VARCHAR(100)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szLastPunchTask VARCHAR(100)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD nHoursForDay DECIMAL(7,2)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD nHoursForWeek DECIMAL(7,2)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD nHoursForPayPeriod DECIMAL(10,2)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lLastInPunchDate INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lLastInPunchTime INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD bDisableClockOut INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lCDP_SysId INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szDepartment VARCHAR(100)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lDepartmentNumber INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lJOB_SysId INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szJobDescription VARCHAR(100)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lJobNumber INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lASK_SysId INTEGER", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD szTaskDescription VARCHAR(40)", null, null, errorZLG);
            tx.executeSql("ALTER TABLE TCzlg ADD lTaskNumber INTEGER", null, null, errorZLG);
            break;
        case "1.35":
            tx.executeSql("ALTER TABLE TCzcn ADD bGeoDefaults INTEGER", null, null, errorZCN);
            break;
        case "1.36":
            createTCSWP(tx);
            tx.executeSql("ALTER TABLE TCzec ADD szSwapWithEmployeeName VARCHAR(51)", null, null, errorZEC);
            tx.executeSql("ALTER TABLE TCzec ADD lSwapWithCEM_SysId INTEGER", null, null, errorZEC);
            tx.executeSql("ALTER TABLE TCzcn ADD bDisableCECSWAP INTEGER", null, null, errorZCN);
            tx.executeSql("ALTER TABLE TCztr ADD lCEM_SysId_SwapWith INTEGER", null, function SuccessAlter(tx) {
                try {
                    setszVersionZCN(tx)
                }
                catch (e) {
                    alert(e.message);
                }
            }, function errorInser(tx, err) {
                displaySQLError("ALTER TABLE TCztr ADD lCEM_SysId_SwapWith INTEGER", err)
            });
            break;
        case "1.37":
            createTCZGP(tx);
            tx.executeSql("ALTER TABLE TCzcn ADD bAllowGrpPunch INTEGER", null, null, errorZCN);
            break;
        case "1.38":
            createTCZSC(tx)
            tx.executeSql("ALTER TABLE TCztr ADD lSHC_SysId INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCzcn ADD bDisableSHC INTEGER", null, null, errorZCN);
            tx.executeSql("ALTER TABLE TCzcn ADD bHideSHCList INTEGER", null, null, errorZCN);
            break;
        case "1.39":
            createTCZAV(tx);
            tx.executeSql("ALTER TABLE TCztr ADD szDayOfWeek VARCHAR(11)", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD bDayOfWeekNumber INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStartTimeOne INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStopTimeOne INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStartTimeTwo INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStopTimeTwo INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStartTimeThree INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lStopTimeTHree INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lValidDateRangeFrom INTEGER", null, null, errorZTR);
            tx.executeSql("ALTER TABLE TCztr ADD lValidDateRangeTo INTEGER", null, null, errorZTR);
            break;
        case "1.40":
            tx.executeSql("ALTER TABLE TCzcn ADD bHideAvailability INTEGER", null, function SuccessAlter(tx) {
                try {
                    setszVersionZCN(tx)
                }
                catch (e) {
                    alert(e.message);
                }
            }, function errorInser(tx, err) {
                displaySQLError("ALTER TABLE TCzcn ADD bHideAvailability INTEGER", err)
            });
    }
}

function setszVersionZCN(tx) {
    try {
        tx.executeSql("UPDATE TCzcn SET szVersion = '1.40'", null, function successUpdate(tx) {
            initializeDB();
        }, function errorUpdate(tx, err) {
            displaySQLError("UPDATE TCzcn SET szVersion = '1.40'", err)
        });
    }
    catch (e) {
        alert(e.message);
    }

}

// TCZCN table Functions
function createTCZCN(tx) {
    var sqlStatement;

    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzcn(";
    sqlStatement += "lZCN_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szAuthorization VARCHAR(20),";
    sqlStatement += "szServerProtocol VARCHAR(20),";
    sqlStatement += "szServerDomain VARCHAR(255),";
    sqlStatement += "lServerPort INTEGER,";
    sqlStatement += "lHeartBeatFrequency INTEGER,";
    sqlStatement += "bMinOutDuration INTEGER,";
    sqlStatement += "bForceTransfer INTEGER,";
    sqlStatement += "bJobRequired INTEGER,";
    sqlStatement += "bTaskRequired INTEGER,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "szClockId VARCHAR(20),";
    sqlStatement += "szClockPassword VARCHAR(20))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZCN);
    }
    catch (e) {
        alert(e.message);
    }
}


function alterTCZCN(tx) {
    var sqlStatement;
    try {
        tx.executeSql("ALTER TABLE TCzcn RENAME TO old_TCzcn", null, null, errorZCN)
    }
    catch (e) {

    }
    createTCZCN(tx)

    tx.executeSql("ALTER TABLE TCzcn ADD lSDV_SysId INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideTimecard INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideSchedule INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideAccrual INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideTransfer INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideOtherActivity INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bNoGeoPunch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisablePunch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD lSLA_SysId INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bGeofenceLockout INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD szGeofenceBase VARCHAR(40)", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bGeoAutoPunch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableCECOTA INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableCECSCH INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableCEC INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bHideCECList INTEGER", null, null, errorZCN);

    tx.executeSql("ALTER TABLE TCzcn ADD bDisableReview INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableNote INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD lCurrentPayPerFrmDate INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD lCurrentPayPerToDate INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD lPastPayPerFrmDate INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD lPastPayPerToDate INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD szTimecardDateRange VARCHAR(40)", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableDepSwitch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableJobSwitch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDisableTaskSwitch INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bDepRequired INTEGER", null, null, errorZCN);
    tx.executeSql("ALTER TABLE TCzcn ADD bMultiEmp INTEGER", null, null, errorZCN);

    sqlStatement = "INSERT INTO TCzcn (lZCN_SysId,szAuthorization,szServerProtocol,szServerDomain,lServerPort,lHeartBeatFrequency,bMinOutDuration,bForceTransfer,bJobRequired,"
    sqlStatement += "bTaskRequired,lCEM_SysId,szClockId,szClockPassword,lSDV_SysId,bHideTimecard,bHideSchedule,bHideAccrual,bHideTransfer,bHideOtherActivity,bNoGeoPunch,"
    sqlStatement += "bDisablePunch,lSLA_SysId,bGeofenceLockout,szGeofenceBase,bGeoAutoPunch,bDisableCECOTA,bDisableCECSCH,bDisableCEC,bHideCECList) SELECT "
    sqlStatement += "lZCN_SysId,szAuthorization,szServerProtocol,szServerDomain,lServerPort,lHeartBeatFrequency,bMinOutDuration,bForceTransfer,bJobRequired,"
    sqlStatement += "bTaskRequired,lCEM_SysId,szClockId,szClockPassword,lSDV_SysId,bHideTimecard,bHideSchedule,bHideAccrual,bHideTransfer,bHideOtherActivity,bNoGeoPunch,"
    sqlStatement += "bDisablePunch,lSLA_SysId,bGeofenceLockout,szGeofenceBase,bGeoAutoPunch,bDisableCECOTA,bDisableCECSCH,bDisableCEC,bHideCECList FROM old_TCzcn"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzcn", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzcn", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function checkZDP(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzdp'
    try {
        tx.executeSql(sqlStatement, null, function zdpCount(tx,result) {
            $('#zdp_lCount').val(result.rows.item(0).myCount)
        }, function errorSelect(tx, err) {
            displaySQLError('SELECT COUNT(*) as myCount FROM TCzdp', err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function checkZAJ(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzaj'
    try {
        tx.executeSql(sqlStatement, null, function zajCount(tx, result) {
            $('#zaj_lCount').val(result.rows.item(0).myCount)
        }, function errorSelect(tx, err) {
            displaySQLError('SELECT COUNT(*) as myCount FROM TCzaj', err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function checkZAT(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzat'
    try {
        tx.executeSql(sqlStatement, null, function zajCount(tx, result) {
            $('#zat_lCount').val(result.rows.item(0).myCount)
        }, function errorSelect(tx, err) {
            displaySQLError('SELECT COUNT(*) as myCount FROM TCzat', err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function checkZCN(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzcn'
    try {
        tx.executeSql(sqlStatement, null, returnZCNCount, function errorSelect(tx, err) {
            displaySQLError('SELECT COUNT(*) as myCount FROM TCzcn', err)
        })
    }
    catch (e) {
        alert(e.message)
    }

}

function returnZCNCount(tx, result) {
    var sqlStatement;
    if (result.rows.item(0).myCount == 0) {
        sqlStatement = "Insert Into TCzcn(szServerProtocol,szServerDomain,lServerPort,lHeartBeatFrequency,szAuthorization,szClockId,szClockPassword)"
        sqlStatement += " values('HTTP','www.InfiniTimeAtlasMobile.com',80,5,'','','')"
        tx.executeSql(sqlStatement, null, loadZCN, function errorInsert(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    else {
        loadZCN(tx)
    }
}

function addDefaultZCN(tx) {
    var sqlStatement;
    sqlStatement = "Insert Into TCzcn(szServerProtocol,szServerDomain,lServerPort,lHeartBeatFrequency,szAuthorization,szClockId,szClockPassword)"
    sqlStatement += " values('HTTP','www.InfiniTimeAtlasMobile.com',80,5,'','','')"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsert(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {

    }

}

function loadZCN(tx) {
    try {
        tx.executeSql('Select * From TCzcn', null, primeSetupData, function errorSelect(tx, err) {
            displaySQLError("Select * From TCzcn", err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function loadZCN_NoAuth(tx) {
    try {
        tx.executeSql('Select * From TCzcn', null, primeSetupData_NoAuth, function errorSelect(tx, err) {
            displaySQLError('Select * From TCzcn', err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function primeSetupData(tx, result) {
    $("#szAuthorization").val(result.rows.item(0).szAuthorization)
    $("#szServerProtocol").val(result.rows.item(0).szServerProtocol).selectmenu('refresh')
    $("#szServerDomain").val(result.rows.item(0).szServerDomain)
    $("#lServerPort").val(result.rows.item(0).lServerPort)
    $("#szClockId").val(result.rows.item(0).szClockId)
    $("#szClockPassword").val(result.rows.item(0).szClockPassword)
    if ($("#szAuthorization").val() == "" || $("#szClockId").val() == "" || $("#szClockPassword").val() == "") {
        $(":mobile-pagecontainer").pagecontainer("change", "#Setup")
        $("#lHeartBeatFrequency").val(result.rows.item(0).lHeartBeatFrequency)
        $("#lHeartBeatFrequency").slider('refresh');
        $("#lSDV_SysId").val(0)
        $("#lCEM_SysId").val(0)
        $("#lSLA_SysId").val(0)
        $("#cancelSetup").hide()
    }
    else {
        $("#lHeartBeatFrequency").val(result.rows.item(0).lHeartBeatFrequency)
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
        if (result.rows.item(0).lSDV_SysId) {
            $("#lSDV_SysId").val(result.rows.item(0).lSDV_SysId)
        }
        else {
            $("#lSDV_SysId").val(0)
        }
        if (result.rows.item(0).lCEM_SysId) {
            $("#lCEM_SysId").val(result.rows.item(0).lCEM_SysId)
        }
        else {
            $("#lCEM_SysId").val(0)
        }
        if (result.rows.item(0).lSLA_SysId) {
            $("#lSLA_SysId").val(result.rows.item(0).lSLA_SysId)
        }
        else {
            $("#lSLA_SysId").val(0)
        }
        authorizeSLA_SysId = $("#lSLA_SysId").val()
        authorizeCEM_SysId = $("#lCEM_SysId").val()
        authorizeSDV_SysId = $("#lSDV_SysId").val()
        if ($("#szAuthorization").val() != "" && $("#szClockId").val() != "" && $("#szClockPassword").val() != "") {
            if ($("#bMultiEmp").val() == 1) {
                //heartBeat("DATA UPDATE LOGIN")
                authenticateAsync(tx)
                szDialogReturnTo = "#Login"
                //fulldataUpdate()
                $(":mobile-pagecontainer").pagecontainer("change", "#Login")
            }
            else {
                if (checkInternet() == true) {
                    authenticateAsync(tx)
                }
            }
        }
        else {
            $(":mobile-pagecontainer").pagecontainer("change", "#Setup")
            $("#lHeartBeatFrequency").val(result.rows.item(0).lHeartBeatFrequency)
            $("#lHeartBeatFrequency").slider('refresh');
            $("#cancelSetup").hide()
        }
        if ($("#lCEM_SysId").val() != 0) {
            setupMenuRetreiveTCzcn();
            refreshGeofence();
        }
    }

}

function primeSetupData_NoAuth(tx, result) {
    $("#szAuthorization").val(result.rows.item(0).szAuthorization)
    $("#szServerProtocol").val(result.rows.item(0).szServerProtocol).selectmenu('refresh', true)
    $("#szServerDomain").val(result.rows.item(0).szServerDomain)
    $("#lServerPort").val(result.rows.item(0).lServerPort)
    $("#lHeartBeatFrequency").val(result.rows.item(0).lHeartBeatFrequency)
    $("#lHeartBeatFrequency").slider("refresh")
    $("#szClockId").val(result.rows.item(0).szClockId)
    $("#szClockPassword").val(result.rows.item(0).szClockPassword)
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
    if (result.rows.item(0).lSDV_SysId) {
        $("#lSDV_SysId").val(result.rows.item(0).lSDV_SysId)
    }
    else {
        $("#lSDV_SysId").val(0)
    }
    if (result.rows.item(0).lCEM_SysId) {
        $("#lCEM_SysId").val(result.rows.item(0).lCEM_SysId)
    }
    else {
        $("#lCEM_SysId").val(0)
    }
    if (result.rows.item(0).lSLA_SysId) {
        $("#lSLA_SysId").val(result.rows.item(0).lSLA_SysId)
    }
    else {
        $("#lSLA_SysId").val(0)
    }
    if ($("#lCEM_SysId").val() != 0) {
        if (!szTabSelected || szTabSelected == '') {
            szTabSelected = 'SetupUserInfo'
            $("#SetupServerInfoTab").removeClass("ui-btn-active")
            $("#SetupUserInfoTab").removeClass("ui-btn-active").addClass("ui-btn-active");
        }

        setupMenuRetreiveTCzcn();
        refreshGeofence();
    }
}

function errorZCN(tx, err) {
    displaySQLError("ZCN", err)
}

function errorSelectZCN(tx, err) {
    displaySQLError("ZCN", err)
}

// TCZSH table Functions
function createTCZSH(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzsh(";
    sqlStatement += "lZSH_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lBeginTime INTEGER,";
    sqlStatement += "lEndTime INTEGER,";
    sqlStatement += "szType VARCHAR(80),";
    sqlStatement += "lDate INTEGER,";
    sqlStatement += "szDepartment VARCHAR(100),";
    sqlStatement += "szJobDescription VARCHAR(100),";
    sqlStatement += "szTaskDescription VARCHAR(100))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZSH)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZSH(tx) {
    var sqlStatement;    
    try {
        tx.executeSql("ALTER TABLE TCzsh RENAME TO old_TCzsh", null, null, errorZSH)
    }
    catch (e) {

    }
    createTCZSH(tx)
    tx.executeSql("ALTER TABLE TCzsh ADD nDepartmentLatitude DECIMAL(8,6)", null, null, errorZSH);
    tx.executeSql("ALTER TABLE TCzsh ADD nDepartmentLongitude DECIMAL(8,6)", null, null, errorZSH);
    tx.executeSql("ALTER TABLE TCzsh ADD nJobLatitude DECIMAL(8,6)", null, null, errorZSH);
    tx.executeSql("ALTER TABLE TCzsh ADD nJobLongitude DECIMAL(8,6)", null, null, errorZSH);
    tx.executeSql("ALTER TABLE TCzsh ADD nTaskLatitude DECIMAL(8,6)", null, null, errorZSH);
    tx.executeSql("ALTER TABLE TCzsh ADD nTaskLongitude DECIMAL(8,6)", null, null, errorZSH);
    sqlStatement = "INSERT INTO TCzsh (lZSH_SysId,lBeginTime,lEndTime,szType,lDate,szDepartment,szJobDescription,szTaskDescription,nDepartmentLatitude,nDepartmentLongitude,"
    sqlStatement += "nJobLatitude,nJobLongitude,nTaskLatitude,nTaskLongitude) SELECT lZSH_SysId,lBeginTime,lEndTime,szType,lDate,szDepartment,szJobDescription,szTaskDescription,"
    sqlStatement += "nDepartmentLatitude,nDepartmentLongitude,nJobLatitude,nJobLongitude,nTaskLatitude,nTaskLongitude FROM old_TCzsh"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzsh", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzsh", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorZSH(tx, err) {
    displaySQLError("ZSH", err)
}

function errorSelectZSH(tx, err) {
    displaySQLError("ZSH", err)
}

// TCZEA table Functions
function createTCZEA(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzea(";
    sqlStatement += "lZEA_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szAccrualType VARCHAR(50),";
    sqlStatement += "lDate INTEGER,";
    sqlStatement += "lAccrueThruDate INTEGER,";
    sqlStatement += "nTimeBase DECIMAL(21,9),";
    sqlStatement += "nTimeAccrued DECIMAL(21,9),";
    sqlStatement += "nTimeUsed  DECIMAL(21,9))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZEA)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZEA(tx, err) {
    displaySQLError("ZEA", err)
}

function errorSelectZEA(tx, err) {
    displaySQLError("ZEA", err)
}

// TCZTS table Functions
function createTCZTS(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzts(";
    sqlStatement += "lZTS_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szDepartment VARCHAR(100),";
    sqlStatement += "szJobDescription VARCHAR(100),";
    sqlStatement += "szTaskDescription VARCHAR(100),";
    sqlStatement += "szOtherActivityType VARCHAR(50),";
    sqlStatement += "szExceptionDescription VARCHAR(80),";
    sqlStatement += "szHolidayName VARCHAR(50),";
    sqlStatement += "lDateAssociatedTo INTEGER,";
    sqlStatement += "bIconForGrid INTEGER,";
    sqlStatement += "bAuditTrail INTEGER,";
    sqlStatement += "bExceptionsExist INTEGER,";
    sqlStatement += "bReviewed INTEGER,";
    sqlStatement += "lStartTimeDate INTEGER,";
    sqlStatement += "lStartTime INTEGER,";
    sqlStatement += "szStartTimeNote VARCHAR(5),";
    sqlStatement += "szStartTimeException VARCHAR(161),";
    sqlStatement += "lStopTimeDate INTEGER,";
    sqlStatement += "lStopTime INTEGER,";
    sqlStatement += "szStopTimeNote VARCHAR(5),";
    sqlStatement += "szStopTimeException VARCHAR(161),";
    sqlStatement += "szType VARCHAR(3),";
    sqlStatement += "bCalcOverride INTEGER,";
    sqlStatement += "nRegularHrs DECIMAL(7,2),";
    sqlStatement += "nBreakHrs DECIMAL(7,2),";
    sqlStatement += "nOTOne DECIMAL(7,2),";
    sqlStatement += "bOTOneApproved INTEGER,";
    sqlStatement += "nOTTwo DECIMAL(7,2),";
    sqlStatement += "bOTTwoApproved INTEGER,";
    sqlStatement += "nOTThree DECIMAL(7,2),";
    sqlStatement += "bOTThreeApproved INTEGER,";
    sqlStatement += "nOTFour DECIMAL(7,2),";
    sqlStatement += "bOTFourApproved INTEGER,";
    sqlStatement += "nOtherHrsOrAmount DECIMAL(15,2),";
    sqlStatement += "nHourlyWage DECIMAL(12,4),";
    sqlStatement += "nOTOneHourlyWage DECIMAL(12,4),";
    sqlStatement += "nOTTwoHourlyWage DECIMAL(12,4),";
    sqlStatement += "nOTThreeHourlyWage DECIMAL(12,4),";
    sqlStatement += "nOTFourHourlyWage DECIMAL(12,4),";
    sqlStatement += "nTotalWages DECIMAL(17,4),";
    sqlStatement += "nOTOneTotalWages DECIMAL(17,4),";
    sqlStatement += "nOTTwoTotalWages DECIMAL(17,4),";
    sqlStatement += "nOTThreeTotalWages DECIMAL(17,4),";
    sqlStatement += "nOTFourTotalWages DECIMAL(17,4),";
    sqlStatement += "szAuditTrailNote VARCHAR(499),";
    sqlStatement += "szNote VARCHAR(499),";
    sqlStatement += "szEmployeeSchedule VARCHAR(40))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZTS)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZTS(tx) {
    var sqlStatement;
    try {
        tx.executeSql("ALTER TABLE TCzts RENAME TO old_TCzts", null, null, errorZTS)
    }
    catch (e) {

    }
    createTCZTS(tx)
    sqlStatement = "INSERT INTO TCzts (lZTS_SysId,szDepartment,szJobDescription,szTaskDescription,szOtherActivityType,szExceptionDescription,szHolidayName,lDateAssociatedTo,"
    sqlStatement += "bIconForGrid,bAuditTrail,bExceptionsExist,bReviewed,lStartTimeDate,lStartTime,szStartTimeNote,szStartTimeException,lStopTimeDate,lStopTime,"
    sqlStatement += "szStopTimeNote,szStopTimeException,szType,bCalcOverride,nRegularHrs,nBreakHrs,nOTOne,bOTOneApproved,nOTTwo,bOTTwoApproved,nOTThree,"
    sqlStatement += "bOTThreeApproved,nOTFour,bOTFourApproved,nOtherHrsOrAmount,nHourlyWage,nOTOneHourlyWage,nOTTwoHourlyWage,nOTThreeHourlyWage,nOTFourHourlyWage,"
    sqlStatement += "nTotalWages,nOTOneTotalWages,nOTTwoTotalWages,nOTThreeTotalWages,nOTFourTotalWages,szAuditTrailNote,szNote,szEmployeeSchedule) SELECT "
    sqlStatement += "lZTS_SysId,szDepartment,szJobDescription,szTaskDescription,szOtherActivityType,szExceptionDescription,szHolidayName,lDateAssociatedTo,"
    sqlStatement += "bIconForGrid,bAuditTrail,bExceptionsExist,bReviewed,lStartTimeDate,lStartTime,szStartTimeNote,szStartTimeException,lStopTimeDate,lStopTime,"
    sqlStatement += "szStopTimeNote,szStopTimeException,szType,bCalcOverride,nRegularHrs,nBreakHrs,nOTOne,bOTOneApproved,nOTTwo,bOTTwoApproved,nOTThree,"
    sqlStatement += "bOTThreeApproved,nOTFour,bOTFourApproved,nOtherHrsOrAmount,nHourlyWage,nOTOneHourlyWage,nOTTwoHourlyWage,nOTThreeHourlyWage,nOTFourHourlyWage,"
    sqlStatement += "nTotalWages,nOTOneTotalWages,nOTTwoTotalWages,nOTThreeTotalWages,nOTFourTotalWages,szAuditTrailNote,szNote,szEmployeeSchedule FROM old_TCzts"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzts", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzts", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorZTS(tx, err) {
    displaySQLError("ZTS", err)
}

function errorSelectZTS(tx, err) {
    displaySQLError("ZTS", err)
}

function createTCZDP(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzdp(";
    sqlStatement += "lZDP_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szDepartment VARCHAR(100),";
    sqlStatement += "lDepartmentNumber INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZDP)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZDP(tx) {
    var sqlStatement;
    
    try {
        tx.executeSql("ALTER TABLE TCzdp RENAME TO old_TCzdp", null, null, errorZDP)
    }
    catch (e) {

    }
    createTCZDP(tx)
    sqlStatement = "INSERT INTO TCzdp (lZDP_SysId,szDepartment,lDepartmentNumber) SELECT "
    sqlStatement += "lZDP_SysId,szDepartment,lDepartmentNumber FROM old_TCzdp"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzdp", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzdp", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorSelectZDP(tx, err) {
    displaySQLError("ZDP", err)
}

function errorZDP(tx, err) {
    displaySQLError("ZDP", err)
}

function createTCZAJ(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzaj(";
    sqlStatement += "lZAJ_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szJobDescription VARCHAR(100),";
    sqlStatement += "lJobNumber INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZAJ)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZAJ(tx) {
    var sqlStatement;    
    try {
        tx.executeSql("ALTER TABLE TCzaj RENAME TO old_TCzaj", null, null, errorZAJ)
    }
    catch (e) {

    }
    createTCZAJ(tx)
    sqlStatement = "INSERT INTO TCzaj (lZAJ_SysId,szJobDescription,lJobNumber) SELECT "
    sqlStatement += "lZAJ_SysId,szJobDescription,lJobNumber FROM old_TCzaj"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzaj", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzaj", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorZAJ(tx, err) {
    displaySQLError("ZAJ", err)
}

function errorSelectZAJ(tx, err) {
    displaySQLError("ZAJ", err)
}

function createTCZAT(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzat(";
    sqlStatement += "lZAT_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szTaskDescription VARCHAR(100),";
    sqlStatement += "lTaskNumber INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZAT)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZAT(tx) {
    var sqlStatement;    
    try {
        tx.executeSql("ALTER TABLE TCzat RENAME TO old_TCzat", null, null, errorZAT)
    }
    catch (e) {

    }
    createTCZAT(tx)
    sqlStatement = "INSERT INTO TCzat (lZAT_SysId,szTaskDescription,lTaskNumber) SELECT "
    sqlStatement += "lZAT_SysId,szTaskDescription,lTaskNumber FROM old_TCzat"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzat", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzat", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorZAT(tx, err) {
    displaySQLError("ZAT", err)
}

function errorSelectZAT(tx, err) {
    displaySQLError("ZAT", err)
}

function createTCZOA(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzoa(";
    sqlStatement += "lZOA_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szOtherActivityType VARCHAR(50),";
    sqlStatement += "lCodeNumber INTEGER,";
    sqlStatement += "szType VARCHAR(6),";
    sqlStatement += "bUsedForOtherButton INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZOA)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZOA(tx, err) {
    displaySQLError("ZOA", err)
}

function errorSelectZOA(tx, err) {
    displaySQLError("ZOA", err)
}

function createTCZEM(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzem(";
    sqlStatement += "lZEM_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "lSUP_SysId INTEGER,";
    sqlStatement += "szEmployeeName VARCHAR(51),";
    sqlStatement += "szClockId VARCHAR(20),";
    sqlStatement += "szClockPassword VARCHAR(20),";
    sqlStatement += "lLastPunchDate INTEGER,";
    sqlStatement += "lLastPunchTime INTEGER,";
    sqlStatement += "szLastPunchType VARCHAR(40),";
    sqlStatement += "szLastPunchDepartment VARCHAR(100),";
    sqlStatement += "szLastPunchJob VARCHAR(100),";
    sqlStatement += "szLastPunchTask VARCHAR(100),";
    sqlStatement += "nHoursForDay DECIMAL(7,2),";
    sqlStatement += "nHoursForWeek DECIMAL(7,2),";
    sqlStatement += "nHoursForPayPeriod DECIMAL(10,2),";
    sqlStatement += "lLastInPunchDate INTEGER,";
    sqlStatement += "lLastInPunchTime INTEGER,";
    sqlStatement += "bDisableClockOut INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZEM)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function alterTCZEM(tx) {
    var sqlStatement;
   
    try {
        tx.executeSql("ALTER TABLE TCzem RENAME TO old_TCzem", null, null, errorZEM)
    }
    catch (e) {

    }
    createTCZEM(tx)
    tx.executeSql("ALTER TABLE TCzem ADD lCDP_SysId INTEGER", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD szDepartment VARCHAR(100)", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD lDepartmentNumber INTEGER", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD lJOB_SysId INTEGER", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD szJobDescription VARCHAR(100)", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD lJobNumber INTEGER", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD lASK_SysId INTEGER", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD szTaskDescription VARCHAR(100)", null, null, errorZEM);
    tx.executeSql("ALTER TABLE TCzem ADD lTaskNumber INTEGER", null, null, errorZEM);

    sqlStatement = "INSERT INTO TCzem (lZEM_SysId,lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,"
    sqlStatement += "szLastPunchDepartment,szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForDay,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,"
    sqlStatement += "bDisableClockOut,lCDP_SysId,szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber) SELECT "
    sqlStatement += "lZEM_SysId,lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,"
    sqlStatement += "szLastPunchDepartment,szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForDay,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,"
    sqlStatement += "bDisableClockOut,lCDP_SysId,szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber FROM old_TCzem"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCzem", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCzem", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}


function errorZEM(tx, err) {
    displaySQLError("ZEM", err)
}

function errorSelectZEM(tx, err) {
    displaySQLError("ZEM", err)
}

function deleteAndLoadEmployee(tx) {
    if (zemServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzem", null, sucessDeleteZEM, function errorDeleteZEM(tx, err) {
                displaySQLError("Delete From TCzem", err)
            });
        }
        catch (e) {

        }
    }
    else {
        loadZEM(tx)
    }
}

function sucessDeleteZEM(tx) {
    processZEM(tx)
    if (fullUpdate == false) {
        loadZEM(tx)
    }
}

function processZEM(tx) {
    var sqlStatement
    var currentResponse = zemServiceResponse
    for (var i = 0; i < $(currentResponse).find("TCzem").length; i++) {
        var TCzemRecord = $(currentResponse).find("TCzem")[i];
        $("#zem_lCDP_SysId").val($(TCzemRecord).attr('lCDP_SysId'))
        $("#zem_szDepartment").val($(TCzemRecord).attr('szDepartment'))
        $("#zem_lDepartmentNumber").val($(TCzemRecord).attr('lDepartmentNumber'))
        $("#zem_lJOB_SysId").val($(TCzemRecord).attr('lJOB_SysId'))
        $("#zem_szJobDescription").val($(TCzemRecord).attr('szJobDescription'))
        $("#zem_lJobNumber").val($(TCzemRecord).attr('lJobNumber'))
        $("#zem_lASK_SysId").val($(TCzemRecord).attr('lASK_SysId'))
        $("#zem_szTaskDescription").val($(TCzemRecord).attr('szTaskDescription'))
        $("#zem_lTaskNumber").val($(TCzemRecord).attr('lTaskNumber'))
        sqlStatement = "Insert Into TCzem(lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,szLastPunchDepartment,"
        sqlStatement += "szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForWeek,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,bDisableClockOut,lCDP_SysId,"
        sqlStatement += "szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber) Values("
        sqlStatement += $(currentResponse).find("TCzem")[i].innerHTML + "," + $(TCzemRecord).attr('lSUP_SysId') + ",'" + $(TCzemRecord).attr('szEmployeeName') + "','"
        sqlStatement += $(TCzemRecord).attr('szClockId') + "','" + $(TCzemRecord).attr('szClockPassword') + "'," + $(TCzemRecord).attr('lLastPunchDate') + ","
        sqlStatement += $(TCzemRecord).attr('lLastPunchTime') + ",'" + $(TCzemRecord).attr('szLastPunchType') + "','" + $(TCzemRecord).attr('szLastPunchDepartment') + "','"
        sqlStatement += $(TCzemRecord).attr('szLastPunchJob') + "','" + $(TCzemRecord).attr('szLastPunchTask') + "'," + $(TCzemRecord).attr('nHoursForDay') + ","
        sqlStatement += $(TCzemRecord).attr('nHoursForWeek') + "," + $(TCzemRecord).attr('nHoursForPayPeriod') + "," + $(TCzemRecord).attr('lLastInPunchDate') + ","
        sqlStatement += $(TCzemRecord).attr('lLastInPunchTime') + "," + $(TCzemRecord).attr('bDisableClockOut') + "," + $(TCzemRecord).attr('lCDP_SysId') + ",'"
        sqlStatement += $(TCzemRecord).attr('szDepartment') + "'," + $(TCzemRecord).attr('lDepartmentNumber') + "," + $(TCzemRecord).attr('lJOB_SysId') + ",'"
        sqlStatement += $(TCzemRecord).attr('szJobDescription') + "'," + $(TCzemRecord).attr('lJobNumber') + "," + $(TCzemRecord).attr('lASK_SysId') + ",'"
        sqlStatement += $(TCzemRecord).attr('szTaskDescription') + "'," + $(TCzemRecord).attr('lTaskNumber') + ")"
        try {
            tx.executeSql(sqlStatement, null, null, function errorInsertZEM(tx, err) {
                displaySQLError(sqlStatement, err)
            })
        }
        catch (e) {

        }
    }
    zemServiceResponse = ""
}

function loadZEM(tx) {
    if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
        try {
            tx.executeSql('Select * From TCzem', null, primeOverviewData, function errorLoadZEM(tx, err) {
                displaySQLError('Select * From TCzem', err)
            })
        }
        catch (e) {
            alert(e.message)
        }
    }
    else {
        if (checkInternet() == true) {
            //authenticate(tx)
            if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
                try {
                    tx.executeSql('Select * From TCzem', null, primeOverviewData, function errorLoadZEM(tx, err) {
                        displaySQLError('Select * From TCzem', err)
                    })
                }
                catch (e) {
                    alert(e.message)
                }
            }
        }
    }
}

function loadZEM_NoAuth(tx) {
    clearTimeout(loadPageDelay);
    try {
        tx.executeSql('Select * From TCzem', null, primeOverviewData, function errorLoadZEM(tx, err) {
            displaySQLError('Select * From TCzem', err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function primeOverviewData(tx, result) {
    if (result.rows.length == 0) {
        return
    }    
    $("#szEmployeeName").val(result.rows.item(0).szEmployeeName)
    if (result.rows.item(0).lLastPunchDate != 0) {
        $("#lLastPunchDate").val(toSqlDate(result.rows.item(0).lLastPunchDate))
    }
    else {
        $("#lLastPunchDate").val('')
    }
    if (result.rows.item(0).lLastPunchTime != 0) {
        $("#lLastPunchTime").val(toSqlTime(result.rows.item(0).lLastPunchTime))
    }
    else {
        $("#lLastPunchTime").val('')
    }
    $("#zem_lCDP_SysId").val(result.rows.item(0).lCDP_SysId)
    $("#zem_szDepartment").val(result.rows.item(0).szDepartment)
    $("#zem_lDepartmentNumber").val(result.rows.item(0).lDepartmentNumber)
    $("#zem_lJOB_SysId").val(result.rows.item(0).lJOB_SysId)
    $("#zem_szJobDescription").val(result.rows.item(0).szJobDescription)
    $("#zem_lJobNumber").val(result.rows.item(0).lJobNumber)
    $("#zem_lASK_SysId").val(result.rows.item(0).lASK_SysId)
    $("#zem_szTaskDescription").val(result.rows.item(0).szTaskDescription)
    $("#zem_lTaskNumber").val(result.rows.item(0).lTaskNumber)
    $("#szLastPunchType").val(result.rows.item(0).szLastPunchType)
    $("#szLastPunchDepartment").val(result.rows.item(0).szLastPunchDepartment)
    $("#szLastPunchJob").val(result.rows.item(0).szLastPunchJob)
    $("#szLastPunchTask").val(result.rows.item(0).szLastPunchTask)
    $("#nHoursForDay").val(result.rows.item(0).nHoursForDay)
    $("#nHoursForWeek").val(result.rows.item(0).nHoursForWeek)
    $("#nHoursForPayPeriod").val(result.rows.item(0).nHoursForPayPeriod)
    $("#lUnreadMessageCount").val(result.rows.item(0).lUnreadMessageCount)
    if ($("#szLastPunchJob").val() == "") {
        $("#LastPunchJobTR").hide()
    }
    else {
        $("#LastPunchJobTR").show()
    }
    if ($("#szLastPunchTask").val() == "") {
        $("#LastPunchTaskTR").hide()
    }
    else {
        $("#LastPunchTaskTR").show()
    }

}


function createTCZEC(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzec(";
    sqlStatement += "lZEC_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEC_SysId INTEGER,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "szMessageFromEmployeeName VARCHAR(50),";
    sqlStatement += "lDate INTEGER,";
    sqlStatement += "lTime INTEGER,";
    sqlStatement += "szMessageType VARCHAR(40),";
    sqlStatement += "szMessageText VARCHAR(10240),";
    sqlStatement += "szMessageDescription VARCHAR(80),";
    sqlStatement += "lDateRequestFrom INTEGER,";
    sqlStatement += "lDateRequestTo INTEGER,";
    sqlStatement += "lTimeRequestFrom INTEGER,";
    sqlStatement += "lTimeRequestTo INTEGER,";
    sqlStatement += "lMessageID INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZEC)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZEC(tx, err) {
    displaySQLError("ZEC", err)
}

function errorSelectZEC(tx, err) {
    displaySQLError("ZEC", err)
}


function createTCZEO(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzeo(";
    sqlStatement += "lZEO_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEC_SysId INTEGER,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "szMessageToEmployeeName VARCHAR(50),";
    sqlStatement += "lDateRead INTEGER,";
    sqlStatement += "lTimeRead INTEGER,";
    sqlStatement += "szRequestApproved VARCHAR(10))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZEO)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZEO(tx, err) {
    displaySQLError("ZEO", err)
}

function errorSelectZEO(tx, err) {
    displaySQLError("ZEO", err)
}

function createTCZTR(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCztr(";
    sqlStatement += "lZTR_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "lCDP_SysId INTEGER,";
    sqlStatement += "lJOB_SysId INTEGER,";
    sqlStatement += "lASK_SysId INTEGER,";
    sqlStatement += "lOTA_SysId INTEGER,";
    sqlStatement += "lCEC_SysId INTEGER,";
    sqlStatement += "lDate INTEGER,";
    sqlStatement += "lTime INTEGER,";
    sqlStatement += "szType VARCHAR(20),";
    sqlStatement += "szClockId VARCHAR(20),";
    sqlStatement += "szEmployeeName VARCHAR(51),";
    sqlStatement += "szSupervisorClockId VARCHAR(20),";
    sqlStatement += "szSupervisorName VARCHAR(51),";
    sqlStatement += "lDepartmentNumber INTEGER,";
    sqlStatement += "szDepartment VARCHAR(100),";
    sqlStatement += "lJobNumber INTEGER,";
    sqlStatement += "szJobDescription VARCHAR(100),";
    sqlStatement += "lTaskNumber INTEGER,";
    sqlStatement += "szTaskDescription VARCHAR(100),";
    sqlStatement += "szOtherActivityType VARCHAR(50),";
    sqlStatement += "lCodeNumber INTEGER,";
    sqlStatement += "nOtherAmount DECIMAL(15,2),";
    sqlStatement += "szMessageType VARCHAR(40),";
    sqlStatement += "szMessageText VARCHAR(10240),";
    sqlStatement += "szMessageDescription VARCHAR(80),";
    sqlStatement += "lDateRequestFrom INTEGER,";
    sqlStatement += "lDateRequestTo INTEGER,";
    sqlStatement += "lTimeRequestFrom INTEGER,";
    sqlStatement += "lTimeRequestTo INTEGER,";
    sqlStatement += "lMessageID INTEGER,";
    sqlStatement += "lDateRead INTEGER,";
    sqlStatement += "lTimeRead INTEGER,";
    sqlStatement += "szRequestApproved VARCHAR(10),";
    sqlStatement += "bFailureCount INTEGER,";
    sqlStatement += "lLocatDateProcessed INTEGER,";
    sqlStatement += "lLocalTimeProcessed INTEGER,";
    sqlStatement += "lDateSent INTEGER,";
    sqlStatement += "lTimeSent INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZTR)
    }
    catch (e) {
        alert(e.message)
        return
    }

}

function alterTCZTR(tx) {
    var sqlStatement;    
    
    try {
        tx.executeSql("ALTER TABLE TCztr RENAME TO old_TCztr", null, null, errorZTR)
    }
    catch (e) {

    }
    createTCZTR(tx)
    tx.executeSql("ALTER TABLE TCztr ADD nLatitude DECIMAL(8,6)", null, null, errorZTR);
    tx.executeSql("ALTER TABLE TCztr ADD nLongitude DECIMAL(8,6)", null, null, errorZTR);
    sqlStatement = "INSERT INTO TCztr(lZTR_SysId,lCEM_SysId,lCDP_SysId,lJOB_SysId,lASK_SysId,lOTA_SysId,lCEC_SysId,lDate,lTime,szType,szClockId,szEmployeeName,"
    sqlStatement += "szSupervisorClockId,szSupervisorName,lDepartmentNumber,szDepartment,lJobNumber,szJobDescription,lTaskNumber,szTaskDescription,"
    sqlStatement += "szOtherActivityType,lCodeNumber,nOtherAmount,szMessageType,szMessageText,szMessageDescription,lDateRequestFrom,lDateRequestTo,"
    sqlStatement += "lTimeRequestFrom,lTimeRequestTo,lMessageID,lDateRead,lTimeRead,szRequestApproved,bFailureCount,lLocatDateProcessed,lLocalTimeProcessed,"
    sqlStatement += "lDateSent,lTimeSent) SELECT "
    sqlStatement += "lZTR_SysId,lCEM_SysId,lCDP_SysId,lJOB_SysId,lASK_SysId,lOTA_SysId,lCEC_SysId,lDate,lTime,szType,szClockId,szEmployeeName,"
    sqlStatement += "szSupervisorClockId,szSupervisorName,lDepartmentNumber,szDepartment,lJobNumber,szJobDescription,lTaskNumber,szTaskDescription,"
    sqlStatement += "szOtherActivityType,lCodeNumber,nOtherAmount,szMessageType,szMessageText,szMessageDescription,lDateRequestFrom,lDateRequestTo,"
    sqlStatement += "lTimeRequestFrom,lTimeRequestTo,lMessageID,lDateRead,lTimeRead,szRequestApproved,bFailureCount,lLocatDateProcessed,lLocalTimeProcessed,"
    sqlStatement += "lDateSent,lTimeSent FROM old_TCztr"
    try {
        tx.executeSql(sqlStatement, null, function successInsert(tx) {
            tx.executeSql("DROP TABLE IF EXISTS old_TCztr", null, null, function errorDrop(tx, err) {
                displaySQLError("DROP TABLE IF EXISTS old_TCztr", err)
            })

        }, function errorInser(tx, err) {
            displaySQLError(sqlStatement,err)
        })
    }
    catch (e) {

    }
}

function errorZTR(tx, err) {
    displaySQLError("ZTR", err)
}

function errorSelectZTR(tx, err) {
    displaySQLError("ZTR", err)
}

function createTCZLC(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzlc(";
    sqlStatement += "lZLC_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "lDate INTEGER,";
    sqlStatement += "lBeginTime INTEGER,";
    sqlStatement += "lEndTime INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZLC)
    }
    catch (e) {
        alert(e.message)
        return
    }

}

function errorZLC(tx, err) {
    displaySQLError("ZLC", err)
}

function errorSelectZLC(tx, err) {
    displaySQLError("ZLC", err)
}

function createTCZVL(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzvl(";
    sqlStatement += "lZVL_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szLocationId VARCHAR(10),";
    sqlStatement += "nLatitude DECIMAL(8,6),";
    sqlStatement += "nLongitude DECIMAL(8,6))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZVL)
    }
    catch (e) {
        alert(e.message)
        return
    }

}

function errorZVL(tx, err) {
    displaySQLError("ZVL", err)
}

function errorSelectZVL(tx, err) {
    displaySQLError("ZVL", err)
}

function createTCZLG(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzlg(";
    sqlStatement += "lZLG_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szClockId VARCHAR(20),";
    sqlStatement += "szClockPassword VARCHAR(20),";
    sqlStatement += "lCEM_SysId INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZLG)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZLG(tx, err) {

    displaySQLError("ZLG", err)
}

function errorSelectZLG(tx, err) {

    displaySQLError("ZLG", err)
}

function createTCZDR(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzdr(";
    sqlStatement += "lZDR_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szControl VARCHAR(50),";
    sqlStatement += "szListItems VARCHAR(6000))";
    try {
        tx.executeSql(sqlStatement, null, null, errorZDR)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZDR(tx, err) {
    displaySQLError("ZDR", err)
}

function errorSelectZDR(tx, err) {
    displaySQLError("ZDR", err)
}


function createTCSWP(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCswp(";
    sqlStatement += "lCEM_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szEmployeeName VARCHAR(51),";
    sqlStatement += " bRetainRecord INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorSWP)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorSWP(tx, err) {

    displaySQLError("SWP", err)
}

function createTCZGP(tx) {    
    var sqlStatement;        
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzgp(";
    sqlStatement += "lCEM_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "szEmployeeName VARCHAR(51),";
    sqlStatement += "szClockId VARCHAR(20),";
    sqlStatement += "bRetainRecord INTEGER,";
    sqlStatement += "bSelected INTEGER)";
        try {
            tx.executeSql(sqlStatement, null, null, errorZGP)
        }
        catch (e) {
            alert(e.message)
            return
        }
}
function errorZGP(tx, err) {

    displaySQLError("ZGP", err)
}

function createTCZSC(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzsc(";
    sqlStatement += "lSHC_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "szEmployeeName VARCHAR(51),";
    sqlStatement += "szMessageType VARCHAR(41),";
    sqlStatement += "lDateRequested INTEGER,";
    sqlStatement += "lTimeRequestFrom INTEGER,";
    sqlStatement += "lTimeRequestTo INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZSC)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZSC(tx, err) {

    displaySQLError("ZSC", err)
}


function createTCZAV(tx) {
    var sqlStatement;
    sqlStatement = "CREATE TABLE IF NOT EXISTS TCzav(";
    sqlStatement += "lZAV_SysId INTEGER PRIMARY KEY AUTOINCREMENT,";
    sqlStatement += "lCEM_SysId INTEGER,";
    sqlStatement += "szDayOfWeek VARCHAR(11),";    
    sqlStatement += "bDayOfWeekNumber INTEGER,";
    sqlStatement += "lStartTimeOne INTEGER,";
    sqlStatement += "lStopTimeOne INTEGER,";
    sqlStatement += "lStartTimeTwo INTEGER,";
    sqlStatement += "lStopTimeTwo INTEGER,";
    sqlStatement += "lStartTimeThree INTEGER,";
    sqlStatement += "lStopTimeThree INTEGER,";
    sqlStatement += "lValidDateRangeFrom INTEGER,";
    sqlStatement += "lValidDateRangeTo INTEGER)";
    try {
        tx.executeSql(sqlStatement, null, null, errorZAV)
    }
    catch (e) {
        alert(e.message)
        return
    }
}

function errorZAV(tx, err) {

    displaySQLError("ZAV", err)
}


function deleteAndLoadLockout(tx) {
    if (zlcServiceResponse != "") {
        try {
            tx.executeSql("Delete From TCzlc", null, processZLC, function errorDeleteZLC(tx, err) {
                displaySQLError("Delete From TCzlc", err)
            });
        }
        catch (e) {

        }
    }
}

function processZLC(tx) {
    var TCzshRecord
    var currentResponse = zlcServiceResponse
    var myXML = $.parseXML(currentResponse)
    $(myXML).find("TCzlc").each(function () {
        TCzlcRecord = $(this)
        callAddZLC(tx, TCzlcRecord)
    })
    zlcServiceResponse = ""
}

function callAddZLC(tx, TCzlcRecord) {
    var sqlStatement
    sqlStatement = "Insert Into TCzlc(lCEM_SysId,lDate,lBeginTime,lEndTime) Values(" + TCzlcRecord.text() + ","
    sqlStatement += $(TCzlcRecord).attr('lDate') + "," + $(TCzlcRecord).attr('lBeginTime') + "," + $(TCzlcRecord).attr('lEndTime') + ")"
    try {
        tx.executeSql(sqlStatement, null, null, function errorInsertZLC(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) { }
}


function retriveMaxZTR(tx, result) {
    var sqlStatement = "SELECT MAX(lZTR_SysId) as maxZTR FROM TCztr"
    try {
        tx.executeSql(sqlStatement, null, retriveZTRBasedOnMax, function errorRetriveMaxZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function retriveZTRBasedOnMax(tx, result) {
    if (result.rows.item(0).maxZTR > 0) {
        retriveZTR(result.rows.item(0).maxZTR)
    }
}

function processTransactions() {
    var processTimeoutTimer
    if (processTransDelay) {
        clearTimeout(processTransDelay);
    }
    if ($("#lHeartBeatFrequency").val() == 0) {
        processTimeoutTimer = 5 * 60 * 1000
    }
    else {
        processTimeoutTimer = $("#lHeartBeatFrequency").val() * 60 * 1000
    }
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    db.transaction(loadZTR, errorZTR, null)
    processTransDelay = setTimeout(function () {
        processTransactions()
    }, processTimeoutTimer)
}

function loadZTR(tx) {
    var sqlStatement = "SELECT * From TCZTR WHERE bFailureCount < 3 and lDateSent = 0 and lTimeSent = 0"
    try {
        tx.executeSql(sqlStatement, null, processZTR, function errorLoadZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        })
    }
    catch (e) {
        alert(e.message)
    }
}

function processZTR(tx, results) {
    if (results.rows.length > 0) {
        for (var i = 0; i < results.rows.length; i++) {
            retriveZTR(results.rows.item(i).lZTR_SysId)
        }
    }
}


function retriveZTR(plZTR_SysId) {
    var sqlStatement = "SELECT * FROM TCztr WHERE lZTR_SysId = " + plZTR_SysId
    if (!db) {
        db = window.openDatabase("TCDBS", "", "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) { tx.executeSql(sqlStatement, null, BuildZTRXML, function errorSelectZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        }) })

    }
    catch (e) {
        alert(e.message)
    }
}


function BuildZTRXML(tx, result) {
    if (result.rows.length > 0) {
        var szXMLString = makeSoapHeader("PushTransaction", "AtlasClockService/")
        szXMLString += createElementString("szClockSerialNumber", $("#szAuthorization").val())
        szXMLString += createElementNumber("lSLA_SysId", authorizeSLA_SysId)
        szXMLString += createElementString("Action", result.rows.item(0).szType)
        szXMLString += "<TCztr "
        if (result.rows.item(0).lCEM_SysId) {
            szXMLString += 'lCEM_SysId="' + result.rows.item(0).lCEM_SysId + '" '
        }
        if (result.rows.item(0).lCDP_SysId) {
            szXMLString += 'lCDP_SysId="' + result.rows.item(0).lCDP_SysId + '" '
        }
        if (result.rows.item(0).lJOB_SysId) {
            szXMLString += 'lJOB_SysId="' + result.rows.item(0).lJOB_SysId + '" '
        }
        if (result.rows.item(0).lASK_SysId) {
            szXMLString += 'lASK_SysId="' + result.rows.item(0).lASK_SysId + '" '
        }
        if (result.rows.item(0).lOTA_SysId) {
            szXMLString += 'lOTA_SysId="' + result.rows.item(0).lOTA_SysId + '" '
        }
        if (result.rows.item(0).lCEC_SysId) {
            szXMLString += 'lCEC_SysId="' + result.rows.item(0).lCEC_SysId + '" '
        }
        if (result.rows.item(0).lDate) {
            szXMLString += 'lDate="' + result.rows.item(0).lDate + '" '
        }
        if (result.rows.item(0).lTime) {
            szXMLString += 'lTime="' + result.rows.item(0).lTime + '" '
        }
        if (result.rows.item(0).szClockId) {
            szXMLString += 'szClockId="' + result.rows.item(0).szClockId + '" '
        }
        if (result.rows.item(0).szEmployeeName) {
            szXMLString += 'szEmployeeName="' + result.rows.item(0).szEmployeeName + '" '
        }
        if (result.rows.item(0).szSupervisorClockId) {
            szXMLString += 'szSupervisorClockId="' + result.rows.item(0).szSupervisorClockId + '" '
        }
        if (result.rows.item(0).szSupervisorName) {
            szXMLString += 'szSupervisorName="' + result.rows.item(0).szSupervisorName + '" '
        }
        if (result.rows.item(0).lDepartmentNumber) {
            szXMLString += 'lDepartmentNumber="' + result.rows.item(0).lDepartmentNumber + '" '
        }
        if (result.rows.item(0).szDepartment) {
            szXMLString += 'szDepartment="' + result.rows.item(0).szDepartment + '" '
        }
        if (result.rows.item(0).lJobNumber) {
            szXMLString += 'lJobNumber="' + result.rows.item(0).lJobNumber + '" '
        }
        if (result.rows.item(0).szJobDescription) {
            szXMLString += 'szJobDescription="' + result.rows.item(0).szJobDescription + '" '
        }
        if (result.rows.item(0).lTaskNumber) {
            szXMLString += 'lTaskNumber="' + result.rows.item(0).lTaskNumber + '" '
        }
        if (result.rows.item(0).szTaskDescription) {
            szXMLString += 'szTaskDescription="' + result.rows.item(0).szTaskDescription + '" '
        }
        if (result.rows.item(0).szOtherActivityType) {
            szXMLString += 'szOtherActivityType="' + result.rows.item(0).szOtherActivityType + '" '
        }
        if (result.rows.item(0).lCodeNumber) {
            szXMLString += 'lCodeNumber="' + result.rows.item(0).lCodeNumber + '" '
        }
        if (result.rows.item(0).nOtherAmount) {
            szXMLString += 'nOtherAmount="' + result.rows.item(0).nOtherAmount + '" '
        }
        if (result.rows.item(0).szMessageType) {
            szXMLString += 'szMessageType="' + result.rows.item(0).szMessageType + '" '
        }
        if (result.rows.item(0).szMessageText) {
            szXMLString += 'szMessageText="' + result.rows.item(0).szMessageText + '" '
        }
        if (result.rows.item(0).szMessageDescription) {
            szXMLString += 'szMessageDescription="' + result.rows.item(0).szMessageDescription + '" '
        }
        if (result.rows.item(0).lDateRequestFrom) {
            szXMLString += 'lDateRequestFrom="' + result.rows.item(0).lDateRequestFrom + '" '
        }
        if (result.rows.item(0).lDateRequestTo) {
            szXMLString += 'lDateRequestTo="' + result.rows.item(0).lDateRequestTo + '" '
        }
        if (result.rows.item(0).lTimeRequestFrom) {
            szXMLString += 'lTimeRequestFrom="' + result.rows.item(0).lTimeRequestFrom + '" '
        }
        if (result.rows.item(0).lTimeRequestTo) {
            szXMLString += 'lTimeRequestTo="' + result.rows.item(0).lTimeRequestTo + '" '
        }
        if (result.rows.item(0).lMessageID) {
            szXMLString += 'lMessageID="' + result.rows.item(0).lMessageID + '" '
        }
        if (result.rows.item(0).lDateRead) {
            szXMLString += 'lDateRead="' + result.rows.item(0).lDateRead + '" '
        }
        if (result.rows.item(0).lTimeRead) {
            szXMLString += 'lTimeRead="' + result.rows.item(0).lTimeRead + '" '
        }
        if (result.rows.item(0).szRequestApproved) {
            szXMLString += 'szRequestApproved="' + result.rows.item(0).szRequestApproved + '" '
        }
        if (result.rows.item(0).nLatitude) {
            szXMLString += 'nLatitude="' + result.rows.item(0).nLatitude + '" '
        }
        if (result.rows.item(0).nLongitude) {
            szXMLString += 'nLongitude="' + result.rows.item(0).nLongitude + '" '
        }
        if (result.rows.item(0).bWeekDayOnly || result.rows.item(0).bWeekDayOnly == 0) {
            szXMLString += 'bWeekDayOnly="' + result.rows.item(0).bWeekDayOnly + '" '
        }
        if (result.rows.item(0).bNoHoliday || result.rows.item(0).bNoHoliday == 0) {
            szXMLString += 'bNoHoliday="' + result.rows.item(0).bNoHoliday + '" '
        }
        if (result.rows.item(0).lReviewDateFrom) {
            szXMLString += 'lReviewDateFrom="' + result.rows.item(0).lReviewDateFrom + '" '
        }
        if (result.rows.item(0).lReviewDateTo) {
            szXMLString += 'lReviewDateTo="' + result.rows.item(0).lReviewDateTo + '" '
        }
        if (result.rows.item(0).szTimecardNote) {
            szXMLString += 'szTimecardNote="' + result.rows.item(0).szTimecardNote + '" '
        }
        if (result.rows.item(0).lUTCTime) {
            szXMLString += 'lUTCTime="' + result.rows.item(0).lUTCTime + '" '
        }
        if (result.rows.item(0).lUTCDate) {
            szXMLString += 'lUTCDate="' + result.rows.item(0).lUTCDate + '" '
        }
        if (result.rows.item(0).lCEM_SysId_SwapWith) {
            szXMLString += 'lCEM_SysId_SwapWith="' + result.rows.item(0).lCEM_SysId_SwapWith + '" '
        }
        if (result.rows.item(0).lSHC_SysId) {
            szXMLString += 'lSHC_SysId="' + result.rows.item(0).lSHC_SysId + '" '
        }
        if (result.rows.item(0).szDayOfWeek) {
            szXMLString += 'szDayOfWeek="' + result.rows.item(0).szDayOfWeek + '" '
        }
        if (result.rows.item(0).bDayOfWeekNumber) {
            szXMLString += 'bDayOfWeekNumber="' + result.rows.item(0).bDayOfWeekNumber + '" '
        }
        if (result.rows.item(0).lStartTimeOne) {
            szXMLString += 'lStartTimeOne="' + result.rows.item(0).lStartTimeOne + '" '
        }
        if (result.rows.item(0).lStopTimeOne) {
            szXMLString += 'lStopTimeOne="' + result.rows.item(0).lStopTimeOne + '" '
        }
        if (result.rows.item(0).lStartTimeTwo) {
            szXMLString += 'lStartTimeTwo="' + result.rows.item(0).lStartTimeTwo + '" '
        }
        if (result.rows.item(0).lStopTimeTwo) {
            szXMLString += 'lStopTimeTwo="' + result.rows.item(0).lStopTimeTwo + '" '
        }
        if (result.rows.item(0).lStartTimeThree) {
            szXMLString += 'lStartTimeThree="' + result.rows.item(0).lStartTimeThree + '" '
        }
        if (result.rows.item(0).lStopTimeThree) {
            szXMLString += 'lStopTimeThree="' + result.rows.item(0).lStopTimeThree + '" '
        }
        if (result.rows.item(0).lValidDateRangeFrom) {
            szXMLString += 'lValidDateRangeFrom="' + result.rows.item(0).lValidDateRangeFrom + '" '
        }
        if (result.rows.item(0).lValidDateRangeTo) {
            szXMLString += 'lValidDateRangeTo="' + result.rows.item(0).lValidDateRangeTo + '" '
        }
        szXMLString += ">" + result.rows.item(0).lZTR_SysId + "</TCztr>"
        szXMLString += makeSoapFooter("PushTransaction")
        var szXMLString2 = szXMLString.replace(/&/g, "&amp;")
        szXMLString = encodeURIComponent(szXMLString2)
        var szURL = $("#szServerProtocol").val().toLowerCase() + "://" + $("#szServerDomain").val().toLowerCase() + ":" + $("#lServerPort").val() + "/TC_WebService/AtlasServiceRequest.asmx/PushTransaction"
        try {
            $.ajax({
                type: "POST",
                url: szURL,
                dataType: "xml",
                data: szXMLString,
                processData: false,
                crossDomain: true,
                async: true,
                timeout: 10000,
                success: webServiceTransSuccess,
                error: webServiceTransError
            });
        }
        catch (e) {

        }
    }
}

function webServiceTransError(data, status, request) {

    if (data.statusText != "timeout" && data.statusText != "Service Unavailable") {
        $("#dialogHeader").text("Punch Successful")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        $("#dialogMessage").text("Punch Queued/Still Queued For Server.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
    }
}

function webServiceTransSuccess(data) {
    var returnedXML = XMLToString(data)
    ServiceResponse = returnedXML
    ztrServiceResponse = ServiceResponse
    var sqlStatement = ''
    var szAction = $(ztrServiceResponse).find("szAction").text();
    var szError = $(ztrServiceResponse).find("szError").text();
    var lReturnedValue = $(ztrServiceResponse).find("lZTR_SysId").text();
    if (szError == "") {
        sqlStatement = "UPDATE TCZTR SET lDateSent = " + clarionToday() + ", lTimeSent = " + clarionClock() + " WHERE lZTR_SysId = " + lReturnedValue
    }
    else {
        sqlStatement = "DELETE FROM TCZTR WHERE lZTR_SysId = " + lReturnedValue
        if (szAction == "Message") {
            $("#dialogHeader").text("Schedule Swap Failed")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text("Your schedule swap request failed because neither you nor the swap with employee have schedule for the date requested.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
        }
        else {
            $("#dialogHeader").text("Schedule Swap Approval Failed")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text("Your schedule swap approval failed because the swap with employee and/or the supervisor has not approved the request yet.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
        }
    }
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    try {
        db.transaction(function (tx) { tx.executeSql(sqlStatement, null, successSendZTR, function errorUpdateZTR(tx, err) {
            displaySQLError(sqlStatement, err)
        }) })
    }
    catch (e) {
        alert(e.message)
    }
}

function successSendZTR(tx) {
    var pageId = $.mobile.activePage.attr("id")
    if (pageId == "Messages") {
        if (bReloadMessages == true) {
            bReloadMessages = false
            heartBeat("DATA UPDATE MESSAGES")
            if (ServiceResponse != "false") {
                loadSLC()
            }
            else {
                db.transaction(loadMessages, errorZEO, null)
            }
        }
    }
    if (pageId == "Availability") {
        if (bReloadMessages == true) {
            bReloadMessages = false
            heartBeat("DATA UPDATE AVAILABILITY")
            if (ServiceResponse != "false") {
                loadSLC()
            }
            else {
                db.transaction(loadAvailability, errorZAV, null)
            }
        }
    }

}

function fulldataUpdateLogin() {
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    db.transaction(checkLoginZCN, null, null)
}

function checkLoginZCN(tx) {
    var sqlStatement;
    sqlStatement = 'SELECT COUNT(*) as myCount FROM TCzcn'
    try {
        tx.executeSql(sqlStatement, null, function returnLoginZCNCount(tx, result) {
            if (result.rows.item(0).myCount == 0) {
                return false
            }
            else {
                tx.executeSql('Select * From TCzcn', null, function primeLoginSetupData(tx, result) {
                    $("#lSDV_SysId").val(result.rows.item(0).lSDV_SysId)
                    $("#lCEM_SysId").val(result.rows.item(0).lCEM_SysId)
                    $("#lSLA_SysId").val(result.rows.item(0).lSLA_SysId)
                    $("#szAuthorization").val(result.rows.item(0).szAuthorization)
                    $("#szClockId").val(result.rows.item(0).szClockId)
                    $("#szClockPassword").val(result.rows.item(0).szClockPassword)
                    authorizeSLA_SysId = $("#lSLA_SysId").val()
                    authorizeCEM_SysId = $("#lCEM_SysId").val()
                    authorizeSDV_SysId = $("#lSDV_SysId").val()
                    checkForFullDataUpdate()
                }, function errorSelect(tx, err) {
                    displaySQLError("Select * From TCzcn", err) })
            }

        }, function errorSelect(tx, err) {
            displaySQLError('SELECT COUNT(*) as myCount FROM TCzcn', err)
        })
    }
    catch (e) {
        alert(e.message)
    }

}


function fulldataUpdate() {
    var heartBeatHeader
    if (authorizeSLA_SysId != 0 && authorizeCEM_SysId != 0 && authorizeSDV_SysId != 0) {
        fullUpdate = true
        szLastFullUpdateCommand = ""
        mycount = 0
        hideMenuItems()
        $.mobile.loading( 'show', {
            text: $.mobile.loader.prototype.options.text,
            textVisible: $.mobile.loader.prototype.options.textVisible,
            theme: $.mobile.loader.prototype.options.theme,
            textonly: false,
            html: ""
        })
        processTransactions();
        zcnServiceResponse = ""
        heartBeatHeader = createHeartBeatHeader("DATA UPDATE CONFIGURATION")
        fullUpdatehWebService(heartBeatHeader.szXMLString, heartBeatHeader.szURL, "DATA UPDATE CONFIGURATION")
    }
}

function deleteUserData() {
    authorizeSLA_SysId = 0
    authorizeCEM_SysId = 0
    authorizeSDV_SysId = 0
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzem", null, null, function errorDeleteZEM(tx, err) {
        displaySQLError("DELETE FROM TCzem", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzec", null, null, function errorDeleteZEC(tx, err) {
        displaySQLError("DELETE FROM TCzec", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzeo", null, null, function errorDeleteZEO(tx, err) {
        displaySQLError("DELETE FROM TCzeo", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzlc", null, null, function errorDeleteZLC(tx, err) {
        displaySQLError("DELETE FROM TCzlc", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzsh", null, null, function errorDeleteZSH(tx, err) {
        displaySQLError("DELETE FROM TCzsh", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzea", null, null, function errorDeleteZEA(tx, err) {
        displaySQLError("DELETE FROM TCzea", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzts", null, null, function errorDeleteZTS(tx, err) {
        displaySQLError("DELETE FROM TCzts", err)
    }) })
    db.transaction(function (tx) { tx.executeSql("DELETE FROM TCzvl", null, null, function errorDeleteZVL(tx, err) {
        displaySQLError("DELETE FROM TCzvl", err)
    }) })
}

function validateLogin() {
    bReloadPage = true
    $("#dialogHeader").text("Error Message")
    $("#YesNoblock").css("display", "none")
    $("#Closeblock").css("display", "")
    if (!$.trim($("#szLoginClockId").val())) {
        szDialogReturnTo = "#Login"
        $("#dialogMessage").text("Clock Id is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szLoginClockId"        
        return false
    }
    if (!$.trim($("#szLoginClockPassword").val())) {
        szDialogReturnTo = "#Login"
        $("#dialogMessage").text("Clock Password is Required.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szLoginClockPassword"        
        return false
    }
    //heartBeat("DATA UPDATE LOGIN")
    if (!db) {
        db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
    }
    var sqlStatement = "SELECT lCEM_SysId,bRetainRecord FROM TCzlg where szClockId = '" + $("#szLoginClockId").val()
    sqlStatement += "' and szClockPassword = '" + $("#szLoginClockPassword").val() + "'"
    db.transaction(function (tx) { tx.executeSql(sqlStatement, null, successGetZLG, function errorSelectZLG(tx, err) {
        displaySQLError(sqlStatement, err)
    }) })
}

function successGetZLG(tx, result) {
    if (result.rows.length > 0) {
        if (result.rows.item(0).lCEM_SysId > 0) {
            if (!db) {
                db = window.openDatabase("TCDBS", '', "Atlas Mobile", 200000);
            }
            if ($("#szLoginClockId").val() != "" && $("#szLoginClockPassword").val() != "") {
                var sqlStatement = "UPDATE TCzcn SET szClockId = '" + $("#szLoginClockId").val()
                sqlStatement += "', szClockPassword = '" + $("#szLoginClockPassword").val() + "'"
                tx.executeSql(sqlStatement, null, successLogin, function errorUpdateZCN(tx, err) {
                    displaySQLError(sqlStatement, err)
                })
            }
        }
        else {
            if (loginPunchClicked == false) {
                szDialogReturnTo = "#Login"
            }
            else {
                szDialogReturnTo = "#Home"
            }
            bReloadPage = true
            $("#dialogHeader").text("Error Message")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text("Invalid Login Information.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szLoginClockId"
            return false
        }
    }
    else {
        if (loginPunchClicked == false) {
            szDialogReturnTo = "#Login"
        }
        else {
            szDialogReturnTo = "#Home"
        }
        bReloadPage = true
        $("#dialogHeader").text("Error Message")
        $("#YesNoblock").css("display", "none")
        $("#Closeblock").css("display", "")
        $("#dialogMessage").text("Invalid Login Information.")
        $.mobile.changePage('#dialogPage', { transition: 'flip' });
        szFocusField = "szLoginClockId"
        return false
    }
}

function successLogin(tx) {
    $("#szClockId").val($("#szLoginClockId").val())
    $("#szClockPassword").val($("#szLoginClockPassword").val())
    authenticateAfterSave(tx);
    if (authorizeSLA_SysId != 0 && authorizeSLA_SysId != "" && authorizeCEM_SysId != 0 && authorizeCEM_SysId != "") {
        if (loginPunchClicked == true) {
            $("#Home_Punch").click()
        }
        else {
            $(":mobile-pagecontainer").pagecontainer("change", "#Home")
        }
    }
    else {
        if (loginPunchClicked == true) {
            try {
                tx.executeSql("Delete From TCzem", null, sucessDeleteZEMForZLG, function errorDeleteZEM(tx, err) {
                    displaySQLError("Delete From TCzem", err)
                });
            }
            catch (e) {

            }
        }
        else {
            bReloadPage = true
            $("#dialogHeader").text("Error Message")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text("Error Conecting to Server.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szLoginClockId"
            return false
        }
    }
}

function sucessDeleteZEMForZLG(tx) {
    var sqlStatement = "Insert Into TCzlg(lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,szLastPunchDepartment,"
    sqlStatement += "szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForWeek,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,bDisableClockOut,lCDP_SysId,"
    sqlStatement += "szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber) select "
    sqlStatement += "lCEM_SysId,lSUP_SysId,szEmployeeName,szClockId,szClockPassword,lLastPunchDate,lLastPunchTime,szLastPunchType,szLastPunchDepartment,"
    sqlStatement += "szLastPunchJob,szLastPunchTask,nHoursForDay,nHoursForWeek,nHoursForPayPeriod,lLastInPunchDate,lLastInPunchTime,bDisableClockOut,lCDP_SysId,"
    sqlStatement += "szDepartment,lDepartmentNumber,lJOB_SysId,szJobDescription,lJobNumber,lASK_SysId,szTaskDescription,lTaskNumber from TCzlg where "
    sqlStatement += "szClockId = '" + $("#szLoginClockId").val() + "' and szClockPassword = '" + $("#szLoginClockPassword").val() + "'"
    try {
        tx.executeSql(sqlStatement, null, function SuccessAddZEM(tx) {
            $("#Home_Punch").click()
        }, function errorUpdateZLG(tx, err) {
            bReloadPage = true
            $("#dialogHeader").text("Error Message")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text("Error Conecting to Server.")
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            szFocusField = "szLoginClockId"
            return false
        })
    }
    catch (e) {

    }
}

