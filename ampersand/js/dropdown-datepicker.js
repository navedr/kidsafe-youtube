(function ($) {

    $.fn.extend({
        dropdownDatePicker: function (options) {
            options = $.extend({}, $.DropDownDatePicker.defaults, options);

            this.each(function () {
                new $.DropDownDatePicker(this, options);
            });
            return this;
        }
    });

    // ctl is the element, options is the set of defaults + user options
    $.DropDownDatePicker = function(ctl, options) {
        var $el = $(ctl),
            $month = $("<select />"),
            $day = $("<select />"),
            $year = $("<select />");
        var selectSpecified = false;
        if (options.monthSelect != null || options.daySelect != null || options.yearSelect != null) {
            selectSpecified = true;
            $month = options.monthSelect;
            $day = options.daySelect;
            $year = options.yearSelect;
        }
        if (options.selectContainer) {
            selectSpecified = true;
            var $parent = $el.parents(options.selectContainer);
            $month = $parent.find(".month-select");
            $day = $parent.find(".day-select");
            $year = $parent.find(".year-select");
        }
        $el.hide();
        var selects = [$year, $day, $month];
        $.each(selects, function(i, $select) {
            $select.append("<option></option>");
            if (options.cssClass) {
                $select.addClass(options.cssClass);
            }
            $select.change($.proxy(updateDateField, this));
            if (!selectSpecified) {
                $el.after($select);
            }
        });
        var startYear = new Date().getFullYear() - 100;
        if (options.startYear) {
            startYear = options.startYear;
        }
        var endDate = new Date();
        var endYear = endDate.getFullYear();
        if (options.endYear) {
            endYear = options.endYear;
        }
        for (i = endYear; i >= startYear; i--) {
            $year.append("<option>" + i + "</option>");
        }
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $.each(months, function(i, month) {
            $month.append("<option value=" + (i + 1) + ">" + month + "</option>");
        });
        for (i = 1; i <= 31; i++) {
            $day.append("<option>" + i + "</option>");
        }

        function updateDays(e) {
            var monthVal = $month.val();
            var month = 3;
            var year = new Date().getFullYear();
            if (monthVal) {
                month = parseInt(monthVal);
            }
            var yearVal = $year.val();
            if (yearVal) {
                year = parseInt(yearVal);
            }
            var days = new Date(year, month, 0).getDate();
            var dayVal = $day.val();
            $day.empty().append("<option></option>");
            for (i = 1; i <= days; i++) {
                $day.append("<option>" + i + "</option>");
            }
            $day.val(dayVal);
        }

        function updateDateField(e) {
            var month = $month.val(),
                day = $day.val(),
                year = $year.val();
            if (month && day && year) {
                var date = new Date(year, parseInt(month) - 1, day);
                $el.val($.datepicker.formatDate(options.selectedFormat, new Date(date)));
            } else {
                $el.val('');
            }
        }

        $month.change($.proxy(updateDays, this));
        $year.change($.proxy(updateDays, this));
    };

    // option defaults
    $.DropDownDatePicker.defaults = {
        cssClass: null,
        minDate: null,
        maxDate: null,
        startYear: null,
        endYear: null,
        selectedFormat: 'mm/dd/yy',
        daySelect: null,
        monthSelect: null,
        yearSelect: null,
        selectContainer: null
    };

})(jQuery);