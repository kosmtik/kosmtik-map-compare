var TILELAYERS = [
    ['http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 'OpenStreetMap'],
    ['http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 'Humanitarian'],
    ['http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', 'Outdoors'],
    ['http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', 'OSM-Fr'],
    ['http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', 'OSM Roads'],
    ['http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png', 'Landscape'],
    ['http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', 'Toner'],
    ['http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', 'Transport'],
    ['http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', 'MapQuest Open'],
    ['http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', 'OpenCycleMap'],
    ['http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', 'Watercolor'],
    ['http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png', 'hikebikemap'],
    ['http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=982c82cc765f42cf950a57de0d891076', 'Lyrk'],
    ['http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', 'OSM monochrome'],
    ['http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', 'Hydda'],
    ['http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 'OpenTopoMap'],
    ['http://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', 'OpenRiverboatMap'],
    ['http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', 'OSM - Deutschland'],
];


L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        var container = L.DomUtil.create('div', 'map-compare-container'),
            title = L.DomUtil.create('h3', '', container),
            params = {
                tms: false,
                url: '',
                suggestedUrl: L.K.Config.project.compareUrl,
                active: false,
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            };
        title.innerHTML = 'Map compare';
        var tilelayer, otherMap,
            init = function () {
                var container = L.DomUtil.create('div', 'map-compare', document.body);
                container.id = 'mapCompare';
                otherMap = L.map(container.id, {attributionControl: false});
                tilelayer = L.tileLayer(L.K.Config.project.compareUrl, params).addTo(otherMap);
                new L.Hash(otherMap);
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
            tilelayer.setUrl(params.url || params.suggestedUrl);
        };
        builder.on('synced', function (e) {
            if (e.field === 'active') {
                L.bind(toggle, this)();
            } else if (e.field === 'url' || e.field === 'suggestedUrl') {
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
            callback: function () {this.sidebar.open('.compare');},
            context: this,
            name: 'Map compare: configure'
        });
    });
});
