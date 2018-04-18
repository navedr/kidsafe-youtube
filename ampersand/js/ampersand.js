//Ajax helpers
var Ajax = {

    // Creates global ajax listener and displays page level loading icon
    bindListener: function (container, icon) {
        var overlay = $("<div class='page-overlay'/>");
        var iconHeightOffset = -(icon.outerHeight()) + "px";
        var iconWidthOffset = -(icon.outerWidth()) + "px";
        icon.css({
            marginTop: iconHeightOffset,
            marginLeft: iconWidthOffset
        });

        container.ajaxStart(function () {
            overlay.appendTo(container);
            overlay.on("click", function () {
                return false;
            });
            icon.show();

        });
        container.ajaxStop(function () {
            overlay.off('click');
            overlay.remove();
            icon.fadeOut();
        });
        container.ajaxError(function (event, xhr, ajaxOptions, thrownError) {
            console.log("XHR Response: " + JSON.stringify(xhr));
        });
    },

    // Ajax call wrapper (jQuery)
    callHandler: function (type, url, data, callback, isGlobal, async) {
        $.ajax({
            type: type,
            url: url,
            cache: false,
            global: isGlobal,
            data: data,
            success: callback,
            error: Ajax.errorHandler,
            async: (async != null) ? async : true
        });
    },

    // Ajax getJson wrapper (jQuery)
    getJson: function (url, data, callback, isGlobal, async) {
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            global: isGlobal,
            data: data,
            success: callback,
            error: Ajax.errorHandler,
            async: async
        });
    },

    // Ajax call wrapper with JSON response(jQuery)
    postForJSON: function (url, data, callback, isGlobal, async) {
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: url,
            cache: false,
            global: isGlobal,
            data: data,
            success: callback,
            error: Ajax.errorHandler,
            async: async
        });
    },

    postFormAsJson: function (formId, callback, beforeSubmit) {
        var $form = $("#" + formId);
        var url = $form.attr("action");
        var data = { "data": JSON.stringify(form2js(formId, '.', false, null, true)) };
        if (beforeSubmit) {
            var response = beforeSubmit($form);
            if (response == false)
                return;
        }
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: url,
            cache: false,
            global: false,
            data: data,
            success: callback,
            error: Ajax.errorHandler,
            async: true
        });
    },

    // Ajax error callback
    errorHandler: function (data, textStatus, jqXHR) {
        if (data.status != 0) {
            alert('There was error processing the request!!');
            console.log(data);
        }
    },

    ajaxForm: function (id, success, beforeSubmit) {
        $(id).ajaxForm({
            success: success,
            beforeSubmit: beforeSubmit,
            error: Ajax.errorHandler
        });
    }
};

Templates = {
		get: function (template) {
			if ($("input[template='" + template + "']").size() > 0) {
				return $("input[template='" + template + "']").val();
			}
			Ajax.callHandler("GET", "templates/" + template, null, function (data, textStatus, jqXHR) {
				templateHtml = data;
				$("body").append("<input type='hidden' template='" + template + "' />");
				$("input[template='" + template + "']").val(templateHtml);
			}, true, false);
			return templateHtml;
		}
};

Dialog = {
    dialogId: "generic-dialog",
    dialogHtml: null,
    create: function (dialogId, dialogHtml, cssClass, width, hasTitleBar, zIndex, hasCloseButton, autoOpen, destroyOnClose, dialogTitle) {
        var self = this;
        this.dialogHtml = dialogHtml;
        this.$dialog = $("#" + dialogId);
        if (this.$dialog.size() > 0) {
            this.$dialog.remove();
        }
        this.$dialog = $("<div id='" + dialogId + "'></div>");
        if (hasCloseButton) {
            dialogHtml += "<p><center><button class='btn btn-danger dialog-close-btn'>Close</button></center></p>";
        }
        this.$dialog.html(dialogHtml);
        $("body").append(this.$dialog);
        this.$dialog.dialog({
            autoOpen: autoOpen,
            show: "fade",
            hide: "fade",
            zIndex: (zIndex) ? zIndex : 10001,
            width: width,
            minHeight: 'auto',
            modal: true,
            resizable: false,
            closeOnEscape: false,
            dialogClass: (cssClass) ? cssClass : "",
            title: (dialogTitle) ? dialogTitle : ""
        });
        $(document).on("click", "#" + dialogId + " .dialog-close-btn", function (e) {
            $("#" + dialogId).dialog('close');
            e.preventDefault();
        });
        if (destroyOnClose) {
            this.$dialog.on("dialogclose", function (event, ui) {
                self.$dialog.remove();
            });
        }
        if (!hasTitleBar) {
            this.$dialog.parents(".ui-dialog").find(".ui-dialog-titlebar").remove();
        }
    },
    show: function (dialogHtml, cssClass, width, hasTitleBar, zIndex, hasCloseButton, dialogTitle) {
        this.create(this.dialogId, dialogHtml, cssClass, width, hasTitleBar, zIndex, hasCloseButton, true, true, dialogTitle);
    },
    showAlert: function (alertHtml, customStyle, onClose) {
        alertHtml = (customStyle) ? alertHtml : "<h4 class='text-center mtop'>" + alertHtml + "</h4>";
        this.show(alertHtml, null, 400, false, null, true);
        if (onClose) {
            Dialog.$dialog.find(".dialog-close-btn").click(onClose);
        }
    },
    close: function () {
        this.$dialog.dialog('close');
    },
    confirm: function (message, buttons, customStyle) {
        var panelId = "dialog-confirm-btn-panel";
        var html = (customStyle) ? message : "<h4 class='text-center mtop'>" + message + "</h4>";
        var btnPanel = "<div class='text-center' id='" + panelId + "'>";
        var index = 1;
        $.each(buttons, function (button, options) {
            var $button = $("<button></button>");
            $button.addClass(options.cssClass + ' mright').html((options.btnHtml) ? options.btnHtml : button).attr("data-confirm-btn", index);
            $("#" + panelId + " button[data-confirm-btn='" + index + "']").off("click");
            if (options.onclick) {
                $(document).off("click", "#" + panelId + " button[data-confirm-btn='" + index + "']");
                $(document).on("click", "#" + panelId + " button[data-confirm-btn='" + index + "']", $.proxy(options.onclick, this));
            }
            else if (options.closeBtn) {
                $button.addClass("dialog-close-btn");
            }
            btnPanel += $('<div>').append($button.clone()).html();
            index++;
        });
        html += btnPanel + "</div>";
        this.show(html, null, 400, false, null, false, null);
    },
    confirmYesNo: function (message, yesClick, noClick) {
        var buttons = {
            'Yes': {
                cssClass: 'btn btn-success',
                onclick: yesClick
            },
            'No': {
                cssClass: 'btn btn-danger',
                onclick: (noClick) ? noClick : null,
                closeBtn: (noClick) ? false : true
            }
        };
        Dialog.confirm(message, buttons);
    },
    prompt: function (message, acceptBtnHtml, acceptClick) {
        var html = "<h4>" + message + "</h4><div><input type='text' id='dialog-prompt-input' /></div><div class='text-center mtop'><button type='text' id='dialog-prompt-accept' class='btn btn-success mright'>"
            + acceptBtnHtml + "</button>" + "<button class='dialog-close-btn btn btn-danger mright'>Cancel</button></div>";
        this.show(html, null, 350, false, null, false, null);
    }
};

Popover = {
		create: function (linkId, title, content, container, placement) {
			title = title + "<button class='close' onclick=\"$('#" + linkId + "').popover('hide');\">&times;</button>";
			$('#' + linkId).popover({
				placement: (placement) ? placement : 'top',
						html: true,
						content: content,
						container: (container) ? container : false,
								title: title
			});
		},
		bindEvents: function () {
		    $(document).on("click", ".popover .close-popover", function(e) {
		        var $btn = $(e.target);
		        $btn.parents(".popover").hide();
		        return false;
		    });
		    $(document).on("click", ".popover-trigger", function(e) {
		        var $el = $(e.target);
		        if (!$el.hasClass("popover-trigger")) {
		            $el = $el.parents(".popover-trigger");
		        }
		        if ($el.data("popoverId") != null) {
		            $("#" + $el.data("popoverId")).toggle();
		            return false;
		        }
		    });
		},
		init: function(){
			this.bindEvents();
		}
};

TopBar = {
		init: function () {
			this.bindEvents();
		},
		bindEvents: function () {
		    $(document).on("click", ".top-bar .top-bar-toggle", $.proxy(this.toggleTopBar, this));
		},
		toggleTopBar: function (e) {
			var $el = $(e.target);
			if (!$el.hasClass("top-bar-toggle")) {
				$el = $el.parents(".top-bar-toggle");
			}
			var $content = $el.parents(".top-bar").find(".top-bar-content");
			$content.slideToggle({
				duration: 300,
				easing: 'easeInOutBack',
				complete: function () {
					var visible = $content.is(":visible");
					if (visible) {
						if ($el.data("visible")) {
							$el.html($el.data("visible"));
						}
					}
					else {
						if ($el.data("hidden")) {
							$el.html($el.data("hidden"));
						}
					}
				}
			});
			return false;
		}
};

Validation = {
    init: function() {
        if (jQuery.isFunction(jQuery.fn.live)) {
            //$(".validate").live("blur", function (event) {
            //    Validation.validateInput($(event.target));
            //});
            $(".validate").live("change", function(event) {
                Validation.validateInput($(event.target));
            });
        } else if (jQuery.isFunction(jQuery.fn.on)) {
            //$(".validate").on("blur", function (event) {
            //    Validation.validateInput($(event.target));
            //});
            $(document).on("change", ".validate", function(event) {
                Validation.validateInput($(event.target));
            });
        }
    },
    validateInput: function(control) {
        var val = control.val();
        var isvalid = true;
        var errormsg = "";
        if (control.data("validationTrim") != null) {
            var trim = control.data("validationTrim");
            for (var i = 0, len = trim.length; i < len; i++) {
                val = val.split(trim[i]).join("");
            }
        }
        //Optional: data-required-message
        if (control.hasClass("validate-required") && isvalid) {
            isvalid = (val != "");
            if (control.data("requiredMessage") != null)
                errormsg = control.data("requiredMessage");
            else
                errormsg = "This field is required";
        }
        //Optional: data-number-message
        if (control.hasClass("validate-number") && isvalid) {
            isvalid = !isNaN(val);
            if (control.data("numberMessage") != null)
                errormsg = control.data("numberMessage");
            else
                errormsg = "Please enter a valid number";
        }
        //Optional: data-money-message
        if (control.hasClass("validate-money") && isvalid) {
            isvalid = !isNaN(val);
            if (isvalid) isvalid = (val >= 0);
            if (control.data("moneyMessage") != null)
                errormsg = control.data("moneyMessage");
            else
                errormsg = "Please enter a valid amount";
        }
        //Optional: data-positive-number-message
        if (control.hasClass("validate-positive-number") && isvalid) {
            isvalid = !isNaN(val);
            if (isvalid) isvalid = (val >= 0);
            if (control.data("positiveNumberMessage") != null)
                errormsg = control.data("positiveNumberMessage");
            else
                errormsg = "Please enter a valid positive number";
        }
        //Optional: data-email-message
        if (control.hasClass("validate-email") && isvalid) {
            var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
            isvalid = (val.search(emailRegEx) != -1);
            if (control.data("emailMessage") != null)
                errormsg = control.data("emailMessage");
            else
                errormsg = "Please enter Email in correct format";
        }
        //Optional: data-digits-message
        if (control.hasClass("validate-digits") && isvalid) {
            isvalid = val.match(/[0-9]*/)[0].length == val.length
            if (control.data("digitsMessage") != null)
                errormsg = control.data("digitsMessage");
            else
                errormsg = "Only digits allowed";
        }
        //Required: data-compare-id attribute to the field and specify the ID of the input to compare with
        //Optional: data-compare-message
        if (control.hasClass("validate-compare") && isvalid) {
            if (control.data("compareId") != null) {
                var compareTo = $("#" + control.data("compareId")).val();
                isvalid = (compareTo == val);
                if (control.data("compareMessage") != null)
                    errormsg = control.data("compareMessage");
                else
                    errormsg = "Values do not match";
            }
        }
        //Required: data-min-length to the field and specify the minimum length required
        //Optional: data-minlength-message
        if (control.hasClass("validate-minlength") && isvalid) {
            if (control.data("minLength") != null) {
                var minlength = parseInt(control.data("minLength"));
                isvalid = (val.length >= minlength);
                if (control.data("minlengthMessage") != null)
                    errormsg = control.data("minlengthMessage");
                else
                    errormsg = "Minimum " + minlength + " characters required.";
            }
        }
        //Required: data-max-length to the field and specify the maximum length allowed
        //Optional: data-maxlength-message
        if (control.hasClass("validate-maxlength") && isvalid) {
            if (control.data("maxLength") != null) {
                var maxlength = parseInt(control.data("maxLength"));
                isvalid = (val.length <= maxlength);
                if (control.data("maxlengthMessage") != null)
                    errormsg = control.data("maxlengthMessage");
                else
                    errormsg = "Maximum " + maxlength + " characters allowed.";
            }
        }
        //Optional: data-date-message
        if (control.hasClass("validate-date") && isvalid) {
            isvalid = this.validateDate(val);
            if (control.data("dateMessage") != null)
                errormsg = control.data("dateMessage");
            else
                errormsg = "Not a valid date";
        }
        //Required: data-max-value to the field and specify the maximum value allowed
        //Optional: data-maxvalue-message
        if (control.hasClass("validate-maxvalue") && isvalid) {
            if (control.data("maxValue") != null) {
                var maxvalue = parseFloat(control.data("maxValue"));
                if (val.length > 0 && !isNaN(val))
                    isvalid = (parseFloat(val) <= maxvalue);
                if (control.data("maxvalueMessage") != null)
                    errormsg = control.data("maxvalueMessage");
                else
                    errormsg = "Value cannot be more than " + maxvalue + ".";
            }
        }

        if (control.next().hasClass("error-message"))
            control.next().remove();
        //Checking if control is valid and performing necessary action
        if (isvalid) {
            control.removeClass("error-background");
            return true;
        } else {
            if (errormsg != "") {
                control.after("<div class='error-message'>" + errormsg + "</div>");
            }
            control.addClass("error-background");
            return false;
        }
    },
    validateForm: function(formid) {
        var validation_fields = $("#" + formid + " .validate");
        var isFormValid = true;
        $.each(validation_fields, function() {
            var control = $(this);
            if (control.is(":visible")) {
                var isControlValid = Validation.validateInput(control);
                isFormValid = isFormValid & isControlValid;
            }
        });
        return isFormValid;
    },
    validateDate: function(value) {
        var validformat = /^\d{2}\/\d{2}\/\d{4}$/ //Basic check for format validity
        if (!validformat.test(value))
            return false;
        else { //Detailed check for valid date ranges
            var monthfield = value.split("/")[0]
            var dayfield = value.split("/")[1]
            var yearfield = value.split("/")[2]
            var dayobj = new Date(yearfield, monthfield - 1, dayfield)
            if ((dayobj.getMonth() + 1 != monthfield) || (dayobj.getDate() != dayfield) || (dayobj.getFullYear() != yearfield))
                return false;
            else
                return true;
        }
    }
};

Utilities = {
    init: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        $(document).on("keyup", ".advance-focus", $.proxy(this.advanceFocus, this));
        $(document).on("focus", ".formatted-field", $.proxy(this.removeFormattingEvent, this)).on("blur", ".formatted-field", $.proxy(this.formatValue, this));
    },
    advanceFocus: function(e) {
        var $el = $(e.target);
        var length = $el.val().length;
        if ($el.data("advfControl")) {
            var max = -1;
            if ($el.data("advfLength")) {
                max = parseInt($el.data("advfLength"));
            } else if ($el.attr("maxlength")) {
                max = parseInt($el.attr("maxlength"));
            }
            if (length == max) {
                $($el.data("advfControl")).focus();
            }
        }
    },
    removeFormattingEvent: function(e) {
        var $el = $(e.target);
        $el.val(this.removeFormatting($el));
    },
    removeFormatting: function($el) {
        var val = $el.val();
        if ($el.data("validationTrim") != null) {
            var trim = $el.data("validationTrim");
            for (var i = 0, len = trim.length; i < len; i++) {
                val = val.split(trim[i]).join("");
            }
        }
        return val;
    },
    formatValue: function(e) {
        var $el = $(e.target);
        if ($el.val().length > 0) {
            if ($el.data("display") == "$") {
                $el.val("$" + this.formatDollar(parseFloat($el.val())));
            }
            if ($el.data("display") == "%") {
                $el.val($el.val() + "%");
            }
        }
    },
    formatDollar: function (num, decimal_places) {
        var p = num.toFixed(2).split(".");
        var result = p[0].split("").reverse().reduce(function (acc, num, i, orig) {
            return num + (i && !(i % 3) ? "," : "") + acc;
        }, "");
        if (decimal_places) {
            result += "." + p[1]
        }
        return result;
    }
};

(function($) {

	var o = $({});

	$.subscribe = function() {
		o.on.apply(o, arguments);
	};

	$.unsubscribe = function() {
		o.off.apply(o, arguments);
	};

	$.publish = function() {
		o.trigger.apply(o, arguments);
	};

}(jQuery));

Loader = {
    loading_open: false,
    showLoadingBox: function (message) {
        if (message == null)
            message = 'Loading';
        this.loading_open = true;
        $.blockUI({
            message: '<div class="loading-box">' + message + '&nbsp;&nbsp;<img style="vertical-align:middle" src="' + ampersandPath + 'images/facebook-loader.gif" /></div>',
            css: {
                left: '45%',
                backgroundColor: 'Transparent',
                border: "0"
            }
        });
    },

    hideLoadingBox: function () {
        $.unblockUI();
    },

    blockSectionForProcessing: function (id, msghtml) {
        this.showLoader($(id), msghtml);
    },

    unblockSection: function (id) {
        this.hideLoader($(id));
    },

    showProgressBar: function (id, message) {
        this.blockSectionForProcessing(id, '<div class="loading-box">' + message + '&nbsp;&nbsp;<img style="vertical-align:middle" src="' + ampersandPath + 'images/facebook-loader.gif" /></div>');
    },

    hideProgressBar: function (id) {
        this.unblockSection(id);
    },

    showProgressLoader: function ($el, msg) {
        this.showLoader($el, '<div class="loading-box">' + msg + '&nbsp;&nbsp;<img style="vertical-align:middle" src="' + ampersandPath + 'images/facebook-loader.gif" /></div>');
    },

    showLoader: function ($el, msg) {
        $el.block({
            message: msg,
            css: {
                fadeIn: 0,
                left: '45%',
                backgroundColor: 'Transparent',
                border: "0"
            },
            centerY: false
        });
    },

    hideLoader: function ($el) {
        $el.unblock();
    }
};

$(document).ready(function () {
	TopBar.init();
	Popover.init();
	Validation.init();
	Utilities.init();
});
