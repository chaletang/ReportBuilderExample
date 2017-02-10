function exportDataToExcel(columns, exportData, excelTitle) {
    // Define the data to be sent to the server to create the spreadsheet.
    var exportToExcelContext = {
        model: JSON.stringify(columns),
        data: JSON.stringify(exportData),
        title: excelTitle
    };

    // Create the spreadsheet.
    $.ajax({
        type: "POST",
        url: getBaseUrl() + "Evaluation/ExportToExcel",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(exportToExcelContext)
    })
    .done(function (e) {
        // Download the spreadsheet.
        window.location = kendo.format("{0}?title={1}",
            getBaseUrl() + "Evaluation/GetExcelFile",
            excelTitle);
    });
}
function gridReorder(mainGrid, gridId, mainDataSource, dropEventCallback) {
    $.fn.reverse = [].reverse;//save a new function from Array.reverse
    var selectedClass = 'k-state-selected';
    $(document).on('click', '#' + gridId + ' tbody tr', function (e) {
        if (e.ctrlKey || e.metaKey) {
            $(this).toggleClass(selectedClass);
        } else {
            $(this).addClass(selectedClass).siblings().removeClass(selectedClass);
        }
    });

    mainGrid.table.kendoDraggable({
        filter: "tbody tr",
        group: "gridGroup",
        axis: "y",
        hint: function (item) {
            var helper = $('<div class="k-grid k-widget drag-helper"/>');
            if (!item.hasClass(selectedClass)) {
                item.addClass(selectedClass).siblings().removeClass(selectedClass);
            }
            var elements = item.parent().children('.' + selectedClass).clone();
            item.data('multidrag', elements).siblings('.' + selectedClass).remove();
            return helper.append(elements);
        }
    });

    mainGrid.table.kendoDropTarget({
        group: "gridGroup",
        drop: function (e) {

            var draggedRows = e.draggable.hint.find("tr");
            e.draggable.hint.hide();
            var dropLocation = $(document.elementFromPoint(e.clientX, e.clientY)),
                dropGridRecord = mainDataSource.getByUid(dropLocation.parent().attr("data-uid"))
            if (dropLocation.is("th")) {
                return;
            }

            var beginningRangePosition = mainDataSource.indexOf(dropGridRecord),//beginning of the range of dropped row(s)
                rangeLimit = mainDataSource.indexOf(mainDataSource.getByUid(draggedRows.first().attr("data-uid")));//start of the range of where the rows were dragged from


            //if dragging up, get the end of the range instead of the start
            if (rangeLimit > beginningRangePosition) {
                draggedRows.reverse();//reverse the records so that as they are being placed, they come out in the correct order
            }

            //assign new spot in the main grid to each dragged row
            draggedRows.each(function () {
                var thisUid = $(this).attr("data-uid"),
                    itemToMove = mainDataSource.getByUid(thisUid);
                mainDataSource.remove(itemToMove);
                mainDataSource.insert(beginningRangePosition, itemToMove);
            });


            //set the main grid moved rows to be dirty
            draggedRows.each(function () {
                var thisUid = $(this).attr("data-uid");
                mainDataSource.getByUid(thisUid).set("dirty", true);
            });

            //remark things as visibly dirty
            var dirtyItems = $.grep(mainDataSource.view(), function (e) { return e.dirty === true; });
            for (var a = 0; a < dirtyItems.length; a++) {
                var thisItem = dirtyItems[a];
                mainGrid.tbody.find("tr[data-uid='" + thisItem.get("uid") + "']").find("td:eq(0)").addClass("k-dirty-cell");
                mainGrid.tbody.find("tr[data-uid='" + thisItem.get("uid") + "']").find("td:eq(0)").prepend('<span class="k-dirty"></span>')
            };

            dropEventCallback();
        }
    });

}

//bind grid checkbox select all event.
//Make sure header template has the checkbox with selectAll class.
function bindGridSelectAllCheckboxEvent(gridID) {
    //Select all checkbox click bind.
    $('.selectAll').live('click', function (e) {
        var grid = gridID.data("kendoGrid");
        isSelectAllChkboxClicked = true;
        var checkbox = $(this);
        if (checkbox.is(":checked")) {
            grid.table.find('tr>td input:checkbox').prop("checked", true);
            grid.table.find('tr').removeClass("k-state-selected").addClass("k-state-selected");
        } else {
            grid.table.find('tr>td input:checkbox').prop("checked", false);
            grid.table.find('tr').removeClass("k-state-selected");
        }
        grid.trigger('change');
    });
}

//Bind the each checkbox click event.
//girdID : gird div ID
//eventSelf : kendo grid td click event current context (this)
//eventArg : kendo grid td click event argument
function bindGridEachCheckboxClickEvent(gridID, eventSelf, eventArg) {
    var self = eventSelf;
    var e = eventArg;
    var grid = gridID.data("kendoGrid");
    var currentIndex = $(self).index();
    var checkboxIndex = 0;
    if (currentIndex == checkboxIndex) {
        if (!$(e.target).is("input")) {
            var selectedTd = $(e.target).closest("td");
            var grdChkBox = selectedTd.find('input:checkbox');
            grdChkBox.prop('checked', !grdChkBox.prop('checked'));
            if (!grdChkBox.prop('checked')) {
                selectedTd.closest("tr").removeClass("k-state-selected");
                $("#btnEvaluationReport").hide();
            }
        }
        else {
            if (!$(e.target).is('input:checked')) {
                $(e.target).closest("tr").removeClass("k-state-selected");
            }
        }
        grid.select(grid.tbody.find("tr").filter(":has(:checkbox:checked)"));
    }
    else {
        grid.tbody.find('tr input:checkbox:checked').each(function (index, item) {
            if (!eventArg.ctrlKey) {
                item.checked = false;
                $('.selectAll')[0].checked = false;
            }
            else {
                item.checked = false;
            }
        });
        var rows = grid.tbody.find("tr.k-state-selected");
        if (rows.length > 0) {
            rows.each(function (index, row) {
                $(row.firstElementChild).find(":checkbox").attr("checked", true);
            });
        }

    }
    //checking all checkboxes are checked are not
    var slectedCheckboxLength = grid.table.find('tr>td input:checked').length;
    var currentPageSize = 0; // grid.dataSource._pageSize;
    if (grid.dataSource._total < grid.dataSource._pageSize) {
        currentPageSize = grid.dataSource._total;
    }
    else {
        currentPageSize = grid.dataSource._pageSize;
    }

    if (parseInt(currentPageSize, 10) == parseInt(slectedCheckboxLength, 10) && parseInt(slectedCheckboxLength, 10) !== 0) {
        $('.selectAll').prop("checked", true);
    }
    else {
        $('.selectAll').prop("checked", false);
    }
}



//function bindGridEachCheckboxClickEvent(gridID, eventSelf, eventArg) {
//    var self = eventSelf;
//    var e = eventArg;
//    var grid = gridID.data("kendoGrid");
//    var currentIndex = $(self).index();
//    var checkboxIndex = 0;
//    if (currentIndex == checkboxIndex) {
//        if (!$(e.target).is("input")) {
//            var selectedTd = $(e.target).closest("td");
//            var grdChkBox = selectedTd.find('input:checkbox');
//            grdChkBox.prop('checked', !grdChkBox.prop('checked'));
//            if (!grdChkBox.prop('checked')) {
//                selectedTd.closest("tr").removeClass("k-state-selected");
//            }
//        }
//        else {
//            if (!$(e.target).is('input:checked')) {
//                $(e.target).closest("tr").removeClass("k-state-selected");
//            }
//        }
//        grid.select(grid.tbody.find("tr").filter(":has(:checkbox:checked)"));
//    }
//    else {
//        grid.tbody.find('tr input:checkbox:checked').each(function (index, item) {
//            if (!eventArg.ctrlKey) {
//                item.checked = false;
//                $('.selectAll')[0].checked = false;
//            }
//        });
//    }

//    //checking all checkboxes are checked are not
//    var slectedCheckboxLength = grid.table.find('tr>td input:checked').length;
//    var currentPageSize = 0; // grid.dataSource._pageSize;
//    if (grid.dataSource._total < grid.dataSource._pageSize) {
//        currentPageSize = grid.dataSource._total;
//    }
//    else {
//        currentPageSize = grid.dataSource._pageSize;
//    }
//    if (parseInt(currentPageSize, 10) == parseInt(slectedCheckboxLength, 10)) {
//        $('.selectAll').prop("checked", true);
//    }
//    else {
//        $('.selectAll').prop("checked", false);
//    }
//}
(function ($) {
    var kendo = window.kendo;
    var ExcelGrid = kendo.ui.Grid.extend({
        init: function (element, options) {
            var that = this;
            if (options.excel) {
                options.excel = $.extend(
                    {
                        cssClass: "k-i-expand"      // If the exportCssClass is not defined, then set a default image.
                    },
                    options.excel);

                // Add the export toolbar button.
                options.toolbar = $.merge([
                    {
                        name: "export",
                        template: kendo.format("<a class='k-button k-button-icontext k-grid-export' title='Export to Excel'><div class='{0} '></div>Export</a>", options.excel.cssClass)
                    }
                ], options.toolbar || []);
            }

            // Initialize the grid.
            kendo.ui.Grid.fn.init.call(that, element, options);

            // Add an event handler for the Export button.
            $(element).on("click", ".k-grid-export", { sender: that }, function (e) {
                // e.data.sender.exportToExcel();
                var gridDetails = e.delegateTarget.id;
                $("#" + gridDetails).data("kendoExcelGrid").exportToExcel();
            });
        },

        options: {
            name: "ExcelGrid"
        },

        exportToExcel: function () {
            var that = this;

            // Create a datasource for the export data.
            var ds = new kendo.data.DataSource({
                data: that.dataSource.data()
            });
            ds.query({
                aggregate: that.dataSource._aggregate,
                filter: that.dataSource._filter,
                //group: that.dataSource._group,
                sort: that.dataSource._sort
            });

            // Define the data to be sent to the server to create the spreadsheet.
            data = {
                model: JSON.stringify(that.columns),
                data: JSON.stringify(ds._view),
                title: that.options.excel.title
            };

            // Create the spreadsheet.
            $.ajax({
                type: "POST",
                url: that.options.excel.createUrl,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data)
            })
            .done(function (e) {
                // Download the spreadsheet.
                window.location = kendo.format("{0}?title={1}",
                    that.options.excel.downloadUrl,
                    that.options.excel.title);
            });
        }
        /*  exportToExcel: function () {
              var that = this;
  
              // Create a datasource for the export data.
              var ds = new kendo.data.DataSource({
                  data: that.dataSource.data()
              });
              ds.query({
                  aggregate: that.dataSource._aggregate,
                  filter: that.dataSource._filter,
                  group: that.dataSource._group,
                  sort: that.dataSource._sort
              });
  
              // Define the data to be sent to the server to create the spreadsheet.
              data = {
                  model: JSON.stringify(that.columns),
                  data: JSON.stringify(ds._view),
                  title: that.options.excel.title
              };
  
              // Create the spreadsheet.
              $.ajax({
                  type: "POST",
                  url: that.options.excel.createUrl,
                  contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  data: JSON.stringify(data)
              })
              .done(function (e) {
                  // Download the spreadsheet.
                  window.location = kendo.format("{0}?title={1}",
                      that.options.excel.downloadUrl,
                      that.options.excel.title);
              });
          }*/
    });

    kendo.ui.plugin(ExcelGrid);
})(jQuery);