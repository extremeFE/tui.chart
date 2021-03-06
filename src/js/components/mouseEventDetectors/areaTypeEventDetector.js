/**
 * @fileoverview AreaTypeEventDetector is mouse event detector for line type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var MouseEventDetectorBase = require('./mouseEventDetectorBase');
var zoomMixer = require('./zoomMixer');
var AreaTypeDataModel = require('./areaTypeDataModel');

var AREA_DETECT_DISTANCE_THRESHHOLD = 50;

var AreaTypeEventDetector = tui.util.defineClass(MouseEventDetectorBase, /** @lends AreaTypeEventDetector.prototype */ {
    /**
     * AreaTypeEventDetector is mouse event detector for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeEventDetector
     * @private
     * @extends MouseEventDetectorBase
     */
    init: function(params) {
        MouseEventDetectorBase.call(this, params);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        /**
         * whether zoomable or not
         * @type {boolean}
         */
        this.zoomable = params.zoomable;

        if (this.zoomable) {
            tui.util.extend(this, zoomMixer);
            this._initForZoom(params.zoomable);
        }
    },

    /**
     * Create areaTypeDataModel from seriesItemBoundsData for mouse event detector.
     * @param {Array.<object>} seriesItemBoundsDatum - series item bounds datum
     * @override
     */
    onReceiveSeriesData: function(seriesItemBoundsDatum) {
        var seriesItemBoundsData = this.seriesItemBoundsData;
        var seriesCount = this.seriesCount;

        if (seriesItemBoundsData.length === seriesCount) {
            seriesItemBoundsData = [];
        }

        seriesItemBoundsData.push(seriesItemBoundsDatum);

        if (seriesItemBoundsData.length === seriesCount) {
            this.dataModel = new AreaTypeDataModel(seriesItemBoundsData);
        }

        if (this.zoomable) {
            this._showTooltipAfterZoom();
        }
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     * @override
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);

        return this.dataModel.findData(layerPosition, AREA_DETECT_DISTANCE_THRESHHOLD);
    },

    /**
     * Find data by client position for zoomable
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findDataForZoomable: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);

        return this.dataModel.findData(layerPosition);
    },

    /**
     * Get first model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getFirstData: function(index) {
        return this.dataModel.getFirstData(index);
    },

    /**
     * Get last model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getLastData: function(index) {
        return this.dataModel.getLastData(index);
    },

    /**
     * Show tooltip.
     * @param {object} foundData - model data
     * @private
     */
    _showTooltip: function(foundData) {
        this.eventBus.fire('showTooltip', foundData);
    },

    /**
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.eventBus.fire('hideTooltip', this.prevFoundData);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var dragMoseupResult, foundData;

        MouseEventDetectorBase.prototype._onMousemove.call(this, e);

        foundData = this._findData(e.clientX, e.clientY);

        if (this.zoomable) {
            dragMoseupResult = this._isAfterDragMouseup();
        }

        if (dragMoseupResult || !this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this._showTooltip(foundData);
        } else if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouseout.
     * @private
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this._hideTooltip();
        }

        MouseEventDetectorBase.prototype._onMouseout.call(this);
    }
});

function areaTypeEventDetectorFactory(params) {
    return new AreaTypeEventDetector(params);
}

areaTypeEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = areaTypeEventDetectorFactory;
