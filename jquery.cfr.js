/*
 * Read file chunk by chunk with HTML5 FileReader API
 */
(function ($) {
    "use strict";
    var plugin_name = 'cfr';
    var window = this;

    var isApiSupported = !!(window.File && window.FileReader && window.FileReader.prototype.readAsDataURL && window.Blob);
    var sliceName = 'slice';
    if (isApiSupported) {
        if (window.Blob.prototype.webkitSlice) {
            sliceName = 'webkitSlice';
        }
        else if (window.Blob.prototype.mozSlice) {
            sliceName = 'mozSlice';
        }
    }
    var filter = function (c) {
        return c.substr(c.indexOf(',') + 1);
    };

    var methods = {
        init: function (options) {
            var $this = this;
            var opts = $.extend({
                chunkSize: 2048 * 1024,
                filter: filter,
                readFunc: 'readAsDataURL'
            }, options);
            var lastFileName = null;
            var cancelled = false;
            var data = $this.data(plugin_name);

            if (! data) {
                $this.data(plugin_name, {
                    opts: opts,
                    lastFileName: lastFileName,
                    cancelled: cancelled,
                    changeListener: null
                });
                data = $this.data(plugin_name);
            } else {
                if (data.changeListener) {
                    $this.unbind('change', data.changeListener);
                }
                data.opts = opts;
                data.lastFileName = lastFileName;
                data.cancelled = cancelled;
                data.changeListener = null;
            }

            if (isApiSupported && $this.prop('tagName') === 'INPUT' && $this.attr('type') === 'file') {
                $this.change(data.changeListener = function (ev) {
                    var file = ev.currentTarget && ev.currentTarget.files[0];
                    if (!file) { return false; }

                    var fileName = file.name || file.fileName || null;
                    if (data.lastFileName === fileName) { return false; }
                    data.lastFileName = fileName;

                    var fileSize = file.size || file.fileSize || null;
                    if (!fileSize) { return false; }

                    var chunk = 1;
                    var chunkCount = Math.ceil(fileSize / data.opts.chunkSize);

                    var read = function (chunkNum) {
                        var offset = data.opts.chunkSize * (chunkNum - 1);
                        if (offset >= fileSize) {
                            if (data.opts.onFinish && 'function' === typeof data.opts.onFinish) {
                                data.opts.onFinish.call($this[0], file);
                            }
                            if (data.opts.onEnd && 'function' === typeof data.opts.onEnd) {
                                data.opts.onEnd.call($this[0], file);
                            }
                            data.lastFileName = null;
                        } else {
                            var blob = file[sliceName](offset, offset + data.opts.chunkSize);
                            var reader = new window.FileReader();
                            reader.onloadend = function (ev) {
                                if (ev.target.readyState === window.FileReader.DONE) {
                                    var chunk = ev.target.result;
                                    chunk = (data.opts.filter && 'function' === typeof data.opts.filter) ? data.opts.filter(chunk) : chunk;
                                    var chunkSize = blob.size || blob.fileSize;
                                    if (! data.cancelled) {
                                        data.opts.onChunk.call($this[0], chunk, chunkSize, chunkNum, chunkCount, file, function (cancel) {
                                            if (! cancel) {
                                                read(++chunkNum);
                                            } else {
                                                if (data.opts.onCancel && 'function' === typeof data.opts.onCancel) {
                                                    data.opts.onCancel.call($this[0], file);
                                                }
                                                data.lastFileName = null;
                                            }
                                        });
                                    } else {
                                        if (data.opts.onCancel && 'function' === typeof data.opts.onCancel) {
                                            data.cancelled = false;
                                            data.opts.onCancel.call($this[0], file);
                                        }
                                        if (data.opts.onEnd && 'function' === typeof data.opts.onEnd) {
                                            data.opts.onEnd.call($this[0], file);
                                        }
                                        data.lastFileName = null;
                                    }
                                }
                            };
                            reader[data.opts.readFunc](blob);
                        }
                    };
                    data.cancelled = false;
                    if (data.opts.onStart && 'function' === typeof data.opts.onStart) {
                        data.opts.onStart.call($this[0], file);
                    }
                    read(chunk);
                });
            }

            return $this;
        },
        cancel: function () {
            var $this = this;
            var data = $this.data(plugin_name);
            if (data && data.cancelled === false) {
                data.cancelled = true;
            }
            return $this;
        },
        remove: function () {
            var $this = this;
            var data = $this.data(plugin_name);
            if (data) {
                $this.unbind('change', data.changeListener);
                $this.removeData(plugin_name);
            }
            return $this;
        }
    };

    $.fn[plugin_name] = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ('object' === typeof method || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.' + plugin_name);
        }
    };
}).call(window, window.jQuery);

