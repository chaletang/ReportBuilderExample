; (function (factory) {

    window.smart = {} || window.smart;
    window.smart.reportBuilder = {} || window.smart.reportBuilder;
    factory(window.smart.reportBuilder);

}
(function (reportBuilderContainer) {
    /* 
    some params for layout size 
    */
    reportBuilderContainer.serviceMode = 0;
    reportBuilderContainer.northDefaultSize = 90,
    reportBuilderContainer.eastMaxSize = 280,
    reportBuilderContainer.eastMinSize = 36,
    /* 
    function:init Layout
    */
    reportBuilderContainer.initLayout = function () {
        var height = $(window).height();
        $("#westRegion").height(height - reportBuilderContainer.northDefaultSize);
        $("#centerRegion").height(height - reportBuilderContainer.northDefaultSize);
        $("#westRegion .westViewTab").height(height - reportBuilderContainer.northDefaultSize);

    };
    /* 
    serviceContent
    */
    reportBuilderContainer.serviceContent = {
        status: false,
        content: null
    };
    /* 
    function:serviceCall
    */
    reportBuilderContainer.serviceCall = function (url, action, cb) {
        $.ajax({
            url: url,
            type: action,
            async: false,
            data: {},
            dataType: 'json',
            timeout: 5000,
            error: function () {
                reportBuilderContainer.serviceContent.status = false;
                reportBuilderContainer.popUpMessage("Sorry", "Please try again later.", "Some error in the reportBuilderContainer.");
            },
            success: function (result) {
                reportBuilderContainer.serviceContent.status = true;
                reportBuilderContainer.serviceContent.content = result;
                if (cb && typeof cb === 'function') {
                    cb.call(result); // And then call the callback if appropriate.
                }
            }
        });
    };
    /* 
    function:event Bind
    */
    reportBuilderContainer.eventBind = {
        //json for subject dialog
        dialogJSON: [],
        //json for filter dialog
        filterJSON: [],
        //json for filter dialog saved
        filterResultJSON: [],
        //json for chart tab fields
        chartTabJSON: [],
        //array for field box row items
        rowsArray: [],
        //array for field box data items
        seriesArray: [],
        //array for field box column items
        columnsArray: [],
        //array for field box filter items
        filtersArray: [],
        //array for chart tabs
        tabIDArray: [],
        //array for current chart
        currentChart: null,
        //array for current grid
        currentGrid: null,
        //flag for grid property change
        changeGridPropertyFlag: false,
        /* 
        function:initialize
        */
        initialize: function () {},
        /* 
        function:bind Events
        */
        bindEvents: function () {
            reportBuilderContainer.eventBind.bindTempChartPaneEvent();
            reportBuilderContainer.eventBind.bindTopToolBarEvents();
            reportBuilderContainer.eventBind.bindTopToolBarSubBtnEvents();
            reportBuilderContainer.eventBind.bindChartTabPaneHeightCalEvent();
            reportBuilderContainer.eventBind.bindTopToolBarHelpInfoEvents();
            reportBuilderContainer.eventBind.bindPropertyPaneDockAndUndockWidthCalEvent();
            reportBuilderContainer.eventBind.bindSubjectViewTabEvent();
            reportBuilderContainer.eventBind.bindViewsEvents();
            reportBuilderContainer.eventBind.bindLayoutSubjectToggleEvent();
            reportBuilderContainer.eventBind.bindLayoutSubjectSelectEvent();
            reportBuilderContainer.eventBind.bindLayoutSubjectChangeEvent();
            reportBuilderContainer.eventBind.bindSubjectDialogEvents();
            reportBuilderContainer.eventBind.bindPropertyPaneEvent();
            reportBuilderContainer.eventBind.bindWindowResizeEvent();
            reportBuilderContainer.eventBind.bindLayoutUpdateChartButton();
            reportBuilderContainer.eventBind.bindPrintEvent();
        },
        /*
        Function:Add one temp container to keep the initialized chartMainPane for add new tab function.
        */
        bindTempChartPaneEvent: function () {
            var html = $("#chartMainPane").html();
            $("#tempChartTabPaneContainer").html(html);
        },
        /*
        Function:TopToolBarEvents.
        */
        bindTopToolBarEvents: function () {
            //To Bind ToolBar Event
            $("html").unbind("click").bind("click", function (e) {
                if (!$(e.target).parents().hasClass("bar-inner")) {
                    reportBuilderContainer.eventBind.clearActiveToolBarButtons();
                }
            });

            //toolbar button
            $("#topToolBar a.toolBtn").unbind("click").bind("click", function (e) {
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });

            //fileButton
            $("#fileButtons .fileOption > a.toolBtn").unbind("click").bind("click", function (e) {  
                var $fileOption = $("#file_new.fileOption").find(".fileOptionItems");
                if ($fileOption.hasClass("active")) {
                    $fileOption.removeClass("active");
                }
                else {
                    reportBuilderContainer.eventBind.clearActiveToolBarButtons();
                    $fileOption.addClass("active");
                }
            });

            //tabSwitchButton
            $("#tabSwitchButtons .tabSwitchOption > a.toolBtn").unbind("click").bind("click", function (e) {    
                var $switchOption = $(".tabSwitchOption").find(".tabSwitchOptionItems");
                if ($switchOption.hasClass("active")) {
                    $switchOption.removeClass("active");
                    reportBuilderContainer.eventBind.bindToolBarTabSwitchExRevertEvent();
                }
                else {
                    reportBuilderContainer.eventBind.clearActiveToolBarButtons();
                    $switchOption.addClass("active");
                }
            });

            //viewModalButton
            $("#viewModalButtons .viewModalOption > a.toolBtn").unbind("click").bind("click", function (e) {
                var $viewModal=$("#viewModalButtons .viewModalOption .viewModalOptionItems");
                if ($viewModal.hasClass("active")) {
                    $viewModal.removeClass("active");     
                }
                else {
                    reportBuilderContainer.eventBind.clearActiveToolBarButtons();
                    $viewModal.addClass("active");
                }
                
            });

            //openFileButton
            $("#file_open").unbind("click").bind("click", function (e) {
                if ($("#chartMainPane").hasClass("hide") && !$("#chartMainPane").hasClass("activated")) {
                    $(".newTab").trigger("click");
                }
                else if ($("#chartMainPane").hasClass("hide") && $("#chartMainPane").hasClass("activated")) {
                    $("#switchButton").trigger("click");
                    $("#chartMainPane .addTabButton").trigger("click");
                }
                else if ($("#chartMainPane").hasClass("activated") && !$("#chartMainPane").hasClass("hide")) {
                    $("#chartMainPane .addTabButton").trigger("click");
                }
                reportBuilderContainer.eventBind.bindOpenChartViewEvent();
                reportBuilderContainer.eventBind.readLocalChartFile();
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });

            //saveFileButton
            $("#file_save").unbind("click").bind("click", function (e) {
                var $showChart = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
                var tabid = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").attr("id");
                if ($.inArray(tabid, reportBuilderContainer.eventBind.tabIDArray) != -1) {
                    $.each(reportBuilderContainer.eventBind.chartTabJSON, function (key, value) {
                        if (tabid == value.TabID) {
                            var chartstring = JSON.stringify(value);
                            reportBuilderContainer.eventBind.createTestChartFile(chartstring);
                        }
                    });
                }
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });

            //switchReportAndViewButton
            $("#switchButton").unbind("click").bind("click", function (e) {
                if ($("#chartMainPane").hasClass("activated") && $("#chartMainView").hasClass("activated")) {
                    if ($("#chartMainPane").hasClass("hide") && !$("#chartMainView").hasClass("hide")) {
                        $("#chartMainPane").removeClass("hide");
                        $("#chartMainView").addClass("hide");

                        //Show property Pane for ChartTab
                        $("#propertyPanel").removeClass("hide");
                        if ($(".propertyArrow").hasClass("fa-arrow-circle-right")) {
                            $(".propertyArrow").removeClass("fa-arrow-circle-right").addClass("fa-arrow-circle-left").trigger("click");
                        }
                        else {
                            $(".propertyArrow").addClass("fa-arrow-circle-right").removeClass("fa-arrow-circle-left").trigger("click");
                        }
                        reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                    }
                    else if (!$("#chartMainPane").hasClass("hide") && $("#chartMainView").hasClass("hide")) {
                        $("#chartMainPane").addClass("hide");
                        $("#chartMainView").removeClass("hide");

                        //Hide property Pane for ChartView
                        $("#propertyPanel").addClass("hide");
                        $("#chartPaneContainer").css("width", "100%");
                        reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();
                    }
                }
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });

            $("#clearButton").unbind("click").bind("click", function () {
                $("#chartMainView li.viewItem > i").trigger("click");
            });
        },
        /*
        Function:Temp function for save current chart to local file
        */
        createTestChartFile: function (str) {
            var fso, tf;
            fso = new ActiveXObject("Scripting.FileSystemObject");
            tf = fso.CreateTextFile("C:\\Cdocument\\TempChartFile\\chart1.json", true);
            tf.Write(str);
            tf.Close();//关闭
        },
        /*
        Function:Temp function for read local chart to current tab
        */
        readLocalChartFile: function () {
            var dataroot = "chart1.json";
            $.getJSON(dataroot, function (data) {
                $("#rowBox ul").html("").append(data.RowBox);
                $("#columnBox ul").html("").append(data.ColumnBox);
                $("#dataBox ul").html("").append(data.DataBox);
                $("#filterBox ul").html("").append(data.FilterBox);
                $("#updateChartButton").trigger("click");
            });

        },
        /*
        Function:Bind toptoolbar sub buttons event
        */
        bindTopToolBarSubBtnEvents:function(){
            //To Create ChartReport or ReportView
            $(".newTab").unbind("click").bind("click", function (e) {
                $(".tabSwitchOptionItems").html("");
                $("#chartMainPane").removeClass("hide").addClass("activated");
                $("#chartMainView").addClass("hide");
                if ($(".viewTab.active").length == 0) {
                    $("#centerRegion").css("margin-left", "36px");
                }
                else {
                    $("#centerRegion").css("margin-left", "388px");
                }
                var html = $("#tempChartTabPaneContainer").html();
                $("#chartMainPane").html(html);
                $(".toolIcon .deleteIcon").trigger('click');
                tabIDArray = [];
                reportBuilderContainer.eventBind.chartTabJSON = [];
                reportBuilderContainer.eventBind.bindLayoutChartDragAndDropEvent();
                reportBuilderContainer.eventBind.bindToolBarTabSwitchAddEvent();
                reportBuilderContainer.eventBind.bindChartPaneTabEvent();
                reportBuilderContainer.eventBind.bindJCarouselTabPrevNextEvent();
                reportBuilderContainer.eventBind.bindChartTabPaneHeightCalEvent();
                //Show property Pane for ChartTab
                $("#propertyPanel").removeClass("hide");
                $(".propertyArrow").addClass("fa-arrow-circle-right").removeClass("fa-arrow-circle-left").trigger("click");
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });
            $(".newView").unbind("click").bind("click", function (e) {
                $("#chartMainPane").addClass("hide");
                $("#chartMainView").removeClass("hide").addClass("activated");
                $("#chartMainView ul.viewBox").html("");

                //Hide property Pane for ChartView
                $("#propertyPanel").addClass("hide");
                $("#chartPaneContainer").css("width", "100%");
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });
        },
        /*
        Function:clear active toolbarbuttons
        */
        clearActiveToolBarButtons:function(){
            $("#topToolBar").find(".subOptions > ul.active").removeClass("active");
            reportBuilderContainer.eventBind.bindToolBarTabSwitchExRevertEvent();
        },
        /*
        Function:Temp function for open local chart view
        */
        bindOpenChartViewEvent: function () {
            var $showChart = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
            $showChart.addClass("local");
        },
        /*
        Function:bind chartTabPane height Calculate event
        */
        bindChartTabPaneHeightCalEvent: function () {
            var mainPaneHeight = $("#centerRegion").height();
            var panePadding = 20;
            var tabHeaderHeight = 35;
            var border = 2;
            var desHeight = 130;
            var boxHeight = mainPaneHeight - panePadding - tabHeaderHeight - border - desHeight;
            $("#chartMainPane .showChart").css("height", boxHeight + "px");
        },
        /*
        Function:bind topToolBar helpInfo events
        */
        bindTopToolBarHelpInfoEvents: function () {
            $("#topToolBar .help-info i").unbind("click").bind("click", function () {
                $('#helpInfoDialog').dialog({
                    modal: true,
                    title: "Help Info",
                    height: 600,
                    width: 850,
                    hide: 'fade',
                    show: 'fade',
                    position: [430, 60],
                    resizable: false
                });
                $('#helpInfoDialog').parent().children(".ui-dialog-titlebar").children("button").addClass("customized-button");
                //$('#helpInfoDialog').parent().children(".ui-dialog-titlebar").hide();
                $('#helpInfoWizard').smartWizard(
                    {
                        enableFinishButton: true,
                        enableAllSteps: true,
                        labelFinish: 'Close',
                        transitionEffect: 'fade',
                        onFinish: function () { $('#helpInfoDialog').dialog("close"); }
                    });
            });
        },
        /*
        Function:Calculate bindMeasuresAndDimensions container's height to fit the window's height.
        */
        bindSubjectViewTabHeightCalEvent: function () {
            var height = $(window).height();
            var h1 = $("#bindSubjects > h4").outerHeight();
            var h2 = $("#bindDataSubject").outerHeight();
            var h3 = $("#bindFields").outerHeight();
            var h4 = $("#bindDataSubjectDescription").outerHeight();
            $("#bindMeasuresAndDimensions").height(height - reportBuilderContainer.northDefaultSize - h1 - h2 - h3 - h4 - 5);
        },
        /*
        Function:Calculate space and width of chartMainPane container when westRegion pane dock or undock.
        */
        bindSubjectViewTabEvent: function () {
            $("#westRegion .dock").unbind("click").bind("click", function () {
                $("#westRegion .viewTab").removeClass("show");
                $("#westRegion .westViewTab").removeClass("show");
                var $currentTab = $(this).parent().parent();
                $("#westRegion .viewTab").removeClass("active");
                $currentTab.parent(".viewTab").addClass("active");
                $(".westViewTab").not($currentTab).addClass("free").removeClass("docked");
                $(".undock").hide();
                $(".dock").show();
                $(this).parent().parent().addClass("docked").removeClass("free");
                $(this).parent().find(".undock").show();
                $(this).hide();
                $("#centerRegion").css("margin-left", "388px");

                reportBuilderContainer.eventBind.bindPropertyPaneDockAndUndockWidthCalEvent();

                reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();
            });

            $("#westRegion .undock").unbind("click").bind("click", function () {
                $(".dock").show();
                $(".undock").hide();
                $("#westRegion .viewTab").removeClass("show");
                $("#westRegion .westViewTab").removeClass("show");
                var $currentTab = $(this).parent().parent();
                $currentTab.parent(".viewTab").removeClass("active");
                $currentTab.addClass("free").removeClass("docked");
                $("#centerRegion").css("margin-left", "36px");
                $(this).parent().find(".dock").show();
                $(this).hide();
                reportBuilderContainer.eventBind.bindPropertyPaneDockAndUndockWidthCalEvent();
                reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();

            });

            $("#westRegion .viewTab").unbind("click").bind("click", function () {
                if (!$(this).hasClass("show")) {
                    $("#westRegion .viewTab").removeClass("show");
                    $(this).addClass("show");
                    $("#westRegion .westViewTab").removeClass("show");
                    $(this).find(".westViewTab").addClass("show");
                    reportBuilderContainer.eventBind.bindSubjectViewTabHeightCalEvent();
                }
                else {
                    $(this).removeClass("show");
                    $(this).find(".westViewTab.free").removeClass("show");
                }
            });

            $("#westRegion .westViewTab ").click(function (e) {
                if (window.event) {
                    window.event.cancelBubble = true;
                } else if (e) {
                    e.stopPropagation();
                }
                reportBuilderContainer.eventBind.clearActiveToolBarButtons();
            });
        },
        /*
        Function:When window resize,add event to deal with the layout and chartPane.
        */
        bindWindowResizeEvent: function () {
            $(window).resize(function () {
                if ($(this).width() < 1024) {
                    $(".propertyArrow").removeClass("fa-arrow-circle-right").addClass("fa-arrow-circle-left");
                    $("#propertyPanel").removeClass("expanded");
                    $("#propertyBox").hide();
                    $("#propertyHeader h4").hide();
                    if ($("#westRegion .westViewTab.docked").length > 0) {
                        $("#westRegion .westViewTab.docked").find(".undock").trigger("click");
                        //$("#westRegion .westViewTab").css("display", "none")
                    }
                    else {
                        reportBuilderContainer.eventBind.bindPropertyPaneDockAndUndockWidthCalEvent();
                        reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                        reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();
                    }
                }
                else {
                    reportBuilderContainer.eventBind.bindPropertyPaneDockAndUndockWidthCalEvent();
                    reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                    reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();
                }
            });
        },
        /*
        Function:Calculate the chartPaneContainer's width when PropertyPane dock or undock.
        */
        bindPropertyPaneDockAndUndockWidthCalEvent: function () {
            var totalWidth = $("#centerRegion").width();
            var pWidth = 0;
            if (!$("#propertyPanel").hasClass("hide")) {
                if ($(".propertyArrow").hasClass("fa-arrow-circle-right")) {
                    pWidth = reportBuilderContainer.eastMaxSize;
                }
                else {
                    pWidth = reportBuilderContainer.eastMinSize;
                }
            }
            else {
                pWidth = 0;
            }
            var width = $("#centerRegion").width() - pWidth;
            var wid = (width / totalWidth * 10000) / 100.00 + "%";
            $("#chartPaneContainer").css("width", wid);
        },
        /*
        Function:Calculate the chartMainPane's position and width when other Pane dock or undock.
        */
        bindDockChartViewTabEvent: function () {
            var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
            var container_width = Math.floor(($("#chartMainPane .jCarouselLiteContainer").outerWidth() - $("#chartMainPane .jCarouselButtons").outerWidth()) / (tab_width)) * (tab_width);
            $("#chartMainPane .jCarouselLite").css("width", container_width + "px");

            var tab_count = $("#chartMainPane .jCarouselLite li").length;
            var total_width = tab_width * tab_count;
            $("#chartMainPane .jCarouselLite ul").css("width", total_width + "px");

            var page = Math.floor(container_width / tab_width);
            var maxLeft = (-1) * (tab_count - page) * tab_width;
            var index = $("#chartMainPane .jCarouselLite .ui-state-default").index($("#chartMainPane .jCarouselLite .ui-tabs-active"));
            if (index + 1 > page) {
                var left = (-1) * tab_width * (index + 1 - page);
                $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
            }
            else {
                var left = (-1) * tab_width * (index);
                $("#chartMainPane .jCarouselLite ul").css("left", 0 + "px");
            }
            //refresh chart
            reportBuilderContainer.eventBind.refreshChart();
        },
        /*
        Function:bindMeasuresAndDimensions toogle event.
        */
        bindLayoutSubjectToggleEvent: function () {
            $("#bindMeasuresAndDimensions .measureAndDimensionLabel").unbind("click").bind("click", function (e) {
                $(e.target).next("ul").slideToggle(500);
            });
        },
        /*
        Function:init dataSubject select's html.
        */
        bindLayoutSubjectSelectEvent: function () {
            $("#dataSubjectSelection").html("");
            $("#dataSubjectSelection").append("<option>—— Choose one subject ——</option>");
            var result = dataJSON.currentSubjectJSON;
            $.each(result, function (key, value) {
                var optionHtml = "<option des='" + value.Description + "'>" + value.Name + "</option>";
                $("#dataSubjectSelection").append(optionHtml);

            });
        },
        /*
        Function:init dataSubject select's change event.
        */
        bindLayoutSubjectChangeEvent: function () {
            var result = dataJSON.currentSubjectJSON;
            $("#dataSubjectSelection").unbind('change');
            $("#dataSubjectSelection").bind("change", function () {
                var selectedIndex = $("select#dataSubjectSelection option:selected")[0].index;
                if (selectedIndex == 0) {
                    $("#bindMeasuresAndDimensions h5").addClass("hide");
                    $("#bindDataSubjectDescription").text("");
                }
                $("#measuresList").html("");
                $("#dimensionsList").html("");
                $.each(result, function (key, value) {
                    if (key == selectedIndex - 1) {
                        $("#bindMeasuresAndDimensions h5").removeClass("hide");
                        var attrSub = $("#dataSubjectSelection").get(0).value;
                        var attrSubIndex = $("#dataSubjectSelection").get(0).selectedIndex - 1;
                        $.each(value.Measures, function (mk, mv) {
                            var attrMD = "Measures";
                            var attrIndex = mk;
                            var measuresHtml = "<li data-subIndex='" + attrSubIndex + "' data-subject='" + attrSub + "' data-scope='" + attrMD + "' data-index='" + attrIndex + "'>" + mv.Name + "</li>";
                            $("#measuresList").append(measuresHtml);
                        });
                        $.each(value.Dimensions, function (dk, dv) {
                            var attrMD = "Dimensions";
                            var attrIndex = dk;
                            var dimensionsHtml = "<li data-subIndex='" + attrSubIndex + "' data-subject='" + attrSub + "' data-scope='" + attrMD + "' data-index='" + attrIndex + "'>" + dv.Name + "</li>";
                            $("#dimensionsList").append(dimensionsHtml);
                        });
                        $("#bindDataSubjectDescription").text(value.Description);
                    }
                });
                reportBuilderContainer.eventBind.bindLayoutSubjectDisableEvent();
                reportBuilderContainer.eventBind.bindLayoutSubjectDragAndDropEvent();
            });
        },
        bindLayoutSubjectTreeViewEvent: function () {},
        /*
        Function:disable bindMeasuresAndDimensions container's item which is already in field box.
        */
        bindLayoutSubjectDisableEvent: function () {
            $("#bindMeasuresAndDimensions li").each(function () {
                var $s_item = $(this);
                $(".fieldBox li").each(function () {
                    var $f_item = $(this);
                    if ($s_item.text() == $f_item.text()) {
                        $s_item.addClass("ui-state-disabled");
                    }
                });
            });
        },
        /*
        Function:drag the bindMeasuresAndDimensions container's item to drop on the field box.
        */
        bindLayoutSubjectDragAndDropEvent: function () {
            $("#bindMeasuresAndDimensions li").draggable({
                helper: "clone",
                cancel: ".ui-state-disabled"
            });

            $("#filterBox ul").droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: "#bindMeasuresAndDimensions li",
                revert: "invalid",
                drop: function (event, ui) {
                    reportBuilderContainer.eventBind.bindLayoutFieldDragEvent($("#filterBox ul"), ui.draggable);
                }
            });
            $("#rowBox ul").droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: "#bindMeasuresAndDimensions #bindDimensions li",
                revert: "invalid",
                drop: function (event, ui) {
                    reportBuilderContainer.eventBind.bindLayoutFieldDragEvent($("#rowBox ul"), ui.draggable);
                }
            });
            $("#columnBox ul").droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: "#bindMeasuresAndDimensions  #bindDimensions li",
                revert: "invalid",
                drop: function (event, ui) {
                    reportBuilderContainer.eventBind.bindLayoutFieldDragEvent($("#columnBox ul"), ui.draggable);
                }
            });
            $("#dataBox ul").droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: "#bindMeasuresAndDimensions #bindMeasures li",
                revert: "invalid",
                drop: function (event, ui) {
                    reportBuilderContainer.eventBind.bindLayoutFieldDragEvent($("#dataBox ul"), ui.draggable);
                }
            });

        },
        /*
        Function:bind layout field drag event
        */
        bindLayoutFieldDragEvent: function (container, ui) {
            var flag = true;
            if (container.find(".ui-draggable.hide").text() == ui.text()) {
                container.find(".ui-draggable.hide").removeClass("hide");
                ui.remove();
            }
            else {
                container.find(".placeholder").remove();
                var $showChart = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
                reportBuilderContainer.eventBind.bindLayoutFieldDropEvent(container, ui, flag);
            }
            reportBuilderContainer.eventBind.bindLayoutFieldEvents();
        },
        /*
        Function:bind layout field drop event
        */
        bindLayoutFieldDropEvent: function (container, ui, flag) {
            $(".fieldBox").find("li.fieldItem").each(function () {
                if ($(this).find(".fieldText").text() == ui.text()) {
                    flag = false;
                }
            });
            if (flag) {
                var attrSub = ui.attr("data-subject");
                var attrSubIndex = ui.attr("data-subIndex");
                var attrMD = ui.attr("data-scope");
                var attrIndex = ui.attr("data-index");
                var toolBarHtml = "<div class='toolIcon'><span class='filterIcon'></span><span class='deleteIcon'></span></div>";
                var html = "<li class='fieldItem' data-subIndex='" + attrSubIndex + "' data-subject='" + attrSub + "' data-scope='" + attrMD + "' data-index='" + attrIndex + "'><div class='fieldText'>" + ui.text() + "</div>" + toolBarHtml + "</li>";
                $(html).appendTo(container);
                $(".fieldBox ul").removeClass("ui-state-default");
                ui.addClass("ui-state-disabled");
                reportBuilderContainer.eventBind.updateChartJson();

            }
        },
        /*
        Function:bind Layout Update Chart Button
        */
        bindLayoutUpdateChartButton: function () {
            $("#updateChartButton").unbind("click").bind("click", function () {
                var $showChart = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
                //if ($showChart.attr("chart-type") == null && $showChart.attr("grid-type") == null) {
                //    alert("Please choose one chart type or grid type!");
                //}
                //else {
                //    reportBuilderContainer.eventBind.updateChartJson();
                //}
                reportBuilderContainer.eventBind.updateChartJson();
            });
        },
        /*
        Function:bind Subject Dialog Events
        */
        bindSubjectDialogEvents: function () {
            reportBuilderContainer.eventBind.initSubjectDialog();
            reportBuilderContainer.eventBind.bindSubjectDialogAddEvent();
            reportBuilderContainer.eventBind.bindSubjectDialogDeleteEvent();
            reportBuilderContainer.eventBind.bindSubjectDialogRenameEvent();
            reportBuilderContainer.eventBind.bindSubjectDialogSaveEvent();
            reportBuilderContainer.eventBind.bindSubjectDialogCloseEvent();
        },
        /*
        Function:init subject Dialog.
        */
        initSubjectDialog: function () {
            $(".subjectButton").unbind('click').bind('click', function () {
                reportBuilderContainer.eventBind.dialogJSON = $.extend(true, [], dataJSON.currentSubjectJSON);
                reportBuilderContainer.eventBind.bindSubjectDialogSelectEvent();
                reportBuilderContainer.eventBind.bindSubjectDialogChangeEvent();
                var o_index = $("select#dataSubjectSelection").get(0).selectedIndex;
                $("#currentSubjects .currentSelection").find("option").removeAttr("selected");
                $("#currentSubjects .currentSelection").find("option").eq(o_index).attr("selected", "selected");
                $("#currentSubjects .currentSelection").trigger("change");

                $('#subjectDialog').dialog({
                    modal: true,
                    title: "Subject Dialog",
                    height: 600,
                    width: 850,
                    hide: 'fade',
                    show: 'fade',
                    position: [430, 60],
                    resizable: false
                });
                reportBuilderContainer.eventBind.bindSubjectDialogDescriptionevent();
            });
        },
        /*
        Function:init subject dialog's select html.
        */
        bindSubjectDialogSelectEvent: function () {
            $("#currentSubjects .currentSelection").html("");
            $("#currentSubjects .currentSelection").append("<option>—— Choose one subject ——</option>");
            $.each(reportBuilderContainer.eventBind.dialogJSON, function (key, value) {
                var optionHtml = "<option des='" + value.Description + "'>" + value.Name + "</option>";
                $("#currentSubjects .currentSelection").append(optionHtml);

            });
            $("#defaultSubjects .defaultSelection").html("");
            $("#defaultSubjects .defaultSelection").append("<option>—— Choose one cube ——</option>");
            var d_result = dataJSON.defaultSubjectJSON;
            $.each(d_result, function (key, value) {
                var optionHtml = "<option des='" + value.Description + "'>" + value.Name + "</option>";
                $("#defaultSubjects .defaultSelection").append(optionHtml);

            });
            $("#defaultSubjects .defaultSelection").find("option").removeAttr("selected");
            $("#defaultSubjects .defaultSelection").find("option:first").attr("selected", "selected");
            $("#defaultSubjects .defaultSelection").trigger("change");
        },
        /*
        Function:disable subject dialog's select item which is already in right box.
        */
        bindSubjectDialogDisableEvent: function () {
            $("#defaultSubjects li").removeClass("ui-state-disabled");
            $("#defaultSubjects li").each(function () {
                var $d_item = $(this);
                $("#currentSubjects li").each(function () {
                    var $c_item = $(this).find("span");
                    if ($d_item.text() == $c_item.text()) {
                        $d_item.addClass("ui-state-disabled");
                    }
                });
            });
        },
        /*
        Function:init subject dialog's select change event.
        */
        bindSubjectDialogChangeEvent: function () {
            $("#currentSubjects .currentSelection").unbind('change').bind("change", function () {
                if ($("#currentSubjects select").get(0).selectedIndex != 0) {
                    $("#currentSubjects .selectionList").removeClass("hide");
                    $("#currentSubjects .subjectDescription").removeClass("hide");
                    $("#currentSubjects #currentSubjectButtons .remove").removeClass("hide").addClass("inlineBlock");
                    $("#currentSubjects #currentSubjectButtons .rename").removeClass("hide").addClass("inlineBlock");
                }
                else {
                    $("#currentSubjects .selectionList").addClass("hide");
                    $("#currentSubjects .subjectDescription").addClass("hide");
                    $("#currentSubjects #currentSubjectButtons .remove").addClass("hide").removeClass("inlineBlock");
                    $("#currentSubjects #currentSubjectButtons .rename").addClass("hide").removeClass("inlineBlock");
                }
                var selectedIndex = $("#currentSubjects select.currentSelection option:selected")[0].index;

                $("#currentSubjects .measuresList").html("");
                $("#currentSubjects .dimensionsList").html("");
                if (selectedIndex == 0) {
                    $("#currentSubjects h5").addClass("hide");
                    $(".subjectDescription textarea").val("").addClass("hide");
                }
                $.each(reportBuilderContainer.eventBind.dialogJSON, function (key, value) {
                    if (key == selectedIndex - 1) {
                        $("#currentSubjects h5").removeClass("hide");
                        $.each(value.Measures, function (mk, mv) {
                            var measuresHtml = "<li data-id=" + mk + "><span>" + mv.Name + "</span><input type='text'  value='" + mv.Description + "'/></li>";
                            $("#currentSubjects .measuresList").append(measuresHtml);
                        });
                        $.each(value.Dimensions, function (dk, dv) {
                            var dimensionsHtml = "<li data-id=" + dk + "><span>" + dv.Name + "</span><input type='text' value='" + dv.Description + "'/></li>";
                            $("#currentSubjects .dimensionsList").append(dimensionsHtml);
                        });
                        $(".subjectDescription textarea").removeClass("hide").val(value.Description);
                    }
                });
                reportBuilderContainer.eventBind.bindSubjectDialogEditDescriptionEvent();
                reportBuilderContainer.eventBind.bindSubjectDialogDisableEvent();
                reportBuilderContainer.eventBind.bindSubjectDialogDragAndDropEvent();
            });


            var d_result = dataJSON.defaultSubjectJSON;
            $("#defaultSubjects .defaultSelection").unbind('change');
            $("#defaultSubjects .defaultSelection").bind("change", function () {
                if ($("#defaultSubjects select").get(0).selectedIndex != 0) {
                    $("#defaultSubjects .selectionList").removeClass("hide");
                }
                else {
                    $("#defaultSubjects .selectionList").addClass("hide");
                }
                var selectedIndex = $("#defaultSubjects select.defaultSelection option:selected")[0].index;
                $("#defaultSubjects .measuresList").html("");
                $("#defaultSubjects .dimensionsList").html("");
                if (selectedIndex == 0) {
                    $("#defaultSubjects h5").addClass("hide");
                }
                $.each(d_result, function (key, value) {
                    if (key == selectedIndex - 1) {
                        $("#defaultSubjects h5").removeClass("hide");
                        $.each(value.Measures, function (mk, mv) {
                            var measuresHtml = "<li data-id=" + mk + ">" + mv.Name + "</li>";
                            $("#defaultSubjects .measuresList").append(measuresHtml);
                        });
                        $.each(value.Dimensions, function (dk, dv) {
                            var dimensionsHtml = "<li data-id=" + dk + ">" + dv.Name + "</li>";
                            $("#defaultSubjects .dimensionsList").append(dimensionsHtml);
                        });
                    }
                });
                reportBuilderContainer.eventBind.bindSubjectDialogDisableEvent();
                reportBuilderContainer.eventBind.bindSubjectDialogDragAndDropEvent();

            });
        },
        /*
        Function:init subject dialog's drag and drop event.
        */
        bindSubjectDialogDragAndDropEvent: function () {
            var d_jsKey = $("#defaultSubjects select").get(0).selectedIndex - 1;
            var c_jsKey = $("#currentSubjects select").get(0).selectedIndex - 1;

            $("#defaultSubjects .selectionList li").draggable({
                helper: "clone",
                cancel: ".ui-state-disabled"
            });

            $("#defaultSubjects .selectionList ul").each(function (key, value) {
                reportBuilderContainer.eventBind.bindSubjectDialogCurrentToDefaultDropEvent(key, d_jsKey, c_jsKey);
            });
            $("#currentSubjects .selectionList ul").each(function (key, value) {
                var $dropBox = $(this);
                var acceptClass = "#defaultSubjects ul[pos=" + key + "] li";
                $dropBox.droppable({
                    activeClass: "ui-state-default",
                    hoverClass: "ui-state-hover",
                    accept: acceptClass,
                    revert: "invalid",
                    drop: function (event, ui) {
                        if ($("#currentSubjects select").get(0).selectedIndex != 0) {
                            var flag = true;
                            if ($(this).find(".ui-draggable.hide").text() == ui.draggable.text()) {
                                $(this).find(".ui-draggable.hide").removeClass("hide");
                                ui.draggable.remove();
                            }
                            else {
                                $dropBox.find("li").each(function () {
                                    if ($(this).find("span").text() == ui.draggable.text()) {
                                        flag = false;
                                    }
                                });
                                if (flag) {
                                    $(this).find(".placeholder").remove();
                                    var html = "<li><span>" + ui.draggable.text() + "</span><input type='text' value='' style='margin-left:5px'/></li>";
                                    $(html).appendTo(this);
                                    $dropBox.removeClass("ui-state-default");
                                    ui.draggable.addClass("ui-state-disabled");
                                    //UpdateCurrentSubjectJsonData
                                    var MDKey = $(ui.draggable).attr("data-id");
                                    if (key == 0) {
                                        var jsItem = dataJSON.defaultSubjectJSON[d_jsKey].Measures[MDKey];
                                        reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Measures.push(jsItem);
                                    }
                                    else {
                                        var jsItem = dataJSON.defaultSubjectJSON[d_jsKey].Dimensions[MDKey];
                                        reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Dimensions.push(jsItem);
                                    }

                                    reportBuilderContainer.eventBind.bindSubjectDialogEditDescriptionEvent();

                                    //Current Subject Drag Drop Event
                                    reportBuilderContainer.eventBind.bindSubjectDialogCurrentToDefaultDropEvent(key, d_jsKey, c_jsKey);
                                }
                            }
                        }
                    }
                });
            });
        },
        /*
        Function:init subject dialog's drag and drop event.
        */
        bindSubjectDialogCurrentToDefaultDropEvent: function (key, d_jsKey, c_jsKey) {
            $("#currentSubjects .selectionList li").draggable({
                helper: "clone"
            });
            var $l_dropBox = $("#defaultSubjects ul[pos=" + key + "]");
            var l_acceptClass = "#currentSubjects .selectionList ul[pos=" + key + "] li";

            $l_dropBox.droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: l_acceptClass,
                revert: "invalid",
                drop: function (event, ui) {
                    if ($("#defaultSubjects select").get(0).selectedIndex != 0) {
                        if ($(this).find(".ui-draggable.hide").text() == ui.draggable.text()) {
                            $(this).find(".ui-draggable.hide").removeClass("hide");
                            ui.draggable.remove();
                        }
                        else {
                            $(this).find(".placeholder").remove();
                            $(this).find("li").each(function () {
                                if ($(this).text() == ui.draggable.text()) {
                                    $l_dropBox.removeClass("ui-state-default");
                                    ui.draggable.remove();
                                    $(this).removeClass("ui-state-disabled");

                                    //UpdateCurrentSubjectJsonData
                                    var MDKey = $(ui.draggable).attr("data-id");
                                    if (key == 0) {
                                        var jsItem = dataJSON.currentSubjectJSON[d_jsKey].Measures[MDKey];
                                        reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Measures.pop(jsItem);
                                    }
                                    else {
                                        var jsItem = dataJSON.currentSubjectJSON[d_jsKey].Dimensions[MDKey];
                                        reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Dimensions.pop(jsItem);
                                    }

                                }
                            });
                        }
                    }
                }
            });
        },
        /*
        Function:edit subject description for current subject.
        */
        bindSubjectDialogDescriptionevent: function () {
            $("#currentSubjects .subjectDescription textarea").unbind('keyup').bind("keyup", function () {
                var c_jsKey = $("#currentSubjects select").get(0).selectedIndex - 1;
                var des = $(this).val();
                reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Description = des;

            })
        },
        /*
        Function:edit item description for current subject's items.
        */
        bindSubjectDialogEditDescriptionEvent: function () {
            $("#currentSubjects .measuresBox li input").unbind('keyup').bind("keyup", function () {
                var c_jsKey = $("#currentSubjects select").get(0).selectedIndex - 1;
                var MDKey = $("#currentSubjects .measuresBox li").index($(this).parent());
                var des = $(this).val();
                reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Measures[MDKey].Description = des;

            });
            $("#currentSubjects .dimensionsBox li input").unbind('keyup').bind("keyup", function () {
                var c_jsKey = $("#currentSubjects select").get(0).selectedIndex - 1;
                var MDKey = $("#currentSubjects .dimensionsBox li").index($(this).parent());
                var des = $(this).val();
                reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Dimensions[MDKey].Description = des;

            });

        },
        /*
        Function:add new subject.
        */
        bindSubjectDialogAddEvent: function () {
            $("#currentSubjectButtons .add").unbind('click').bind("click", function (e) {
                $("#addSubjectNameBox").dialog({
                    modal: true,
                    title: "Name Dialog",
                    height: 130,
                    width: 400,
                    hide: 'fade',
                    show: 'fade',
                    position: [565, 147],
                    resizable: false
                });
            });
            $("#addSubjectNameBox .addName").unbind('click').bind("click", function (e) {
                var flag = true;
                var name = $("#addSubjectNameBox input").val();
                if (name != null && name != "") {
                    $("#currentSubjects .currentSelection").find("option").each(function () {
                        if ($(this).text() === name) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        var newOption = "<option>" + name + "</option>";
                        $("#currentSubjects .currentSelection").append(newOption);
                        //UpdateCurrentSubjectJsonData
                        var newJsonData = { Name: name, Description: "", Measures: [], Dimensions: [] };
                        reportBuilderContainer.eventBind.dialogJSON.push(newJsonData);

                        $("#currentSubjects .currentSelection").find("option").removeAttr("selected");
                        $("#currentSubjects .currentSelection").find("option:last").attr("selected", "selected");
                        $("#currentSubjects .currentSelection").trigger("change");
                    }
                }
                $("#addSubjectNameBox").dialog("close");
                $("#addSubjectNameBox input").val("");
            });

            $("#addSubjectNameBox .cancelName").unbind('click').bind("click", function (e) {
                $("#addSubjectNameBox").dialog("close");
                $("#addSubjectNameBox input").val("");
            });
        },
        /*
        Function:rename current subject.
        */
        bindSubjectDialogRenameEvent: function () {
            $("#currentSubjectButtons .rename").unbind('click').bind("click", function (e) {
                $("#subjectRenameBox").dialog({
                    modal: true,
                    title: "Rename Dialog",
                    height: 130,
                    width: 400,
                    hide: 'fade',
                    show: 'fade',
                    position: [565, 147],
                    resizable: false
                });
            });
            $("#subjectRenameBox .subjectReNameButtons .reName").unbind('click').bind("click", function (e) {
                var flag = true;
                var name = $("#subjectRenameBox input").val();
                if (name != null && name != "") {
                    $("#currentSubjects .currentSelection").find("option").each(function () {
                        if ($(this).text() === name) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        //UpdateCurrentSubjectJsonData
                        var index = $("#currentSubjects select").get(0).selectedIndex;
                        var c_jsKey = index - 1;
                        reportBuilderContainer.eventBind.dialogJSON[c_jsKey].Name = name;
                        $("#currentSubjects .currentSelection").find("option").eq(index).text(name);
                    }
                }
                $("#subjectRenameBox").dialog("close");
                $("#subjectRenameBox input").val("");
            });
            $("#subjectRenameBox .subjectReNameButtons .celName").unbind('click').bind("click", function (e) {
                $("#subjectRenameBox").dialog("close");
                $("#subjectRenameBox input").val("");
            });
        },
        /*
        Function:delete current subject.
        */
        bindSubjectDialogDeleteEvent: function () {
            $("#currentSubjectButtons .remove").unbind('click').bind("click", function (e) {
                var delJsonDataIndex = $("#currentSubjects .currentSelection").get(0).selectedIndex - 1;
                reportBuilderContainer.eventBind.dialogJSON.pop(reportBuilderContainer.eventBind.dialogJSON[delJsonDataIndex]);
                $("#currentSubjects .currentSelection").find("option:selected").remove();
                $("#currentSubjects .currentSelection").find("option").removeAttr("selected");
                $("#currentSubjects .currentSelection").find("option:first").attr("selected", "selected");
                $("#currentSubjects .currentSelection").trigger("change");
            });
        },
        /*
        Function:save all options for current subject.
        */
        bindSubjectDialogSaveEvent: function () {
            $("#subjectDialog #subjectDialogMenu .save").unbind('click').bind('click', function () {
                //post new json data to back to update
                //need some code...
                var o_opt = $("select#dataSubjectSelection").find("option").length;
                var o_index = $("select#dataSubjectSelection").get(0).selectedIndex;
                var c_opt = $("#currentSubjects select.currentSelection").find("option").length;
                dataJSON.currentSubjectJSON = $.extend(true, [], reportBuilderContainer.eventBind.dialogJSON),
                $('#subjectDialog').dialog("close");
                reportBuilderContainer.eventBind.bindLayoutSubjectSelectEvent();
                reportBuilderContainer.eventBind.bindLayoutSubjectChangeEvent();
                $("select#dataSubjectSelection").find("option").removeAttr("selected");
                if (o_opt > c_opt) {
                    $("select#dataSubjectSelection").find("option:first").attr("selected", "selected");
                }
                else if (o_opt == c_opt) {
                    $("select#dataSubjectSelection").find("option").eq(o_index).attr("selected", "selected");
                }
                else {
                    $("select#dataSubjectSelection").find("option:last").attr("selected", "selected");
                }
                $("select#dataSubjectSelection").trigger("change");
            });
        },
        /*
        Function:close subject dialog.
        */
        bindSubjectDialogCloseEvent: function () {
            $("#subjectDialog #subjectDialogMenu .close").unbind('click').bind('click', function () {
                //need some code...
                $('#subjectDialog').dialog("close");
            });
        },
        bindLayoutFieldEvents: function () {
            reportBuilderContainer.eventBind.bindLayoutFieldDeleteEvent();
            reportBuilderContainer.eventBind.bindLayoutFieldFilterEvent();
        },
        /*
        Function:init filter dialog.
        */
        bindLayoutFieldFilterEvent: function () {
            $(".toolIcon .filterIcon").unbind('click').bind('click', function () {

                reportBuilderContainer.eventBind.filterJSON = $.extend(true, [], dataJSON.currentSubjectJSON);

                var $item = $(this).parents("li.fieldItem");
                $('#filterDialog').dialog({
                    modal: true,
                    title: "Filter Dialog",
                    height: 600,
                    width: 850,
                    hide: 'fade',
                    show: 'fade',
                    position: [430, 60],
                    resizable: false
                });

                reportBuilderContainer.eventBind.bindFilterDialogOptionEvent($item);
                reportBuilderContainer.eventBind.bindFilterDialogConditionEvent();
                reportBuilderContainer.eventBind.bindFilterDialogConditionValueInputEvent();
            });

            reportBuilderContainer.eventBind.bindFilterDialogSaveEvent();
            reportBuilderContainer.eventBind.bindFilterDialogCloseEvent();

        },
        /*
        Function:bind Filter Dialog Option Event
        */
        bindFilterDialogOptionEvent: function (item) {
            $("#filterDialog .filterBox .filterSelectItems").html("");
            $("#filterDialog #conditionBox select.filterSelect").html("");

            var subject = item.attr("data-subject");
            var subIndex = Number(item.attr("data-subIndex"));
            var md = item.attr("data-scope");
            var mdIndex = Number(item.attr("data-index"));
            if (md === "Measures") {
                var data = reportBuilderContainer.eventBind.filterJSON[subIndex].Measures[mdIndex].Values;

            }
            else {
                var data = reportBuilderContainer.eventBind.filterJSON[subIndex].Dimensions[mdIndex].Values;
            }
            $("#filterDialog .filterBox select.filterSelect").append("<option>All</option>");
            $("#filterDialog #conditionBox select.filterSelect").append("<option>All</option>");
            $.each(data, function (key, value) {
                var items = "<li><input type=checkbox data-id='" + key + "'/>" + value + "</li>";
                $("#filterDialog .filterBox .filterSelectItems").append(items);
                var option = "<option>" + value + "</option>";
                $("#filterDialog #conditionBox select.filterSelect").append(option);
            });

            $("#filterDialog .filterBox .filterSelectHeader .filterSelectIcon i").unbind("click").bind("click", function (e) {
                if ($(this).hasClass("fa-sort-down")) {
                    $(this).removeClass("fa-sort-down").addClass("fa-sort-up");
                    $(e.target).parent().parent().next("ul").fadeIn(500);
                }
                else {
                    $(this).addClass("fa-sort-down").removeClass("fa-sort-up");
                    $(e.target).parent().parent().next("ul").fadeOut(500);
                }
                //$(e.target).parent().next("ul").slideToggle(500);
            });
        },
        /*
        Function:add filter condition options.
        */
        bindFilterDialogConditionEvent: function () {
            $("#filterDialog #conditionBox select.conditionSelect").html("");
            $("#filterDialog #conditionBox select.conditionSelect").append("<option>Condition</option>");
            var conditions = ["equals", "not equal", "more than", "less than"];
            $.each(conditions, function (key, value) {
                var option = "<option>" + value + "</option>";
                $("#filterDialog #conditionBox select.conditionSelect").append(option);
            });
        },
        /*
        Function:input filter condition value.
        */
        bindFilterDialogConditionValueInputEvent: function () {
            $("#filterDialog #conditionBox input.valueSelect").val("");
        },
        /*
        Function:save filter options.
        */
        bindFilterDialogSaveEvent: function () {
            $("#filterDialog #filterDialogMenu .save").unbind('click').bind('click', function () {
                //need some code...
                reportBuilderContainer.eventBind.filterResultJSON = $.extend(true, [], reportBuilderContainer.eventBind.dialogJSON),
                $('#filterDialog').dialog("close");
                reportBuilderContainer.eventBind.updateChartJson();
            });
        },
        /*
        Function:close filter dialog.
        */
        bindFilterDialogCloseEvent: function () {
            $("#filterDialog #filterDialogMenu .close").unbind('click').bind('click', function () {
                //need some code...
                $('#filterDialog').dialog("close");
            });
        },
        /*
        Function:bind Layout Field Edit Event
        */
        bindLayoutFieldEditEvent: function () {},
        /*
        Function:delete field box item.
        */
        bindLayoutFieldDeleteEvent: function () {
            $(".toolIcon .deleteIcon").unbind('click').bind('click', function () {
                var $item = $(this).parents("li.fieldItem");
                $("#bindMeasuresAndDimensions li.ui-state-disabled").each(function () {
                    if ($(this).text() == $item.find(".fieldText").text()) {
                        $(this).removeClass("ui-state-disabled");
                    }
                });
                $item.remove();
                var $cur_showChart = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
                if ($cur_showChart.attr("chart-type") != null || $cur_showChart.attr("grid-type") != null) {
                    reportBuilderContainer.eventBind.updateChartJson();
                }
            });
        },
        /*
        Function:drag and drop chart types.
        */
        bindLayoutChartDragAndDropEvent: function () {
            $("#chartTypePaneButtons .chartType").draggable({
                helper: "clone",
                cancel: ".ui-state-disabled"
            });
            $("#tableButtons .tableOption").draggable({
                helper: "clone",
                cancel: ".ui-state-disabled"
            });

            $("#chartMainPane .showChart").droppable({
                accept: "#chartTypePaneButtons .chartType,#tableButtons .tableOption",
                activeClass: "ui-state-hover",
                revert: "invalid",
                drop: function (event, ui) {
                    if (!$(this).hasClass("local")) {
                        if ($(this).find(".ui-draggable.hide").text() == ui.draggable.text()) {
                            $(this).find(".ui-draggable.hide").removeClass("hide");
                            ui.draggable.remove();
                        }
                        else {
                            //need some code... 
                            $(this).find(".placeholder").remove();
                            $(this).html("");
                            if (ui.draggable.hasClass("tableOption")) {
                                $(this).removeAttr("chart-type");
                                $(this).attr("grid-type", ui.draggable.attr("id"));
                                $("#updateChartButton").trigger("click");
                            }
                            else {
                                $(this).removeAttr("grid-type");
                                $(this).attr("chart-type", ui.draggable.attr("id"));
                                $("#updateChartButton").trigger("click");
                            }
                            $("#chartMainPane .showChart").removeClass("ui-state-default");
                        }
                    }
                }
            });
        },
        /*
        Function:Initialized chart with no datasource.
       */
        createChart: function (container, identifiner) {
            var chartType = identifiner;
            if (chartType == "bar") {
                chartType = "column";
            }
            $(container).kendoChart({
                title: {
                    text: "Default Chart"
                },
                seriesDefaults: {
                    type: chartType,
                },
                series: [{
                    data: [100, 200]
                }],
                seriesColors: ["#aaa", "#aaa"],
                categoryAxis: {
                    categories: ["XAxis1", "XAxis2"],
                }
                ,
                tooltip: {
                    visible: false,
                    template: "#= series.name #: #= value #"
                }
            });
        },
        /*
        Function:Refresh chart or grid.
       */
        refreshChart: function () {
            var chartWidth = $(".jCarouselLiteContainer").width() - 2;
            $("#chartMainPane .showChart").css("width", chartWidth + "px")
            $("#chartMainPane .showChart").each(function () {
                if ($(this).html() != "" && $(this).attr("chart-type") != null) {
                    $(this).data("kendoChart").redraw();;
                }
                else if ($(this).html() != "" && $(this).attr("grid-type") != null) {
                    $(this).data("kendoGrid").refresh();
                }

            });
        },
        /*
        Function:Initialized grid.
       */
        createTable: function (container, identifiner) {
            $(container).kendoGrid({
                groupable: true,
                sortable: true,
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                columns: [{
                    title: "Column1"
                }, {
                    title: "Column2"
                }]
            });
        },
        /*
        Function:Update Chart Json.
       */
        updateChartJson: function () {
            if (reportBuilderContainer.eventBind.filterJSON.length == 0) {
                reportBuilderContainer.eventBind.filterJSON = $.extend(true, [], dataJSON.currentSubjectJSON);
            }
            if (reportBuilderContainer.eventBind.filterResultJSON.length == 0) {
                reportBuilderContainer.eventBind.filterResultJSON = $.extend(true, [], reportBuilderContainer.eventBind.filterJSON);
            }
            var chartWidth = $(".jCarouselLiteContainer").width() - 2;
            $("#chartMainPane .showChart").css("width", chartWidth + "px")
            //Test example
            reportBuilderContainer.eventBind.testChart();

        },
        /*
        Function:Mapping ChartTab data with fieldbox data.
       */
        updateChartTabMappingFields: function () {
            var tabid = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").attr("id");
            if (reportBuilderContainer.eventBind.chartTabJSON.length == 0) {
                var template = { TabID: tabid, RowBox: $("#rowBox ul").html(), ColumnBox: $("#columnBox ul").html(), DataBox: $("#dataBox ul").html(), FilterBox: $("#filterBox ul").html() };
                reportBuilderContainer.eventBind.chartTabJSON.push(template);
                reportBuilderContainer.eventBind.tabIDArray.push(tabid);
            }
            else {
                $.each(reportBuilderContainer.eventBind.chartTabJSON, function (key, value) {
                    if ($.inArray(tabid, reportBuilderContainer.eventBind.tabIDArray) != -1) {
                        if (tabid == value.TabID) {
                            value.RowBox = $("#rowBox ul").html();
                            value.ColumnBox = $("#columnBox ul").html();
                            value.DataBox = $("#dataBox ul").html();
                            value.FilterBox = $("#filterBox ul").html();
                        }
                    }
                    else {
                        reportBuilderContainer.eventBind.tabIDArray.push(tabid);
                        var template = { TabID: tabid, RowBox: $("#rowBox ul").html(), ColumnBox: $("#columnBox ul").html(), DataBox: $("#dataBox ul").html(), FilterBox: $("#filterBox ul").html() };
                        reportBuilderContainer.eventBind.chartTabJSON.push(template);

                    }
                });
            }

        },
        /*
        Function:Mapping Fieldbox data with charttab data.
       */
        updateFieldBoxMappingChartTab: function () {
            var tabid = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").attr("id");
            if ($.inArray(tabid, reportBuilderContainer.eventBind.tabIDArray) == -1) {
                $(".toolIcon .deleteIcon").trigger("click");
            }
            else {
                $.each(reportBuilderContainer.eventBind.chartTabJSON, function (key, value) {
                    if (tabid == value.TabID) {
                        $("#rowBox ul").html("").append(value.RowBox);
                        $("#columnBox ul").html("").append(value.ColumnBox);
                        $("#dataBox ul").html("").append(value.DataBox);
                        $("#filterBox ul").html("").append(value.FilterBox);
                    }
                });
                $("#dataSubjectSelection").find("option").eq(1).attr("selected", "selected");
                $("#dataSubjectSelection").trigger("change");
                reportBuilderContainer.eventBind.bindLayoutFieldFilterEvent();
                reportBuilderContainer.eventBind.bindLayoutFieldDeleteEvent();
                reportBuilderContainer.eventBind.bindMappingFieldBoxAndPropertyPaneEvent();

            }
        },
        /*
        Function:bind Mapping FieldBox And PropertyPane Event
       */
        bindMappingFieldBoxAndPropertyPaneEvent: function () {

            if ($("#rowBox").find("li").length == 0) {
                $("#propertyBox #rowPropSel").html("");
                $("#propertyBox #rowPropSel").addClass("hide");
                $("#rowPropBox").addClass("hide");
                $("#noRowTip").removeClass("hide");
            }
            else {
                $("#noRowTip").addClass("hide");
                $("#propertyBox #rowPropSel").removeClass("hide");
                $("#propertyBox #rowPropSel").html("");
                $("#propertyBox #rowPropBox").addClass("hide");
                $(".p_accordionContent").css("display", "none");
                $("#propertyBox #rowPropSel").append("<option>Choose...</option>");
                $("#rowBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.updateMappingRowProperty($(this).text());
                });
            }

            if ($("#dataBox").find("li").length == 0) {
                $("#propertyBox #dataPropSel").html("");
                $("#propertyBox #dataPropSel").addClass("hide");
                $("#dataPropBox").addClass("hide");
                $("#noDataTip").removeClass("hide");
                $("#comPropBox").addClass("hide");
                $("#noCommonDataTip").removeClass("hide");
            }
            else {
                $("#comPropBox").removeClass("hide");
                $("#noCommonDataTip").addClass("hide");
                $("#noDataTip").addClass("hide");
                $("#propertyBox #dataPropSel").removeClass("hide");
                $("#propertyBox #dataPropSel").html("");
                $("#propertyBox #dataPropBox").addClass("hide");
                $(".p_accordionContent").css("display", "none");
                $("#propertyBox #dataPropSel").append("<option>Choose...</option>");
                $("#dataBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.updateMappingDataProperty($(this).text());
                });
                reportBuilderContainer.eventBind.initializeChartCommonPropertyData();
            }

            if ($("#columnBox").find("li").length == 0) {
                $("#propertyBox #columnPropSel").html("");
                $("#propertyBox #columnPropSel").addClass("hide");
                $("#columnPropBox").addClass("hide");
                $("#noColumnTip").removeClass("hide");
            }
            else {
                $("#noColumnTip").addClass("hide");
                $("#propertyBox #columnPropSel").removeClass("hide");
                $("#propertyBox #columnPropSel").html("");
                $("#propertyBox #columnPropBox").addClass("hide");
                $(".p_accordionContent").css("display", "none");
                $("#propertyBox #columnPropSel").append("<option>Choose...</option>");
                $("#columnBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.updateMappingColumnProperty($(this).text());
                });
            }

            if ($("#dataBox").find("li").length == 0 && $("#columnBox").find("li").length == 0 && $("#rowBox").find("li").length == 0) {
                $("#gridPropBox").addClass("hide");
                $("#noDataGridTip").removeClass("hide");
            }
            else {
                $("#gridPropBox").removeClass("hide");
                $("#noDataGridTip").addClass("hide");
            }

        },
        /*
        Function:Test chart or grid update.
        */
        testChart: function () {
            reportBuilderContainer.eventBind.rowsArray = [];
            reportBuilderContainer.eventBind.seriesArray = [];
            reportBuilderContainer.eventBind.columnsArray = [];
            reportBuilderContainer.eventBind.filtersArray = [];

            if ($("#rowBox").find("li").length == 0) {
                $("#propertyBox #rowPropSel").html("");
                $("#propertyBox #rowPropSel").addClass("hide");
                $("#rowPropBox").addClass("hide");
                $("#noRowTip").removeClass("hide");
            }
            else {
                $("#noRowTip").addClass("hide");
                $("#propertyBox #rowPropSel").removeClass("hide");
                $("#propertyBox #rowPropSel").html("");
                $("#propertyBox #rowPropBox").addClass("hide");
                $(".p_accordionContent").css("display", "none");
                $("#propertyBox #rowPropSel").append("<option>Choose...</option>");
                $("#rowBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.rowsArray.push($(this).text());
                    reportBuilderContainer.eventBind.updateMappingRowProperty($(this).text());
                });
            }

            if ($("#dataBox").find("li").length == 0) {
                $("#propertyBox #dataPropSel").html("");
                $("#propertyBox #dataPropSel").addClass("hide");
                $("#dataPropBox").addClass("hide");
                $("#noDataTip").removeClass("hide");
                $("#comPropBox").addClass("hide");
                $("#noCommonDataTip").removeClass("hide");


            }
            else {
                $("#comPropBox").removeClass("hide");
                $("#noCommonDataTip").addClass("hide");
                $("#noDataTip").addClass("hide");
                $("#propertyBox #dataPropSel").removeClass("hide");
                $("#propertyBox #dataPropSel").html("");
                $("#propertyBox #dataPropSel").append("<option>Choose...</option>");
                $("#dataBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.seriesArray.push($(this).text());
                    reportBuilderContainer.eventBind.updateMappingDataProperty($(this).text());
                });
            }

            if ($("#columnBox").find("li").length == 0) {
                $("#propertyBox #columnPropSel").html("");
                $("#propertyBox #columnPropSel").addClass("hide");
                $("#columnPropBox").addClass("hide");
                $("#noColumnTip").removeClass("hide");
            }
            else {
                $("#noColumnTip").addClass("hide");
                $("#propertyBox #columnPropSel").removeClass("hide");
                $("#propertyBox #columnPropSel").html("");
                $("#propertyBox #columnPropBox").addClass("hide");
                $(".p_accordionContent").css("display", "none");
                $("#propertyBox #columnPropSel").append("<option>Choose...</option>");
                $("#columnBox").find("li").each(function () {
                    reportBuilderContainer.eventBind.columnsArray.push($(this).text());
                    reportBuilderContainer.eventBind.updateMappingColumnProperty($(this).text());
                });
            }

            $("#filterBox").find("li").each(function () {
                reportBuilderContainer.eventBind.filtersArray.push($(this).text());
            });

            reportBuilderContainer.eventBind.updateChartTabMappingFields();

            var $container = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
            $container.html("");
            if ($container.attr("chart-type") != null) {
                $container.removeClass("k-grid").removeClass("k-widget").removeClass("k-secondary");
                var identifiner = $container.attr("chart-type");
                $("#chartPropertyBox").removeClass("hide");
                $("#gridPropertyBox").addClass("hide");
                reportBuilderContainer.eventBind.bindPropertyAccordionContentHeightCalEvent();
                $(".p_accordionContent").css("display", "none");
                $(".propBox").addClass("hide");
                reportBuilderContainer.eventBind.updateChart($container, identifiner, chartJSON);
                if (reportBuilderContainer.eventBind.seriesArray.length > 0) {
                    reportBuilderContainer.eventBind.initializeChartCommonPropertyData();
                }
            }
            else {
                $container.removeClass("k-chart");
                if ($container.attr("grid-type") == null) {
                    $container.attr("grid-type", "grid");
                }
                var identifiner = $container.attr("grid-type");
                $("#chartPropertyBox").addClass("hide");
                $("#gridPropertyBox").removeClass("hide");
                if (!(reportBuilderContainer.eventBind.rowsArray.length == 0 && reportBuilderContainer.eventBind.columnsArray.length == 0 && reportBuilderContainer.eventBind.seriesArray.length == 0)) {
                    $("#gridPropBox").removeClass("hide");
                    $("#noDataGridTip").addClass("hide");
                }
                else {
                    $("#gridPropBox").addClass("hide");
                    $("#noDataGridTip").removeClass("hide");
                }
                changeGridPropertyFlag = false;
                reportBuilderContainer.eventBind.updateGrid($container, identifiner, chartJSON);
            }

        },
        /*
        Function:Update Chart.
        */
        updateChart: function (container, identifiner, data) {
            var chartType = identifiner;
            if (chartType == "bar") {
                chartType = "column";
            }
            var seriesChart = [];
            for (i = 0; i < reportBuilderContainer.eventBind.seriesArray.length; i++) {
                seriesChart.push({ name: reportBuilderContainer.eventBind.seriesArray[i], field: reportBuilderContainer.eventBind.seriesArray[i] });
            }
            var rowsChart = [];
            for (i = 0; i < reportBuilderContainer.eventBind.rowsArray.length; i++) {
                rowsChart.push({ name: reportBuilderContainer.eventBind.rowsArray[i], field: reportBuilderContainer.eventBind.rowsArray[i] });
            }
            var columnsChart = [];
            for (i = 0; i < reportBuilderContainer.eventBind.columnsArray.length; i++) {
                columnsChart.push({ name: reportBuilderContainer.eventBind.columnsArray[i], field: reportBuilderContainer.eventBind.columnsArray[i] });
            }
            if ($("#rowBox li").length == 0 && $("#columnBox li").length == 0 && $("#dataBox li").length == 0) {
                reportBuilderContainer.eventBind.createChart(container, identifiner);
            }
            else {
                reportBuilderContainer.eventBind.currentChart = $(container).kendoChart({
                    title: {
                        text: "Chart"
                    },
                    legend: {
                        visible: true,
                        position: "top",
                    },
                    dataSource: {
                        data: chartJSON
                    },
                    seriesDefaults: {
                        type: chartType,
                        labels: {
                            visible: true,
                            background: "transparent"
                        }
                    },
                    series: seriesChart,
                    valueAxis: columnsChart,
                    categoryAxis: rowsChart,
                    tooltip: {
                        visible: true,
                        template: "#= series.name #: #= value #"
                    }
                }).data("kendoChart");
            }
        },
        /*
        Function:Update Table.
        */
        updateGrid: function (container, identifiner, data) {
            if ($("#rowBox li").length == 0 && $("#columnBox li").length == 0 && $("#dataBox li").length == 0) {
                reportBuilderContainer.eventBind.createTable(container, identifiner);
            }
            else {
                var tableType = identifiner;
                var tempColumn = [];
                var columnTemplate = [];
                tempColumn = reportBuilderContainer.eventBind.rowsArray.concat(reportBuilderContainer.eventBind.columnsArray, reportBuilderContainer.eventBind.seriesArray);
                if (!changeGridPropertyFlag) {
                    reportBuilderContainer.eventBind.initializeGridPropertyData(tempColumn);
                }
                var attrClass = { "class": "leftAlign" };
                var headerAttrClass = { "class": "headerLeftAlign" }

                $("#gridColumnSel").find("option").each(function (key, value) {
                    if (key != 0) {
                        if ($(this).attr("data-title") == "") {
                            var template = { field: tempColumn[key - 1], title: tempColumn[key - 1], attributes: attrClass, headerAttributes: headerAttrClass };
                        }
                        else {
                            var template = { field: tempColumn[key - 1], title: $(this).attr("data-title"), attributes: { "class": $(this).attr("data-align") }, headerAttributes: { "class": $(this).attr("header-align") } };
                        }

                        columnTemplate.push(template);
                    }
                });
                var sortableTemplate = $("#gridSortBox input:radio[current='true']").val() == "false" ? false : true;
                var editableTemplate = $("#gridEditBox input:radio[current='true']").val() == "false" ? false : true;
                var filterableTemplate = $("#gridFilterBox input:radio[current='true']").val() == "false" ? false : true;



                if (reportBuilderContainer.eventBind.currentGrid) {
                    reportBuilderContainer.eventBind.currentGrid.destroy();
                    $(container).empty();
                }
                reportBuilderContainer.eventBind.currentGrid = $(container).kendoGrid({
                    dataSource: {
                        data: chartJSON,
                        pageSize: 10
                    },
                    columns: columnTemplate,
                    sortable: sortableTemplate,
                    filterable: filterableTemplate,
                    editable: editableTemplate
                }).data("kendoGrid");
            }
        },
        /*
        Function:rename chart tab name.
        */
        bindChartPaneTabRename: function () {
            $("#chartMainPane .jCarouselLite .ui-tabs-nav li").unbind("dblclick").bind("dblclick", function (e) {
                //e.stopPropagation();
                $(this).find("a.ui-tabs-anchor span").addClass("hide")
                $(this).find("a.ui-tabs-anchor input").removeClass("hide").select();
            });
            $("#chartMainPane .jCarouselLite .ui-tabs-nav li a.ui-tabs-anchor input").unbind("keyup").bind("keyup", function (e) {
                $(this).parent().find("span").text($(this).val());
                var index = $(this).parent().parent().index();
                $(".tabSwitchOptionItems li.tabSwitchOptionItem").eq(index).text($(this).val());
            });
            $("#chartMainPane .jCarouselLite .ui-tabs-nav li a.ui-tabs-anchor input").unbind("blur").bind("blur", function (e) {
                $(this).addClass("hide");
                $(this).parent().find("span").removeClass("hide");
            });

            $("#chartMainPane .jCarouselLite .ui-tabs-nav li").unbind("click").bind("click", function (e) {
                //e.stopPropagation();
                if (!$(e.target).hasClass("ui-icon")) {
                    var index = $(this).index();
                    var $showChart = $("#chartMainPane .ui-tabs-panel").eq(index).find(".showChart");
                    if ($showChart.attr("grid-type") == null && $showChart.attr("chart-type") == null) {
                        $("#chartPropertyBox").addClass("hide");
                        $("#gridPropertyBox").addClass("hide");
                    }
                    else {
                        if ($showChart.attr("chart-type") != null) {
                            reportBuilderContainer.eventBind.currentChart = $showChart.data("kendoChart");
                            $("#chartPropertyBox").removeClass("hide");
                            $("#gridPropertyBox").addClass("hide");
                        }
                        else {
                            reportBuilderContainer.eventBind.currentGrid = $showChart.data("kendoGrid");
                            $("#chartPropertyBox").addClass("hide");
                            $("#gridPropertyBox").removeClass("hide");
                        }
                    }

                    reportBuilderContainer.eventBind.updateFieldBoxMappingChartTab();
                }


            });
        },
        /*
        Function:add tab items for tool bar.
        */
        bindToolBarTabSwitchAddEvent: function () {
            var tabItem = $("#chartMainPane .jCarouselLite li:last input").val();
            var html = "<li class='tabSwitchOptionItem'>" + tabItem + "</li>";
            var h = 25;
            var count = 8;
            if ($(".tabSwitchOptionItems li.tabSwitchOptionItem").length >= count) {
                if ($(".tabSwitchEx").length == 0) {
                    var exHtml = "<li class='tabSwitchEx'><span class='collapsed'></span></li>"
                    $(".tabSwitchOptionItems").append(exHtml);
                    var height = h * (count + 1);
                    $(".tabSwitchOptionItems").css("height", height + "px");
                    html = "<li class='tabSwitchOptionItem hide'>" + tabItem + "</li>"
                    $(".tabSwitchOptionItems .tabSwitchEx").before(html);

                    reportBuilderContainer.eventBind.bindToolBarTabSwitchExEvent();
                }
                else {
                    html = "<li class='tabSwitchOptionItem hide'>" + tabItem + "</li>"
                    $(".tabSwitchOptionItems .tabSwitchEx").before(html);
                }
            }
            else {
                $(".tabSwitchOptionItems").append(html);
            }
        },
        /*
        Function:expand or collapse toolbar tabs items.
        */
        bindToolBarTabSwitchExEvent: function () {
            var h = 25;
            var count = 8;
            $(".tabSwitchOptionItems li.tabSwitchEx").unbind("click").bind("click", function (e) {
                e.stopPropagation();
                if ($(this).find("span").hasClass("collapsed")) {
                    $(".tabSwitchOptionItems").css("height", "auto");
                    $(".tabSwitchOptionItems").find("li.tabSwitchOptionItem.hide").removeClass("hide");
                    $(this).find("span").removeClass("collapsed").addClass("expanded");
                }
                else {
                    var height = h * (count + 1);
                    $(".tabSwitchOptionItems").css("height", height + "px");
                    $(".tabSwitchOptionItems").find("li.tabSwitchOptionItem:gt(" + (count - 1) + ")").addClass("hide");
                    $(this).find("span").addClass("collapsed").removeClass("expanded");
                }
            });
        },
        /*
        Function:switch toolbar tabs items.
        */
        bindToolBarTabSwitchExRevertEvent: function () {
            var h = 25;
            var count = 8;
            var height = h * (count + 1);
            if ($(".tabSwitchOptionItems").find("li.tabSwitchOptionItem").length > count) {
                $(".tabSwitchOptionItems").css("height", height + "px");
            }
            else {
                $(".tabSwitchOptionItems").css("height", "auto");
            }
            $(".tabSwitchOptionItems").find("li.tabSwitchOptionItem:gt(" + (count - 1) + ")").addClass("hide");
            $(".tabSwitchOptionItems li.tabSwitchEx").find("span").addClass("collapsed").removeClass("expanded");
        },
        /*
        Function:delete toolbar tabs item which is deleted in chartMainPane tabs.
        */
        bindToolBarTabSwitchDeleteEvent: function (index) {
            var count = 8;
            $(".tabSwitchOptionItems").find("li.tabSwitchOptionItem").eq(index).remove();

            if ($(".tabSwitchOptionItems").find("li.tabSwitchOptionItem").length <= count) {
                $(".tabSwitchOptionItems .tabSwitchEx").remove();
                $(".tabSwitchOptionItems").css("height", "auto");
            }

            if (index < count) {
                $(".tabSwitchOptionItems").find("li.tabSwitchOptionItem.hide:first").removeClass("hide");
            }
        },
        /*
        Function:switch toolbar tabs item and active in chartMainPane tabs.
        */
        bindToolBarTabSwitchEvent: function () {
            $(".tabSwitchOptionItems li.tabSwitchOptionItem").unbind("click").bind("click", function (e) {
                reportBuilderContainer.eventBind.bindToolBarTabSwitchExRevertEvent();
                var curIndex = $("#chartMainPane .jCarouselLite li").index($("#chartMainPane .jCarouselLite li.ui-tabs-active"));
                var index = $(this).index();
                $("#chartPaneTabs").tabs({
                    active: index
                });
                var container_width = parseInt($("#chartMainPane .jCarouselLite").css("width").replace("px", ""));
                var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
                var page = Math.floor(container_width / tab_width);
                var tab_count = $("#chartMainPane .jCarouselLite li").length;
                var totalSlide = Math.floor(tab_count / page);
                var left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                if (index < page) {
                    left = 0;
                    $("#chartMainPane .jCarouselLite ul").css("left", left);
                }
                else {
                    var slide = Math.floor((index + 1) / page);
                    if (index < curIndex) {
                        if (tab_count - (index + 1) >= page) {
                            left = (-1) * tab_width * (page * slide);
                        }
                        $("#chartMainPane .jCarouselLite ul").css("left", left);
                    }
                    else {
                        if (tab_count - (index + 1) >= page) {
                            left = (-1) * tab_width * (page * slide);
                        }
                        else {
                            left = (-1) * tab_width * (page * (totalSlide - 1) + tab_count - page * totalSlide);
                        }

                        $("#chartMainPane .jCarouselLite ul").css("left", left);
                    }
                }

                $("#chartMainPane .jCarouselLite .ui-tabs-nav li").eq(index).trigger("click");
            });
        },
        /*
        Function:chartMainPane tabs events,include add, delete event.
        */
        bindChartPaneTabEvent: function () {
            var tabTemplate = "<li><a href='#{href}'><span>#{label}</span><input class='hide' type='text' value='#{label}' size='10' /></a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
            var tabCounter = 2;
            var tabs = $("#chartPaneTabs").tabs();
            $("#chartMainPane .jCarouselLite ul").css("left", "0");
            reportBuilderContainer.eventBind.bindChartPaneTabRename();
            $(".showDescription").accordion({
                collapsible: true,
                active: false
            });
            var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
            var container_width = Math.floor(($("#chartMainPane .jCarouselLiteContainer").outerWidth() - $("#chartMainPane .jCarouselButtons").outerWidth()) / (tab_width)) * (tab_width);
            $("#chartMainPane .jCarouselLite").css("width", container_width + "px");

            $("#chartMainPane .addTabButton").unbind("click").bind("click", function (e) {
                var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
                var container_width = Math.floor(($("#chartMainPane .jCarouselLiteContainer").outerWidth() - $("#chartMainPane .jCarouselButtons").outerWidth()) / (tab_width)) * (tab_width);
                $("#chartMainPane .jCarouselLite").css("width", container_width + "px");
                var label = "Tab " + tabCounter,
                id = "chartPaneTab-" + tabCounter,
                li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label)),
                tabContentHtml = "";
                tabs.find(".ui-tabs-nav").append(li);
                tabs.append("<div id='" + id + "'><div class='showChart'></div><div class='showDescription'><h5>Description:</h5><div class='dexcriptionText'><textarea draggable='false' rows='3'></textarea></div></div></div>");
                //$(".addTabButton").parent("li").appendTo("#chartPaneTabs ul.labelTabs");
                tabs.tabs("refresh");

                reportBuilderContainer.eventBind.bindLayoutChartDragAndDropEvent();
                reportBuilderContainer.eventBind.bindChartPaneTabRename();
                reportBuilderContainer.eventBind.bindToolBarTabSwitchAddEvent();
                reportBuilderContainer.eventBind.bindToolBarTabSwitchEvent();
                reportBuilderContainer.eventBind.bindChartTabPaneHeightCalEvent();

                var currIndex = $("#chartMainPane .jCarouselLite li").length;
                $("#chartPaneTabs").tabs({
                    active: currIndex - 1
                });

                $(".toolIcon .deleteIcon").trigger("click");
                $("#chartPropertyBox").addClass("hide");
                $("#gridPropertyBox").addClass("hide");

                var tab_count = $("#chartMainPane .jCarouselLite li").length;
                var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
                var page = Math.floor(container_width / tab_width);
                var total_width = $("#chartMainPane .jCarouselLite li").outerWidth() * tab_count;
                $("#chartMainPane .jCarouselLite ul").css("width", total_width + "px");

                if (tab_count > page) {
                    var left = (-1) * (tab_count - page) * tab_width;
                    $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                }

                tabCounter++;
                $(".showDescription").accordion({
                    collapsible: true,
                    active: false
                });
            });
            // close icon: removing the tab on click
            tabs.delegate("span.ui-icon-close", "click", function (e) {
                e.stopPropagation();
                var tab_count = $("#chartMainPane .jCarouselLite li").length;
                var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
                var container_width = Math.floor(($("#chartMainPane .jCarouselLiteContainer").outerWidth() - $("#chartMainPane .jCarouselButtons").outerWidth()) / (tab_width)) * (tab_width);
                $("#chartMainPane .jCarouselLite").css("width", container_width + "px");
                var total_width = $("#chartMainPane .jCarouselLite li").outerWidth() * tab_count;
                $("#chartMainPane .jCarouselLite ul").css("width", total_width + "px");
                var page = Math.floor(container_width / tab_width);
                var left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                var maxLeft = (-1) * (tab_count - page) * tab_width;
                if (left == maxLeft) {
                    if (left != 0) {
                        left = left + tab_width;
                        $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                    }
                }
                var delIndex = $("#chartMainPane .jCarouselLite li").index($(this).closest("li"));

                var aria_selected = $(this).closest("li").attr("aria-selected");

                var panelId = $(this).closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                tabs.tabs("refresh");

                reportBuilderContainer.eventBind.bindToolBarTabSwitchDeleteEvent(delIndex);
                reportBuilderContainer.eventBind.bindChartTabPaneHeightCalEvent();

                if (aria_selected == "true") {

                    $("#chartMainPane .jCarouselLite .ui-tabs-nav li").eq(delIndex - 1).trigger("click");
                }
            });
            //tabs.bind("keyup", function (event) {
            //    if (event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE) {
            //        var panelId = tabs.find(".ui-tabs-active").remove().attr("aria-controls");
            //        $("#" + panelId).remove();
            //        tabs.tabs("refresh");
            //    }
            //});
        },
        /*
        Function:chartMainPane tabs events,include prev, next event.
        */
        bindJCarouselTabPrevNextEvent: function () {

            var tab_count = 0;
            var minLeft = 0;
            var maxLeft = 0;
            var left = 0;
            var container_width = parseInt($("#chartMainPane .jCarouselLite").css("width").replace("px", ""));
            var tab_width = $("#chartMainPane .jCarouselLite li").outerWidth();
            var page = Math.floor(container_width / tab_width);
            var isClick = true;
            $("#chartMainPane .jCarouselButtons .prev").unbind("click").bind("click", function () {
                if (isClick) {
                    left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                    if (left < minLeft) {
                        left = left + tab_width;
                    }
                    $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                }
            });
            $("#chartMainPane .jCarouselButtons .next").unbind("click").bind("click", function () {
                if (isClick) {
                    left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                    tab_count = $("#chartMainPane .jCarouselLite li").length;
                    container_width = parseInt($("#chartMainPane .jCarouselLite").css("width").replace("px", ""));
                    page = Math.floor(container_width / tab_width);
                    maxLeft = (-1) * (tab_count - page) * tab_width;
                    if (left > maxLeft) {
                        left = left - tab_width;
                    }
                    $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                }
            });
            var p_timer = null;
            $("#chartMainPane .jCarouselButtons .prev").unbind("mousedown").bind("mousedown", function () {
                var i = 0;
                isClick = true;
                left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                p_timer = setInterval(function () {
                    if (left < minLeft) {
                        left = left + tab_width;
                    }
                    $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                    isClick = false;
                }, 200);
            }).unbind("mouseup").bind("mouseup", function () {
                clearTimeout(p_timer);
            });

            var n_timer = null;
            $("#chartMainPane .jCarouselButtons .next").unbind("mousedown").bind("mousedown", function () {
                var i = 0;
                isClick = true;
                left = parseInt($("#chartMainPane .jCarouselLite ul").css("left").replace("px", ""));
                tab_count = $("#chartMainPane .jCarouselLite li").length;
                container_width = parseInt($("#chartMainPane .jCarouselLite").css("width").replace("px", ""));
                page = Math.floor(container_width / tab_width);
                maxLeft = (-1) * (tab_count - page) * tab_width;
                n_timer = setInterval(function () {
                    if (left > maxLeft) {
                        left = left - tab_width;
                    }
                    $("#chartMainPane .jCarouselLite ul").css("left", left + "px");
                    isClick = false;
                }, 200);
            }).unbind("mouseup").bind("mouseup", function () {
                clearTimeout(n_timer);
            });
        },
        /*
        Function:bind Views Events
       */
        bindViewsEvents: function () {
            reportBuilderContainer.eventBind.bindViewTreeListEvent();
            reportBuilderContainer.eventBind.bindViewBoxSizeCalevent();
            /*For each view drag and drop*/
            reportBuilderContainer.eventBind.bindViewDragAndDropEvent();
            /*For each view list drag and drop*/
            reportBuilderContainer.eventBind.bindViewListDragAndDropEvent();
            reportBuilderContainer.eventBind.bindViewModalSwitchEvent();
        },
        /*
        Function:bind View TreeList Event
       */
        bindViewTreeListEvent: function () {
            $("#bindSubjectViews .bindViewsBox").kendoTreeView();
        },
        /*
        Function:bind ViewBox Size Calculate event
       */
        bindViewBoxSizeCalevent: function () {
            reportBuilderContainer.eventBind.bindChartViewPaneColumnHeightCalEvent();
            reportBuilderContainer.eventBind.bindChartViewPaneRowHeightCalEvent();

        },
        /*
        Function:bind ViewBox Size Calculate event
       */
        bindChartViewPaneColumnHeightCalEvent: function () {
            var mainPaneHeight = $("#centerRegion").height();
            var panePadding = 20;
            var toolHeight = 0;
            var boxPadding = 40;
            var border = 2;
            var boxHeight = 0;
            boxHeight = mainPaneHeight - panePadding - toolHeight - boxPadding - border;
            $("#chartMainView .columnView").not(".rowView").not(".quarterView").find("ul.viewBox").css("height", boxHeight + "px");
            $("#chartMainView #oneRowView").find("ul.viewBox").css("height", boxHeight + "px");
        },
        /*
        Function:bind ChartViewPane RowHeight Cal Event
       */
        bindChartViewPaneRowHeightCalEvent: function () {
            var mainPaneHeight = $("#centerRegion").height();
            var panePadding = 20;
            var toolHeight = 0;
            var boxPadding = 40;
            var border = 2;
            var boxMargin = 30;
            var paneHeight = mainPaneHeight - panePadding - toolHeight - boxPadding - border;

            var twoRowViewBoxCount = 2;
            var twoRowViewBoxHeight = (paneHeight - boxMargin * (twoRowViewBoxCount - 1) - twoRowViewBoxCount) / (twoRowViewBoxCount);
            $("#chartMainView #twoRowView ul.viewBox").css("height", twoRowViewBoxHeight + "px");

            //var threeRowViewBoxCount = 3;
            //var threeRowViewBoxHeight = (paneHeight - boxMargin * (threeRowViewBoxCount - 1) - threeRowViewBoxCount) / (threeRowViewBoxCount);
            //$("#chartMainView #threeRowView ul.viewBox").css("height", threeRowViewBoxHeight + "px");

            var quarterViewBoxCount = 2;
            var quarterViewBoxHeight = (paneHeight - boxMargin * (quarterViewBoxCount - 1) - quarterViewBoxCount) / (quarterViewBoxCount);
            $("#chartMainView #quarterView ul.viewBox").css("height", twoRowViewBoxHeight + "px");
        },
        /*
        Function:switch View Mode for one, two and three columns.
        */
        bindViewModalSwitchEvent: function () {
            $("#viewModal li").unbind("click").bind("click", function () {
                var container;
                $("#tempViewContainer").html("");
                $("#viewContainer .columnView.hide ul.viewBox").html("");
                var $defaultBox = $("#viewContainer .columnView.default");
                $defaultBox.find("li").clone().appendTo($("#tempViewContainer"));
                var count = $("#tempViewContainer").find("li").length;
                var index = $(this).attr("data-id");
                switch (index) {
                    case "1c":
                        if (!$("#oneColumnView").hasClass("default")) {
                            if ($("#oneColumnView ul.viewBox").html() == "") {
                                $("#oneColumnView ul.viewBox").each(function (index, value) {
                                    $("#tempViewContainer").find("li").appendTo($("#oneColumnView ul.viewBox"));
                                });
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#oneColumnView").removeClass("hide").addClass("default");
                        container = $("#oneColumnView");
                        break;
                    case "1r":
                        if (!$("#oneRowView").hasClass("default")) {
                            if ($("#oneRowView ul.viewBox").html() == "") {
                                $("#oneRowView ul.viewBox").each(function (index, value) {
                                    $("#tempViewContainer").find("li").appendTo($("#oneRowView ul.viewBox"));
                                });
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#oneRowView").removeClass("hide").addClass("default");
                        container = $("#oneRowView");
                        break;
                    case "2c":
                        if (!$("#twoColumnView").hasClass("default")) {
                            if ($("#twoColumnView ul.viewBox").html() == "") {
                                for (i = 0; i < count; i++) {
                                    if (i % 2 === 0) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#twoColumnView ul.viewBox").eq(0));
                                    } else {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#twoColumnView ul.viewBox").eq(1));
                                    }
                                }
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#twoColumnView").removeClass("hide").addClass("default");
                        container = $("#twoColumnView");
                        break;
                    case "2r":
                        if (!$("#twoRowView").hasClass("default")) {
                            if ($("#twoRowView ul.viewBox").html() == "") {
                                for (i = 0; i < count; i++) {
                                    if (i % 2 === 0) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#twoRowView ul.viewBox").eq(0));
                                    } else {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#twoRowView ul.viewBox").eq(1));
                                    }
                                }
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#twoRowView").removeClass("hide").addClass("default");
                        container = $("#twoRowView");
                        break;
                    case "3c":
                        if (!$("#threeColumnView").hasClass("default")) {
                            if ($("#threeColumnView ul.viewBox").html() == "") {
                                for (i = 0; i < count; i++) {
                                    if (i % 3 === 0) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#threeColumnView ul.viewBox").eq(0));
                                    } else if (i % 3 === 1) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#threeColumnView ul.viewBox").eq(1));
                                    }
                                    else {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#threeColumnView ul.viewBox").eq(2));
                                    }
                                }
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#threeColumnView").removeClass("hide").addClass("default");
                        container = $("#threeColumnView");
                        break;
                        //case "3r":
                        //    if (!$("#threeRowView").hasClass("default")) {
                        //        if ($("#threeRowView ul.viewBox").html() == "") {
                        //            for (i = 0; i < count; i++) {
                        //                if (i % 3 === 0) {
                        //                    $("#tempViewContainer").find("li").eq(0).appendTo($("#threeRowView ul.viewBox").eq(0));
                        //                } else if (i % 3 === 1) {
                        //                    $("#tempViewContainer").find("li").eq(0).appendTo($("#threeRowView ul.viewBox").eq(1));
                        //                }
                        //                else {
                        //                    $("#tempViewContainer").find("li").eq(0).appendTo($("#threeRowView ul.viewBox").eq(2));
                        //                }
                        //            }
                        //        }
                        //    }
                        //    $(".columnView").addClass("hide").removeClass("default");
                        //    $("#threeRowView").removeClass("hide").addClass("default");
                        //    container = $("#threeRowView");
                        //    break;
                    case "4":
                        if (!$("#quarterView").hasClass("default")) {
                            if ($("#quarterView ul.viewBox").html() == "") {
                                for (i = 0; i < count; i++) {
                                    if (i % 4 === 0) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#quarterView ul.viewBox").eq(0));
                                    } else if (i % 4 === 1) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#quarterView ul.viewBox").eq(1));
                                    }
                                    else if (i % 4 === 2) {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#quarterView ul.viewBox").eq(2));
                                    }
                                    else {
                                        $("#tempViewContainer").find("li").eq(0).appendTo($("#quarterView ul.viewBox").eq(3));
                                    }
                                }
                            }
                        }
                        $(".columnView").addClass("hide").removeClass("default");
                        $("#quarterView").removeClass("hide").addClass("default");
                        container = $("#quarterView");
                        break;
                }
                container.find("ul.viewBox").each(function () {
                    var count = $(this).find("li").length;
                    reportBuilderContainer.eventBind.bindViewSwitchPositionChangeEvent($(this), count);
                });
                reportBuilderContainer.eventBind.bindViewModalDeleteEvent();
            });
        },
        /*
        Function:drag and drop view mode items.
        */
        bindViewDragAndDropEvent: function () {
            $("#bindSubjectViews li.bindViewsItem").draggable({
                helper: "clone",
                //connectToSortable: "#chartMainView ul.viewBox",
                cancel: ".ui-state-disabled"
            });

            //$("#chartMainView ul.viewBox").sortable({
            //    connectWith: "#chartMainView ul.viewBox"
            //}).disableSelection();
            $("#chartMainView ul.viewBox").droppable({
                accept: "#bindSubjectViews li.bindViewsItem",
                activeClass: "ui-state-hover",
                revert: "invalid",
                drop: function (event, ui) {
                    if ($(this).find(".ui-draggable.hide").text() == ui.draggable.text()) {
                        $(this).find(".ui-draggable.hide").removeClass("hide");
                        ui.draggable.remove();

                    }
                    else {
                        //need some code...
                        $(this).find(".placeholder").remove();

                        var xAxis = ui.draggable.attr("x-data");
                        var yAxis = ui.draggable.attr("v-data").split(",");
                        var type = ui.draggable.attr("type");

                        var html = "<li class='viewItem' x-data='" + xAxis + "' v-data='" + ui.draggable.attr("v-data") + "' type='" + type + "'><i class='fa-remove'></i><div></div></li>";
                        $(html).appendTo(this);
                        $("#chartMainView ul.viewBox").removeClass("ui-state-default");
                        var count = $(this).find("li").length;
                        var container = $(this);

                        reportBuilderContainer.eventBind.bindViewPositionEvent(container, count, xAxis, yAxis, type);

                        reportBuilderContainer.eventBind.bindViewModalDeleteEvent();
                    }

                }
            });
            $("#chartMainView ul.viewBox").sortable({
                connectWith: "#chartMainView ul.viewBox",
                containment: 'window',
                placeholder: "viewItem-placeholder",
                sort: function (event, ui) {
                    var $container = $("li.ui-sortable-helper").parent();
                    var count = $container.find("li").not(".ui-sortable-helper").length;
                    reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
                },
                over: function (event, ui) {
                    var $container = $(this);
                    var count = $container.find("li").not(".ui-sortable-helper").length;
                    if ($container.find("li.ui-sortable-helper").length > 0 && $container.find("li.viewItem-placeholder").length > 0) {
                        count = $container.find("li").not(".viewItem-placeholder").not(".ui-sortable-helper").length;
                    }
                    reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
                },
                out: function (event, ui) {
                    var $container = $(this);
                    var count = $container.find("li").not(".viewItem-placeholder").not(".ui-sortable-helper").length;
                    reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
                },
                remove: function (event, ui) {
                    var $container = $(this);
                    var count = $container.find("li").length;
                    reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
                },
                receive: function (event, ui) {
                    var $container = $(this);
                    var count = $container.find("li").not(".ui-sortable-helper").length;
                    reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
                }

            }).disableSelection();
        },
        /*
        Function:bind Layout View Drop Position event
       */
        bindLayoutViewDropPositionevent: function (container, xAxis, yAxis, type) {
            var count = container.find("li.viewItem").length;
            reportBuilderContainer.eventBind.bindViewPositionEvent(container, count, xAxis, yAxis, type);
            reportBuilderContainer.eventBind.bindViewModalDeleteEvent();
        },
        /*
        Function:bind OneLayout View Drop Event
       */
        bindOneLayoutViewDropEvent: function (drop, drag) {
            drag.each(function (e, v) {
                var xAxis = $(this).attr("x-data");
                var yAxis = $(this).attr("v-data").split(",");
                var type = $(this).attr("type");
                var html = "<li class='viewItem' x-data='" + xAxis + "' v-data='" + $(this).attr("v-data") + "' type='" + type + "'><i class='fa-remove'></i><div></div></li>";
                $(html).appendTo(drop.find("ul.viewBox"));
                var container = drop.find("ul.viewBox");
                reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
            });
        },
        /*
        Function:bind TwoLayout View Drop Event
       */
        bindTwoLayoutViewDropEvent: function (drop, drag) {
            drag.each(function (e, v) {
                var xAxis = $(this).attr("x-data");
                var yAxis = $(this).attr("v-data").split(",");
                var type = $(this).attr("type");
                var html = "<li class='viewItem' x-data='" + xAxis + "' v-data='" + $(this).attr("v-data") + "' type='" + type + "'><i class='fa-remove'></i><div></div></li>";
                if (e % 2 === 0) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(0));
                    var container = drop.find("ul.viewBox").eq(0);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else {
                    $(html).appendTo(drop.find("ul.viewBox").eq(1));
                    var container = drop.find("ul.viewBox").eq(1);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
            });
        },
        /*
        Function:bind ThreeLayout View Drop Event
       */
        bindThreeLayoutViewDropEvent: function (drop, drag) {
            drag.each(function (e, v) {
                var xAxis = $(this).attr("x-data");
                var yAxis = $(this).attr("v-data").split(",");
                var type = $(this).attr("type");
                var html = "<li class='viewItem' x-data='" + xAxis + "' v-data='" + $(this).attr("v-data") + "' type='" + type + "'><i class='fa-remove'></i><div></div></li>";
                if (e % 3 === 0) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(0));
                    var container = drop.find("ul.viewBox").eq(0);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else if (e % 3 === 1) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(1));
                    var container = drop.find("ul.viewBox").eq(1);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else if (e % 3 === 2) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(2));
                    var container = drop.find("ul.viewBox").eq(2);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
            });
        },
        /*
        Function:bind QuaterLayout View Drop Event
       */
        bindQuaterLayoutViewDropEvent: function (drop, drag) {
            drag.each(function (e, v) {
                var xAxis = $(this).attr("x-data");
                var yAxis = $(this).attr("v-data").split(",");
                var type = $(this).attr("type");
                var html = "<li class='viewItem' x-data='" + xAxis + "' v-data='" + $(this).attr("v-data") + "' type='" + type + "'><i class='fa-remove'></i><div></div></li>";
                if (e % 4 === 0) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(0));
                    var container = drop.find("ul.viewBox").eq(0);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else if (e % 4 === 1) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(1));
                    var container = drop.find("ul.viewBox").eq(1);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else if (e % 4 === 2) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(2));
                    var container = drop.find("ul.viewBox").eq(2);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
                else if (e % 4 === 3) {
                    $(html).appendTo(drop.find("ul.viewBox").eq(3));
                    var container = drop.find("ul.viewBox").eq(3);
                    reportBuilderContainer.eventBind.bindLayoutViewDropPositionevent(container, xAxis, yAxis, type);
                }
            });
        },
        /*
        Function:bind ViewList DragAndDrop Event
       */
        bindViewListDragAndDropEvent: function () {
            $("#bindSubjectViews li.bindViewsList").draggable({
                helper: "clone",
                cancel: ".ui-state-disabled"
            });

            $("#chartMainView .columnView").droppable({
                accept: "#bindSubjectViews li.bindViewsList",
                activeClass: "ui-state-hover",
                revert: "invalid",
                drop: function (event, ui) {
                    if ($(this).find(".ui-draggable.hide").text() == ui.draggable.text()) {
                        $(this).find(".ui-draggable.hide").removeClass("hide");
                        ui.draggable.remove();

                    }
                    else {
                        $(this).find(".placeholder").remove();

                        var items = ui.draggable.find("li.bindViewsItem");
                        var box = $(this).find("ul.viewBox");
                        var boxId = $(this).attr("id");
                        switch (boxId) {
                            case "oneColumnView":
                                reportBuilderContainer.eventBind.bindOneLayoutViewDropEvent($(this), items);
                                break;
                            case "oneRowView":
                                reportBuilderContainer.eventBind.bindOneLayoutViewDropEvent($(this), items);
                                break;
                            case "twoColumnView":
                                reportBuilderContainer.eventBind.bindTwoLayoutViewDropEvent($(this), items);
                                break;
                            case "twoRowView":
                                reportBuilderContainer.eventBind.bindTwoLayoutViewDropEvent($(this), items);
                                break;
                            case "threeColumnView":
                                reportBuilderContainer.eventBind.bindThreeLayoutViewDropEvent($(this), items);
                                break;
                            case "quarterView":
                                reportBuilderContainer.eventBind.bindQuaterLayoutViewDropEvent($(this), items);
                                break;
                            default: break;
                        }

                        $("#chartMainView ul.viewBox").removeClass("ui-state-default");
                    }
                }
            });
        },
        /*
        Function:draw TempView chart
       */
        drawTempViewchart: function (chartContainer, xAxis, yAxis, type) {
            var seriesChart = [];
            for (i = 0; i < yAxis.length; i++) {
                seriesChart.push({ name: yAxis[i], field: yAxis[i] });
            }
            $(chartContainer).kendoChart({
                title: {
                    text: "ChartView"
                },
                legend: {
                    visible: true,
                    position: "top",
                },
                dataSource: {
                    data: tempViewJSON
                },
                seriesDefaults: {
                    type: type,
                    labels: {
                        visible: true,
                        background: "transparent"
                    }
                },
                series: seriesChart,
                categoryAxis: {
                    name: xAxis,
                    field: xAxis
                },
                tooltip: {
                    visible: true,
                    template: "#= series.name #: #= value #"
                }
            }).data("kendoChart");
        },
        /*
        Function:bind ViewModal Delete Event
       */
        bindViewModalDeleteEvent: function () {
            $("#chartMainView li.viewItem > i").unbind("click").bind("click", function () {
                var item = $(this).parent("li.viewItem");
                var $container = item.parent("ul");
                item.remove();
                var count = $container.find("li.viewItem").length;
                reportBuilderContainer.eventBind.bindViewDeletePositionChangeEvent($container, count);
            });
        },
        /*
        Function:calculate view's width when position changed.
        */
        bindViewPositionEvent: function (container, count, xAxis, yAxis, type) {
            var paneWidth = container.width() - 2;
            var paneHeight = container.height() - 2;
            var perW = 0;
            var perH = 0;
            if (!container.parent().hasClass("rowView") && !container.parent().hasClass("quarterView")) {
                perW = paneWidth - 2;
                perH = (paneHeight - (count - 1) * 2) / (count);
            }
            else if (container.parent().hasClass("quarterView")) {
                perH = (paneHeight - (count - 1) * 2) / (count);
                perW = paneWidth - 2;
            }
            else {
                perH = paneHeight;
                perW = (paneWidth - 1 - (count - 1) * 2) / (count);
            }

            container.find("li.viewItem ").css("width", perW + "px").css("height", perH + "px");
            container.find("li.viewItem-placeholder ").css("width", perW + "px").css("height", perH + "px");
            $("li.viewItem.ui-sortable-helper").css("width", perW + "px").css("height", "50px");

            if (container.find("li.viewItem:last").data("kendoChart") == null) {
                var chartContainer = container.find("li.viewItem:last > div");
                reportBuilderContainer.eventBind.drawTempViewchart(chartContainer, xAxis, yAxis, type);
            }
            container.find("li.viewItem").not(".ui-sortable-helper").each(function () {
                $(this).children("div").data("kendoChart").redraw();
            });
        },
        /*
        Function:bind View Position Change Event
        */
        bindViewPositionChangeEvent: function (container, count) {
            var paneWidth = container.width() - 2;
            var paneHeight = container.height() - 2;
            var perW = 0;
            var perH = 0;
            if (!container.parent().hasClass("rowView") && !container.parent().hasClass("quarterView")) {
                perW = paneWidth - 2;
                perH = (paneHeight - (count - 1) * 2) / (count);
            }
            else if (container.parent().hasClass("quarterView")) {
                perH = (paneHeight - (count - 1) * 2) / (count);
                perW = paneWidth - 2;
            }
            else {
                perH = paneHeight;
                perW = (paneWidth - 1 - (count - 1) * 2) / (count);
            }

            container.find("li.viewItem ").css("width", perW + "px").css("height", perH + "px");
            container.find("li.viewItem-placeholder ").css("width", perW + "px").css("height", perH + "px");
            $("li.viewItem.ui-sortable-helper").css("width", perW + "px").css("height", "50px");
            if (container.find("li.viewItem.ui-sortable-helper").length > 0 && container.find("li.viewItem.viewItem-placeholder").length > 0) {
                container.find("li.viewItem").children("div").css("width", perW + "px").css("height", perH + "px");
            }
            else {
                container.find("li.viewItem").children("div").css("width", "100%").css("height", "100%");
            }
            $("li.viewItem ").not(".ui-sortable-helper").each(function () {
                $(this).children("div").data("kendoChart").redraw();
            });
        },
        /*
        Function:bind View Switch Position Change Event
        */
        bindViewSwitchPositionChangeEvent: function (container, count) {
            var paneWidth = container.width() - 2;
            var paneHeight = container.height() - 2;
            var perW = 0;
            var perH = 0;
            if (!container.parent().hasClass("rowView") && !container.parent().hasClass("quarterView")) {
                perW = paneWidth - 2;
                perH = (paneHeight - (count - 1) * 2) / (count);
            }
            else if (container.parent().hasClass("quarterView")) {
                perH = (paneHeight - (count - 1) * 2) / (count);
                perW = paneWidth - 2;
            }
            else {
                perH = paneHeight;
                perW = (paneWidth - 1 - (count - 1) * 2) / (count);
            }

            container.find("li.viewItem ").css("width", perW + "px").css("height", perH + "px");
            container.find("li.viewItem-placeholder ").css("width", perW + "px").css("height", perH + "px");
            $("li.viewItem.ui-sortable-helper").css("width", perW + "px").css("height", "50px");
            $("li.viewItem ").not(".ui-sortable-helper").each(function () {
                var chartContainer = $(this).children("div");
                var xAxis = $(this).attr("x-data");
                var yAxis = $(this).attr("v-data").split(",");
                var type = $(this).attr("type");
                reportBuilderContainer.eventBind.drawTempViewchart(chartContainer, xAxis, yAxis, type);
            });
        },
        /*
        Function:bind View Delete Position Change Event
        */
        bindViewDeletePositionChangeEvent: function (container, count) {
            var paneWidth = container.width() - 2;
            var paneHeight = container.height() - 2;
            var perW = 0;
            var perH = 0;
            if (!container.parent().hasClass("rowView") && !container.parent().hasClass("quarterView")) {
                perW = paneWidth - 2;
                perH = (paneHeight - (count - 1) * 2) / (count);
            }
            else if (container.parent().hasClass("quarterView")) {
                perH = (paneHeight - (count - 1) * 2) / (count);
                perW = paneWidth - 2;
            }
            else {
                perH = paneHeight;
                perW = (paneWidth - 1 - (count - 1) * 2) / (count);
            }

            container.find("li.viewItem ").css("width", perW + "px").css("height", perH + "px");
            container.find("li.viewItem-placeholder ").css("width", perW + "px").css("height", perH + "px");
            $("li.viewItem.ui-sortable-helper").css("width", perW + "px").css("height", "50px");
            container.find("li.viewItem").each(function () {
                if ($(this).children("div").data("kendoChart") != null) {
                    $(this).children("div").data("kendoChart").redraw();
                }
            });

        },
        /*
        Function:bind Dock Chart View Pane Event
        */
        bindDockChartViewPaneEvent: function () {
            $("#chartMainView .columnView.default .viewBox").each(function () {
                var $container = $(this);
                var count = $container.find("li").length;
                reportBuilderContainer.eventBind.bindViewPositionChangeEvent($container, count);
            })
        },
        /*
        Function:bind Property Pane Event
        */
        bindPropertyPaneEvent: function () {
            reportBuilderContainer.eventBind.bindPropertyArrowEvent();
            reportBuilderContainer.eventBind.bindPropertyPaneAccordionEvent();
            reportBuilderContainer.eventBind.bindPropertyCommonEvent();
            reportBuilderContainer.eventBind.bindPropertyDataBoxEvent();
            reportBuilderContainer.eventBind.bindPropertyRowBoxEvent();
            reportBuilderContainer.eventBind.bindPropertyColumnBoxEvent();
            reportBuilderContainer.eventBind.bindGridPropertyBoxEvent();
        },
        /*
        Function:bind PropertyPane Accordion Event
        */
        bindPropertyPaneAccordionEvent: function () {
            $("#propertyPanel .p_accordionHeader").unbind("click").bind("click", function (e) {
                var $currContent = $(this).next(".p_accordionContent");
                $(".p_accordionContent").not($currContent).slideUp();
                $currContent.slideToggle();

            });
        },
        /*
        Function:bind PropertyArrow Event
        */
        bindPropertyArrowEvent: function () {
            $(".propertyArrow").unbind("click").bind("click", function () {
                var totalWidth = $("#centerRegion").width();
                if ($(this).hasClass("fa-arrow-circle-right")) {
                    var width = $("#centerRegion").width() - reportBuilderContainer.eastMinSize;;
                    var wid = (width / totalWidth * 10000) / 100.00 + "%";
                    $("#propertyPanel").removeClass("expanded");
                    $("#propertyBox").hide();
                    $("#propertyHeader h4").hide();
                    $("#chartPaneContainer").css("width", wid);
                    $(this).removeClass("fa-arrow-circle-right").addClass("fa-arrow-circle-left");
                    reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                    reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();

                }
                else {
                    $(this).addClass("fa-arrow-circle-right").removeClass("fa-arrow-circle-left");
                    var width = $("#centerRegion").width() - reportBuilderContainer.eastMaxSize;;
                    var wid = (width / totalWidth * 10000) / 100.00 + "%";
                    $("#propertyPanel").addClass("expanded");
                    $("#chartPaneContainer").css("width", wid);
                    $("#propertyHeader h4").show();
                    $("#propertyBox").show();
                    reportBuilderContainer.eventBind.bindPropertyAccordionContentHeightCalEvent();
                    reportBuilderContainer.eventBind.bindDockChartViewTabEvent();
                    reportBuilderContainer.eventBind.bindDockChartViewPaneEvent();

                }
            });
        },
        /*
        Function:bind PropertyAccordionContent Height Cal Event
        */
        bindPropertyAccordionContentHeightCalEvent: function () {
            var propertyPaneHeight = $("#propertyPanel").height();
            var propertyHeaderHeight = $("#propertyHeader").height();
            var propertyBoxHeight = propertyPaneHeight - propertyHeaderHeight - 20;
            $("#propertyBox").css("height", propertyBoxHeight + "px");
            var proAccordionHeaderHeight = $("#propertyBox .p_accordionHeader").outerHeight();
            var proAccordionCount = $("#propertyBox .p_accordionHeader").length;
            var proAccordionContentHeight = propertyBoxHeight - proAccordionHeaderHeight * proAccordionCount - 2 - 10;
            $(".p_accordionContent").css("height", proAccordionContentHeight + "px");
        },
        /*
        Function:initialize Chart DataProperty Data
        */
        initializeChartDataPropertyData: function (d_index) {
            if (reportBuilderContainer.eventBind.currentChart != null) {
                if ($("#gap").data("kendoNumericTextBox") == null) {
                    $("#gap").val(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].gap);
                }
                else {
                    $("#gap").data("kendoNumericTextBox").value(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].gap);
                }

                if ($("#spacing").data("kendoNumericTextBox") == null) {
                    $("#spacing").val(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].spacing);
                }
                else {
                    $("#spacing").data("kendoNumericTextBox").value(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].gap);
                }

                if ($("#d_colorpicker").data("kendoColorPicker") == null) {
                    $("#d_colorpicker").val(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].color);
                }
                else {
                    $("#d_colorpicker").data("kendoColorPicker").value(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].color);
                }

                $("#propertyBox #chartPropertyBox #dataTypePropSel").val(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].type == "column" ? "bar" : reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].type);

                $("#propertyBox #chartPropertyBox #reLeNameBox input").val(reportBuilderContainer.eventBind.currentChart.options.series[d_index - 1].name);

                $("#propertyBox #chartPropertyBox #labelFormatBox input").val("{0}");

                $("#propertyBox #chartPropertyBox #tooltipTemplateBox input").val("#= series.name #: #= value #");

            }
        },
        /*
        Function:initialize Chart CommonProperty Data
        */
        initializeChartCommonPropertyData: function () {
            if (reportBuilderContainer.eventBind.currentChart != null) {

                if ($("#c_colorpicker").data("kendoColorPicker") == null) {
                    $("#c_colorpicker").val(reportBuilderContainer.eventBind.currentChart.options.chartArea.background);
                }
                else {
                    $("#c_colorpicker").data("kendoColorPicker").value(reportBuilderContainer.eventBind.currentChart.options.chartArea.background);
                }

                if ($("#p_colorpicker").data("kendoColorPicker") == null) {
                    $("#p_colorpicker").val(reportBuilderContainer.eventBind.currentChart.options.plotArea.background);
                }
                else {
                    $("#p_colorpicker").data("kendoColorPicker").value(reportBuilderContainer.eventBind.currentChart.options.plotArea.background);
                }
            }
        },
        /*
        Function:initialize Grid PropertyData
        */
        initializeGridPropertyData: function (data) {
            $("#propertyBox #gridPropertyBox #gridColumnSel").html("");
            $("#propertyBox #gridPropertyBox #gridColumnSel").append("<option>Choose column</option>");
            $.each(data, function (key, value) {
                var column = value;
                var template = "<option data-title='' data-align=''>" + column + "</option>";
                $("#propertyBox #gridPropertyBox #gridColumnSel").append(template);
            });
            $("#propertyBox #gridPropertyBox #gridColumnBox").addClass("hide");
        },
        /*
        Function:update Grid With Property
        */
        updateGridWithProperty: function () {
            var $container = $("#chartMainPane").find(".ui-tabs-panel[aria-hidden='false']").find(".showChart");
            var identifiner = $container.attr("grid-type");
            reportBuilderContainer.eventBind.updateGrid($container, identifiner, chartJSON);
        },
        /*
        Function:bind Grid PropertyBox Event
        */
        bindGridPropertyBoxEvent: function () {
            //columnMenuvisible
            $("#gridPropertyBox #gridSortBox input:radio").unbind("click").bind("click", function () {
                changeGridPropertyFlag = true;
                var visibility = $(this).val();
                $("#gridPropertyBox #gridSortBox input:radio").attr("current", "false");
                $(this).attr("current", "true");
                reportBuilderContainer.eventBind.updateGridWithProperty();

            });
            $("#gridPropertyBox #gridEditBox input:radio").unbind("click").bind("click", function () {
                changeGridPropertyFlag = true;
                var visibility = $(this).val();
                $("#gridPropertyBox #gridEditBox input:radio").attr("current", "false");
                $(this).attr("current", "true");
                reportBuilderContainer.eventBind.updateGridWithProperty();
            });
            $("#gridPropertyBox #gridFilterBox input:radio").unbind("click").bind("click", function () {
                changeGridPropertyFlag = true;
                var visibility = $(this).val();
                $("#gridPropertyBox #gridFilterBox input:radio").attr("current", "false");
                $(this).attr("current", "true");
                reportBuilderContainer.eventBind.updateGridWithProperty();
            });
            $("#propertyBox #gridPropertyBox #gridColumnSel").unbind("change").bind("change", function () {
                var columnIndex = $("#propertyBox #gridPropertyBox #gridColumnSel").get(0).selectedIndex;
                if (columnIndex != 0) {
                    $("#gridColumnBox").removeClass("hide");
                    var title = reportBuilderContainer.eventBind.currentGrid.options.columns[columnIndex - 1].title;
                    $("#propertyBox #gridPropertyBox #gridColumnBox input.columnTitle").val(title);
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("data-title", title);
                }
                else {
                    $("#gridColumnBox").addClass("hide");
                }
            });

            $("#propertyBox #gridPropertyBox #gridColumnBox input.columnTitle").unbind("keyup").bind("keyup", function () {
                changeGridPropertyFlag = true;
                var columnIndex = $("#propertyBox #gridPropertyBox #gridColumnSel").get(0).selectedIndex;
                var newTitle = $(this).val();
                if (newTitle != "") {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("data-title", newTitle);
                    reportBuilderContainer.eventBind.updateGridWithProperty();
                }
            });

            $("#propertyBox #gridPropertyBox #gridHeaderAlignBox input:radio").unbind("click").bind("click", function () {
                changeGridPropertyFlag = true;
                var columnIndex = $("#propertyBox #gridPropertyBox #gridColumnSel").get(0).selectedIndex;
                var newAlign = $(this).val();
                if (newAlign == "left") {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("header-align", "headerLeftAlign");
                    reportBuilderContainer.eventBind.updateGridWithProperty();
                }
                else if (newAlign == "center") {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("header-align", "headerCenterAlign");

                }
                else {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("header-align", "headerRightAlign");
                }
                reportBuilderContainer.eventBind.updateGridWithProperty();
            });

            $("#propertyBox #gridPropertyBox #gridColAlignBox input:radio").unbind("click").bind("click", function () {
                changeGridPropertyFlag = true;
                var columnIndex = $("#propertyBox #gridPropertyBox #gridColumnSel").get(0).selectedIndex;
                var newAlign = $(this).val();
                if (newAlign == "left") {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("data-align", "leftAlign");
                    reportBuilderContainer.eventBind.updateGridWithProperty();
                }
                else if (newAlign == "center") {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("data-align", "centerAlign");

                }
                else {
                    $("#propertyBox #gridPropertyBox #gridColumnSel").find("option").eq(columnIndex).attr("data-align", "rightAlign");
                }
                reportBuilderContainer.eventBind.updateGridWithProperty();
            });
        },
        /*
        Function:bind Property DataBox Event
        */
        bindPropertyDataBoxEvent: function () {
            reportBuilderContainer.eventBind.bindMappingDataPropertySelectEvent();

            //GapAndSpace
            $("#chartPropertyBox #gap").kendoNumericTextBox();
            $("#chartPropertyBox #spacing").kendoNumericTextBox();
            $("#chartPropertyBox #getGap").unbind("click").bind("click", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                if (reportBuilderContainer.eventBind.currentChart != null) {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].gap = parseFloat($("#gap").val(), 10);
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });
            $("#chartPropertyBox #getSpacing").unbind("click").bind("click", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                if (reportBuilderContainer.eventBind.currentChart != null) {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].spacing = parseFloat($("#spacing").val(), 10);
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });

            //ColorPicker
            $("#chartPropertyBox #d_colorpicker").kendoColorPicker({
                change: function (e) {
                    //alert("The picked color is " + e.value);
                    var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].color = e.value;
                    reportBuilderContainer.eventBind.currentChart.redraw();

                }
            });

            //Type
            $("#propertyBox #chartPropertyBox #dataTypePropSel").unbind("change").bind("change", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var currentIndex = $("#propertyBox #chartPropertyBox #dataTypePropSel").get(0).selectedIndex;
                var newType = $("#propertyBox #chartPropertyBox #dataTypePropSel").find("option:selected").text();
                if (newType == "bar") {
                    newType = "column";
                }
                if (currentIndex != 0) {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].type = newType;
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });

            //LabelVisibility
            $("#propertyBox #chartPropertyBox #labelVisiBox input:radio").unbind("click").bind("click", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var visibility = $(this).val();
                if (visibility == "true") {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].labels.visible = true;
                }
                else {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].labels.visible = false;
                }
                reportBuilderContainer.eventBind.currentChart.redraw();
            });

            //LabelFormat
            $("#propertyBox #chartPropertyBox #labelFormatBox input").unbind('keyup').bind("keyup", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var newFormat = $("#propertyBox #chartPropertyBox #labelFormatBox input").val();
                if (newFormat != "") {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].labels.format = newFormat;
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });

            //TooltipVisibility
            $("#propertyBox #chartPropertyBox #tooltipVisiBox input:radio").unbind("click").bind("click", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var visibility = $(this).val();
                if (visibility == "true") {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].tooltip.visible = true;
                }
                else {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].tooltip.visible = false;
                }
                reportBuilderContainer.eventBind.currentChart.redraw();
            });

            //TooltipFormat
            $("#propertyBox #chartPropertyBox #tooltipTemplateBox input").unbind('keyup').bind("keyup", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var newTemplate = $("#propertyBox #chartPropertyBox #tooltipTemplateBox input").val();
                if (newTemplate != "") {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].tooltip.template = newTemplate;
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });

            //Rename Legend
            $("#propertyBox #chartPropertyBox #reLeNameBox input").unbind('keyup').bind("keyup", function () {
                var dataIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                var newName = $("#propertyBox #chartPropertyBox #reLeNameBox input").val();
                if (newName != "") {
                    reportBuilderContainer.eventBind.currentChart.options.series[dataIndex - 1].name = newName;
                    reportBuilderContainer.eventBind.currentChart.redraw();
                }
            });

            //Legendvisible
            $("#propertyBox #chartPropertyBox #legendVisiBox input:radio").unbind("click").bind("click", function () {
                var visibility = $(this).val();
                if (visibility == "true") {
                    reportBuilderContainer.eventBind.currentChart.options.legend.visible = true;
                }
                else {
                    reportBuilderContainer.eventBind.currentChart.options.legend.visible = false;
                }
                reportBuilderContainer.eventBind.currentChart.redraw();
            });

            //LegendPosition
            //Legendvisible
            $("#propertyBox #chartPropertyBox #legendPosBox input:radio").unbind("click").bind("click", function () {
                var position = $(this).val();
                reportBuilderContainer.eventBind.currentChart.options.legend.position = position;
                reportBuilderContainer.eventBind.currentChart.redraw();
            });
        },
        /*
        Function:bind Property Common Event
        */
        bindPropertyCommonEvent: function () {
            //chartArea
            $("#propertyBox #chartPropertyBox #c_colorpicker").kendoColorPicker({
                change: function (e) {
                    //alert("The picked color is " + e.value);
                    reportBuilderContainer.eventBind.currentChart.options.chartArea.background = e.value;
                    reportBuilderContainer.eventBind.currentChart.redraw();

                }
            });
            //PlotArea
            $("#propertyBox #chartPropertyBox #p_colorpicker").kendoColorPicker({
                change: function (e) {
                    //alert("The picked color is " + e.value);
                    reportBuilderContainer.eventBind.currentChart.options.plotArea.background = e.value;
                    reportBuilderContainer.eventBind.currentChart.redraw();

                }
            });
        },
        /*
        Function:bind Property RowBox Event
        */
        bindPropertyRowBoxEvent: function () {
            reportBuilderContainer.eventBind.bindMappingRowPropertySelectEvent();
        },
        /*
        Function:bind Property ColumnBox Event
        */
        bindPropertyColumnBoxEvent: function () {
            reportBuilderContainer.eventBind.bindMappingColumnPropertySelectEvent();
        },
        /*
        Function:update Mapping Row Property
        */
        updateMappingRowProperty: function (row) {
            var template = "<option>" + row + "</option>";
            $("#propertyBox #chartPropertyBox #rowPropSel").append(template);
        },
        /*
        Function:update Mapping Data Property
        */
        updateMappingDataProperty: function (data) {
            var template = "<option>" + data + "</option>";
            $("#propertyBox #chartPropertyBox #dataPropSel").append(template);
        },
        /*
        Function:update Mapping Column Property
        */
        updateMappingColumnProperty: function (column) {
            var template = "<option>" + column + "</option>";
            $("#propertyBox #chartPropertyBox #columnPropSel").append(template);
        },
        /*
        Function:bind Mapping Data Property Select Event
        */
        bindMappingDataPropertySelectEvent: function () {
            $("#propertyBox #dataPropSel").unbind("change").bind("change", function () {
                var currentIndex = $("#propertyBox #dataPropSel").get(0).selectedIndex;
                if (currentIndex != 0) {
                    $("#dataPropBox").removeClass("hide");
                    reportBuilderContainer.eventBind.initializeChartDataPropertyData(currentIndex);
                }
                else {
                    $("#dataPropBox").addClass("hide");
                }
            });
        },
        /*
        Function:bind Mapping Row Property Select Event
        */
        bindMappingRowPropertySelectEvent: function () {
            $("#propertyBox #rowPropSel").unbind("change").bind("change", function () {
                var currentIndex = $("#propertyBox #rowPropSel").get(0).selectedIndex;
                if (currentIndex != 0) {
                    $("#rowPropBox").removeClass("hide");
                    reportBuilderContainer.eventBind.initializeChartRowPropertyData(currentIndex);
                }
                else {
                    $("#rowPropBox").addClass("hide");
                }
            });
        },
        /*
        Function:bind Mapping Column Property Select Event
        */
        bindMappingColumnPropertySelectEvent: function () {
            $("#propertyBox #columnPropSel").unbind("change").bind("change", function () {
                var currentIndex = $("#propertyBox #columnPropSel").get(0).selectedIndex;
                if (currentIndex != 0) {
                    $("#columnPropBox").removeClass("hide");
                    reportBuilderContainer.eventBind.initializeChartColumnPropertyData(currentIndex);
                }
                else {
                    $("#columnPropBox").addClass("hide");
                }
            });
        },
        /*
        Function:bind Print Event
        */
        bindPrintEvent: function () {
            $("#topToolBar .fa-print").unbind("click").bind("click", function () {
                //window.print();
                $("#viewContainer").printArea();
            });
        }
    };
}));