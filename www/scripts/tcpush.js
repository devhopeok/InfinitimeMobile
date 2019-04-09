var szPushDeviceId = ""

function setPushServices() {
    
    try{
        var push = PushNotification.init({
            android: {
                senderID: "1028160158877",
                vibrate: "true"
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true",
            }
        });
    }
    catch (err) {
        txt = "There was an error on this page.\n\n";
        txt += "Error description: " + err.message + "\n\n";
        alert(txt);
    }


    push.on('registration', function (data) {
        if (data.registrationId.length > 0) {
            szPushDeviceId = data.registrationId;
            $("#szPushDeviceId").val(szPushDeviceId)
        }
    });

    push.on('notification', function (data) {
        if (data.additionalData.foreground == true) {
            $("#dialogHeader").text("Push Notification")
            $("#YesNoblock").css("display", "none")
            $("#Closeblock").css("display", "")
            $("#dialogMessage").text(data.message)
            $.mobile.changePage('#dialogPage', { transition: 'flip' });
            //if (data.additionalData.tickerText == "Message") {
            //    $.mobile.changePage('#Messages', { transition: 'flip' });
            //}
        }
        else {
            //if (data.additionalData.tickerText == "Message") {
            //    $.mobile.changePage('#Messages', { transition: 'flip' });
            //}
        }
    });

    push.on('error', function (e) {
        alert(e.message);
    });
}


