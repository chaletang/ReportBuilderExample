var callBack;

$(document).ready(createDialog);

function createDialog() {
    jQuery.MessageBox = $("<div style='padding:10px;'><Label id='lblMessage'/><br><br><Label id='lblDetails'/><br><br><center><div style='float: left'><button id='btnDailogOK' class='btn orange' type='button'><i class='icon-okk'></i>OK</button></div><div style='float: left;margin-left: 10px'><button id='btnDailogCANCEL' class='btn orange' type='button'><i class='icon-removee'></i>CANCEL</button></div></center></div>")
    .dialog({
        autoOpen: false,
        modal: true,
        title: 'SMART® Solutions',
        open: function(){
            $(this).closest('.ui-dialog').find(".ui-dialog-titlebar-close").hide();
        },
        close: function () {            
            $(this).dialog('destroy').remove();
        },
        closeOnEscape: false,
        zIndex: 10009
    });

    $.MessageBox.find('#btnDailogOK').bind({
        click: function () {
            $.MessageBox.dialog('close');
            if (null != callBack) {
                callBack.success();
            }
        }
    });

    $.MessageBox.find('#btnDailogCANCEL').bind({
        click: function () {
            $.MessageBox.dialog('close');
            if (null != callBack) {
                callBack.fail();
            }
        }
    });
}

function showConfirm(message, callBackMe, okbtnValue, cancelbtnValue) {
    hideBusyIndicator();
    callBack = null;
    if (okbtnValue != null && okbtnValue != undefined && okbtnValue != '') {
        $.MessageBox.find("#btnDailogOK").val(okbtnValue);
    }
    if (cancelbtnValue != null && cancelbtnValue != undefined && cancelbtnValue != '') {
        $.MessageBox.find("#btnDailogCANCEL").val(cancelbtnValue);
    }

    $.MessageBox.find("#lblDetails").css("display", "none");
    $.MessageBox.find("#lblMessage").text(message);
    $.MessageBox.dialog('open');
    callBack = callBackMe;
    return true;
}

function showMessageBox(message, details) {
    showMessage(message, details);
}

function showMessageBoxWithCallBack(message, details, callBackMe) {
    showMessage(message, details);
    callBack = callBackMe;
    return true;
}

function showMessage(message, details) {
    hideBusyIndicator();
    createDialog();
    callBack = null;
    
    $.MessageBox.find("#btnDailogOK").val('OK');
    $.MessageBox.find("#btnDailogCANCEL").css('display', 'none');

    if (message != null && message != undefined && message != '') {
        $.MessageBox.find("#lblMessage").text(message);
    }
    else {
        $.MessageBox.find("#lblMessage").text("");
    }
    if (details != null && details != undefined && details != '') {
        $.MessageBox.find("#lblDetails").text(details);
    }
    else {
        $.MessageBox.find("#lblDetails").text("");
    }
    $.MessageBox.dialog('open');

}

function getBaseUrl() {
    return $('#hdnBaseUrl').val();
}
function getServerDate() {
    return new Date($('#hdnServerDate').val());
}
function handleErrorAndSessionTimeout(jqXHR, textStatus, errorThrown) {
    hideBusyIndicator();
    try
    {        
        if (jqXHR.status == "504") {       
            showMessageBoxWithCallBack('Your current login session is expired.', '', sessionExpiredCallback);
        }
        else if (jqXHR.status == "404") {
            window.location.href = getBaseUrl() + 'Error/Index';
            //showGenericSlidingMessage({ Type: $.MessageType.Error, Text: 'An error occurred while processing your request. Please contact administrator.' });
        }
        else if (checkSessionForResponse(jqXHR.responseText)) {
            var errorMessage = " textStatus: " + textStatus + " errorThrown: " + errorThrown;
            showGenericSlidingMessage({ Type: $.MessageType.Error, Text: errorMessage });
        }
    }
    catch (e) {
        alert(e);
    }
}

function checkSessionForResponse(data) {
    if (data.indexOf('<div id="dvBody">') > 0) {
        handleErrorAndSessionTimeout({ status: '504' });
        return false;
    }
    else {
        return true;
    }
}

function checkSessionForDialog(uiPopup) {
    var htmlBody = $(uiPopup).closest('.ui-dialog').find("#dvBody");
    if (htmlBody != null && htmlBody.length > 0) {
        $(uiPopup).closest('.ui-dialog').find('.ui-icon-closethick').last().trigger('click');
        handleErrorAndSessionTimeout({ status: '504' });
    }
}

var sessionExpiredCallback = {
    success: function () {
        showBusyIndicator('Redirecting to login, please wait...');
        var redirectUrl = getBaseUrl();
        var returnUrl = getQueryStringParams("ReturnUrl");
        if (returnUrl != undefined) {
            if (returnUrl.indexOf('LogOff') == -1) {
                redirectUrl += '?ReturnUrl=' + returnUrl;
            }
        }
        else {
            var currentLocation = window.location.pathname;
            currentLocation = currentLocation.replace(redirectUrl, '');
            redirectUrl += '?ReturnUrl=' + currentLocation;
        }
        //var mer_window = window.open(redirectUrl, '_parent', 'toolbar=1,location=1,directories=1,scrollbars=1,resizable=1,status=1,menubar=1');
        //if (typeof mer_window === "object") {
        //    mer_window.blur();
        //}
        window.location.href = redirectUrl;
    }
};