(function ($) {
    $.fn.extend({
        collapsiblePanel: function (hideSiblings) {
            $(this).each(function () {
                var self = this;
                var indicator = $(self).find('.ui-expander').first();
                var header = $(self).find('.group-box-header-click').first();
                var content = $(self).find('.group-box-content').first();
                if (content.is(':visible')) {
                    indicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
                } else {
                    indicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-s');
                }
                header.unbind("click").bind("click", function () {
                    //content.slideToggle(200, function () {
                    if (content.is(':visible')) {
                        content.hide();
                        indicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
                    } else {
                        content.show();
                        indicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-s');
                    }


                    if (hideSiblings != undefined && hideSiblings == true) {
                        //when header is clicked, identify similar headers in the page and collapse it as well

                        var currentBucketName = $(self).attr('data-bucket-name');
                        if (currentBucketName != "") {
                            // if children found, then collapse expand is similarly
                            var divIdentifierTag = 'div[data-bucket-name="' + currentBucketName + '"]';

                            $(divIdentifierTag).each(function () {
                                // since the main selected header is already collapsed,  exclude that header by knowing the id
                                if ($(this).attr('id') != $(self).attr('id')) {

                                    $('.collapse-panel').css("clear", "both");
                                    var eachIndicator = $(this).find('.ui-expander').first();
                                    var eachHeader = $(this).find('.group-box-header-click').first();
                                    var eachContent = $(this).find('.group-box-content').first();
                                    if (eachContent.is(':visible')) {
                                        eachIndicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
                                    } else {
                                        eachIndicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-s');
                                    }
                                    //eachContent.slideToggle(200, function () {
                                    if (eachContent.is(':visible')) {
                                        eachContent.hide();
                                        eachIndicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
                                    } else {
                                        eachContent.show();
                                        eachIndicator.removeClass('ui-icon-triangle-1-e ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-s');
                                    }
                                    //});

                                }
                            });


                        }
                    }

                    //});
                });
            });
        }
    });
})(jQuery);