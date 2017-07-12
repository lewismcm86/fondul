/**
 * Ftichart component plugin
 * This is used to render custom highcharts based on their associated table
 */
// We need the ability to call resize highcharts on page tabs are selected


(function ($, window, document, undefined) {

    this.navDecimal = 2;
    // Create the defaults once
    var componentName = "fondulNavChart",
        defaults = {
            prefix: "",
            seriesName: "NAV",
            secondSeriesName: "Distribution Adjusted NAV"
        };
    // The actual plugin constructor
    function Component(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = componentName;
        this.chart = '';
        this.navData = [];
        this.distData = [];
        this.init();
    }

    // Create methods associated with the plugin
    Component.prototype = {
        reload: function () {
            console.log('reload');
            this.init();
        },
        init: function () {

            var _self = this;
            _self.chart = $(_self.element).find('.chart:visible').first();

            // Get Json url from chart attribute
            if (_self.chart.data('ftiJson')) {
                this.jsonURL = _self.chart.data('ftiJson');
            } else {
                return null;
            }

            // Load the jsonURL for the chart if not already loaded
            if (_self.navData.length === 0) {

                // Add Loader until we retrieve the JSON
                _self.addLoader();

                frk.load(this.jsonURL, 'json').then(
                    function (data) {

                        if (typeof data.productsVO.priceDetVO !== 'undefined') {

                            var navData = data.productsVO.priceDetVO[0].navData;
                            var distData = data.productsVO.priceDetVO[0].distData;
                            var navData = [];
                            var distData = [];

                            var minSeries = Number.POSITIVE_INFINITY;
                            var maxSeries = Number.NEGATIVE_INFINITY;
                            

                            _self.mindata = null;
                            _self.maxdata = null;

                            _self.navData = JSON.parse(JSON.stringify(navData));
                            _self.distData = JSON.parse(JSON.stringify(distData));

                            _self.buildChart();

                        } else {
                            _self.showErrorMessage();
                        }
                    },
                    function () {
                        _self.showErrorMessage();
                    }
                );
            }

        },
        showErrorMessage: function () {
            var _self = this;

            $(_self.element).find('#loader').remove();
            /* $('[data-fti-component="pricing-at-nav-chart"]').find('.pricing-chart-error').removeClass('hidden');
             $('[data-fti-component="pricing-at-nav-chart"]').find('.pricing-chart-tabs').hide();*/
        },
        buildChart: function () {

            var _self = this;

            // Remove the loader
            _self.removeLoader();

            _self.chart.highcharts({
                exporting: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    type: 'datetime',
                    minRange: 24 * 3600000,
                    minTickInterval: 24 * 3600000
                },
                yAxis: {
                    labels: {
                        format: _self.options.prefix + '{value}'
                    },
                    title: "",
                    min: _self.mindata,
                    max: _self.maxdata
                },
                plotOptions: {
                    series: {
                        fillOpacity: 0,
                        marker: {
                            enabled: false
                        }
                    }
                },
                title: {
                    text: ""
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    shared: true,
                    crosshairs: true
                },
                series: [{
                    name: _self.options.seriesName,
                    data: _self.navData,
                    type: "area",
                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
                        valueDecimals: navDecimal,
                        valuePrefix: _self.options.prefix
                    }
                },
                {
                    name: _self.options.secondSeriesName,
                    data: _self.distData,
                    type: "area",
                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
                        valueDecimals: navDecimal,
                        valuePrefix: _self.options.prefix
                    }
                }
                ]
            });
        },
        addLoader: function () {
            var _self = this;
            $(_self.element).find('#loader').remove();
            $(_self.element).append('<div id="loader" style="background-color:white;position:absolute;width:100%;height:100%;left:0; top:0;z-index:100;opacity:0.75;"><div class="loader">Loading...</div></div>');
        },
        removeLoader: function () {
            var _self = this;
            window.setTimeout(function () {
                $(_self.element).find('#loader').remove();
            }, 500);
        }

    };

    $.fn[componentName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "component_" + componentName)) {
                $.data(this, "component_" + componentName, new Component(this, options));
            } else {
                console.log($.data(this, "component_" + componentName));
                $.data(this, "component_" + componentName).reload();
            }
        });
    };

})(jQuery, window, document);
