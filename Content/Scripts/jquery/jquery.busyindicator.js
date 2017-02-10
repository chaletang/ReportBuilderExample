$(document).ready(function () {    
    var $busyIndicator = $("<div id='busyIndicator' style='padding: 12px; background-color:Gray;'><center><img id='imgBusyIndicator' alt='busy indicator'/></center></div>")
    .dialog({
        autoOpen: false,
        open: function (event, ui) {
            //$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
            $(this).closest('.ui-dialog').find(".ui-dialog-titlebar").hide();
            $(this).closest('.ui-dialog').find(".ui-widget-content").css("box-shadow", "0 0 0px #4E4E4E").css("background-color", "Gray").css("height", "20px");
            $(this).closest('.ui-dialog').css("border-radius", "0px").css("box-shadow", "0 0 0px #4E4E4E").css("height", "40px");
        },
        modal: false,
        height: '40',
        width: '50',
        resizable: false
    });
});

function showBusyIndicator(message) {
    $("#dvSlidingMessageControl").hide();
    $('#imgBusyIndicator').attr('src', getBaseUrl() + 'content/Images/wait.gif');
    addModalOverlay();
    $('#busyIndicator').dialog('open');
}

function hideBusyIndicator() {
    $(".modalOverlay").remove();
    $('#busyIndicator').dialog('close');
    var licenseMessage = $.trim($('#divSlidingAlert').text());
    if (licenseMessage !== '' && $.trim($('#dvSlidingMessageControl').find(".notice-text").text()) === '') {
        showGenericSlidingMessage($.parseJSON(licenseMessage), false);
        $('#divSlidingAlert').remove();
    }
}

function addModalOverlay() {
    $("#dvBody").append('<div class="modalOverlay">');
    $('.ui-dialog[aria-describedby="busyIndicator"]').css('z-index', $('.ui-dialog').css('z-index') + 1);
    $('.modalOverlay').css('z-index', $('.ui-dialog[aria-describedby="busyIndicator"]').css('z-index') - 1);
}
