var TILELAYERS = [
    ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 'OpenStreetMap'],
    ['https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 'Humanitarian'],
    ['https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', 'Wikimedia'],
    ['https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', 'Outdoors'],
    ['https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', 'OSM-Fr'],
    ['https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.jpg', 'Toner'],
    ['https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', 'Transport'],
    ['https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', 'OpenCycleMap'],
    ['https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', 'Watercolor'],
    ['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 'OpenTopoMap'],
    ['https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', 'OpenRiverboatMap'],
    ['https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', 'OSM - Deutschland'],
    ['https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', 'Terrain'],
    ['https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', 'ÖPNVKarte'],
    ['https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 'CyclOSM'],
];

L.K.MapCompare = L.Evented.extend({

    initialize: function () {
        this._maps = [];
        for (var i = 0; i < arguments.length; i++) {
            this.register(arguments[i]);
        }
    },

    register: function (map) {
        if (this._maps.indexOf(map) !== -1) return;
        this._maps.push(map);
        map.on('moveend', this.moveend, this);
    },

    moveend: function (e) {
        if (!this._master) {
            this._master = e.target;
            this.propagate();
            this._master = null;
        }
    },

    propagate: function () {
        for (var map of this._maps) {
            if (map === this._master) continue;
            map.setView(this._master.getCenter(), this._master.getZoom(), {animate: false});
        }
    }

});


L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        var container = L.DomUtil.create('div', 'map-compare-container'),
            title = L.DomUtil.create('h3', '', container),
            self = this,
            params = {
                tms: false,
                url: '',
                suggestedUrl: L.K.Config.project.compareUrl,
                active: false,
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            };
        title.innerHTML = 'Map compare';
        if (TILELAYERS.indexOf(L.K.Config.project.compareUrl) === -1) TILELAYERS.unshift([L.K.Config.project.compareUrl, 'Default']);
        var tilelayer, otherMap,
            init = function () {
                var container = L.DomUtil.create('div', 'map-compare', document.body);
                container.id = 'mapCompare';
                otherMap = L.map(container.id, {attributionControl: false});
                tilelayer = L.tileLayer(L.K.Config.project.compareUrl, params).addTo(otherMap);
                new L.K.MapCompare(self, otherMap);
            };
        var builder = new L.K.FormBuilder(params, [
            ['active', {handler: L.K.Switch, label: 'Active (ctrl+alt+C)'}],
            ['tms', {handler: L.K.Switch, label: 'TMS format.'}],
            ['suggestedUrl', {handler: 'Select', helpText: 'Choose a map in the list…', selectOptions: TILELAYERS}],
            ['url', {handler: 'BlurInput', helpText: '… or set a custom URL template.'}]
        ], {id: 'compare-form'});
        // TODO vertical / horizontal view
        var toggle = function () {
            if (params.active) {
                if (!otherMap) init();
                L.DomUtil.addClass(document.body, 'map-compare-on');
                otherMap.invalidateSize();
                this.invalidateSize();
            } else {
                L.DomUtil.removeClass(document.body, 'map-compare-on');
                this.invalidateSize();
            }
        };
        var setUrl = function () {
            if (!otherMap) init();
            tilelayer.setUrl(params.url || params.suggestedUrl);
        };
        builder.on('postsync', function (e) {
            if (e.helper.field === 'active') {
                L.bind(toggle, this)();
            } else if (e.helper.field === 'url' || e.helper.field === 'suggestedUrl') {
                setUrl();
            }
        }, this);
        container.appendChild(builder.build());
        this.sidebar.addTab({
            label: 'Compare',
            className: 'compare',
            content: container
        });
        this.sidebar.rebuild();
        var commandCallback = function () {
            params.active = !params.active;
            L.bind(toggle, this)();
            builder.fetchAll();
        };
        this.commands.add({
            keyCode: L.K.Keys.C,
            ctrlKey: true,
            altKey: true,
            callback: commandCallback,
            context: this,
            name: 'Map compare: toggle view'
        });
        this.commands.add({
            callback: function () { this.sidebar.open('.compare'); },
            context: this,
            name: 'Map compare: configure'
        });
    });
});
