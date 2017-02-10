(function ($) {
    try {
        $.widget("ui.checkList", {
            options: {
                listItems: [],
                selectedItems: [],
                effect: 'blink',
                onChange: {},
                objTable: '',
                icount: 0,
                disableSelected: false
            },

            _create: function () {
                var self = this, o = self.options, el = self.element;

                // generate outer div
                var container = $('<div/>').addClass('checkList');

                // generate toolbar
                var toolbar = $('<div/>').addClass('toolbar');
                var chkAll = $('<input/>').attr('type', 'checkbox').addClass('chkAll').click(function () {
                    var state = $(this).attr('checked');
                    var setState = false;

                    setState = (state == undefined) ? false : true;

                    o.objTable.find('.chk:not(:disabled)').attr('checked', setState);

                    self._selChange();
                });
                var txtfilter = $('<input/>').attr('type', 'text').addClass('txtFilter').keyup(function () {
                    self._filter($(this).val());
                });
                var searchIcon = $('<div/>'); //.addClass('icon-search fg-color-pink');
                var tableLayout = $('<div style="width:30%"/>').addClass('table');
                var tableRow = $('<div/>').addClass('table-row');
                var tableCell1 = $('<div/>').addClass('table-cell');
                var tableCell2 = $('<div/>').addClass('table-cell');
                var tableCell3 = $('<div/>').addClass('table-cell');
                tableLayout.append(tableRow);
                tableRow.append(tableCell1);
                tableRow.append(tableCell2);
                tableRow.append(tableCell3);
                tableCell1.append(chkAll);
                tableCell2.append(txtfilter);
                tableCell3.append(searchIcon);
                //toolbar.append(chkAll);
                toolbar.append(tableLayout);
                //toolbar.append($('<div/>').addClass('filterbox').append(txtfilter).append(searchIcon));

                // generate list table object
                o.objTable = $('<div style="height:140px;overflow-y:scroll"><table/></div>').addClass('bordered');

                container.append(toolbar);
                container.append(o.objTable);
                el.append(container);

                self.loadList();
            },

            _addItem: function (listItem) {
                var self = this, o = self.options, el = self.element;
                var itemId = 'itm' + (o.icount++); // generate item id
                var itm = $('<tr/>');
                var chk = $('<input/>').attr('type', 'checkbox').attr('id', itemId)
                        .addClass('chk')
                        .attr('data-text', listItem.text)
                        .attr('data-value', listItem.value)
                        .attr('checked', listItem.IsChecked);
                //In Edit mode disable item which are already selected.
                if (o.disableSelected && listItem.IsChecked) {
                    chk.attr("disabled", "disabled");
                }
                if (listItem.IsChecked) {
                    o.selectedItems.push({
                        text: $(chk).attr('data-text'),
                        value: $(chk).attr('data-value'),
                        isChecked: true
                    });
                }
                itm.append($('<td/>').append(chk));
                var label = $('<label class="labelcontent"/>').attr('for', itemId).text(listItem.text);
                itm.append($('<td/>').append(label));
                o.objTable.append(itm);
                self._highlightchekcedItem();
                // bind selection-change
                //el.delegate('.chk', 'click', function () { self._selChange() });
                el.find('.chk').unbind('click').bind('click', function () { self._selChange() });
            },

            loadList: function () {
                var self = this, o = self.options, el = self.element;

                o.objTable.empty();
                $.each(o.listItems, function () {
                    //console.log(JSON.stringify(this));
                    self._addItem(this);
                });
            },

            _selChange: function () {
                var self = this, o = self.options, el = self.element;
                // empty selection
                o.selectedItems = [];

                // scan elements, find checked ones
                o.objTable.find('.chk').each(function () {
                    if ($(this).attr('checked')) {
                        o.selectedItems.push({
                            text: $(this).attr('data-text'),
                            value: $(this).attr('data-value'),
                            isChecked: true
                        });
                        $(this).parent().addClass('highlight').siblings().addClass('highlight');
                    } else {
                        $(this).parent().removeClass('highlight').siblings().removeClass('highlight');
                    }
                });

                // fire onChange event
                o.onChange.call();
            },
            _highlightchekcedItem: function () {
                var self = this, o = self.options, el = self.element;
                o.objTable.find('.chk').each(function () {
                    if ($(this).attr('checked')) {
                        $(this).parent().addClass('highlight').siblings().addClass('highlight');
                    } else {
                        $(this).parent().removeClass('highlight').siblings().removeClass('highlight');
                    }
                });
            },
            _filter: function (filter) {
                var self = this, o = self.options, el = self.element;

                o.objTable.find('.chk').each(function () {
                    if ($(this).attr('data-text').toLowerCase().indexOf(filter.toLowerCase()) > -1) {
                        $(this).parent().parent().show(o.effect);
                    }
                    else {
                        $(this).parent().parent().hide(o.effect);
                    }
                });
            },

            getSelection: function () {
                var self = this, o = self.options, el = self.element;
                return o.selectedItems;
            },

            setData: function (dataModel) {
                var self = this, o = self.options, el = self.element;
                o.listItems = dataModel;
                self.loadList();
                self._selChange();
            }
        });
    } catch (e) {
        //alert(e.message);
    }
})(jQuery); 